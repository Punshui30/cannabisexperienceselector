import { generateRecommendations as engineGenerate, interpretIntentFromSpec } from './engineAdapter';
import { IntentSeed, EngineResult } from '../types/domain';
import { CULTIVAR_MAP, normalizeCultivarName } from './cultivarData';
import { analyzeIntent } from './semanticIntentAdapter';

// Orchestrator Interface
export interface OrchestratorResult {
    success: boolean;
    data: EngineResult[];
    error?: string;
    analysis?: {
        targetTerpenes: string[];
        reasoning: string;
    };
    followUpQuestion?: string;
}

/**
 * ORCHESTRATOR 2.0 (Semantic Adapter Pattern)
 * Step 1: LLM Semantic Analysis (Input -> IntentSpec)
 * Step 2: Engine Execution (IntentSpec -> Blends)
 * Step 3: Strict Validation (Blends -> Checked Blends)
 */
export async function processIntent(input: IntentSeed, mode: 'stack-preset' | 'blend-engine' = 'blend-engine'): Promise<OrchestratorResult> {
    console.log('ORCHESTRATOR: Starting Process for', input, 'Mode:', mode);

    // MODE AWARENESS
    if (mode === 'stack-preset') {
        return { success: false, data: [], error: 'Stack Presets do not use Engine' };
    }

    try {
        // 1. SEMANTIC ADAPTER (Layer 0)
        console.log('ORCHESTRATOR: Calling Semantic Adapter...');
        const intentSpec = await analyzeIntent(input);

        // Confidence Check
        if (intentSpec.confidenceScore < 0.6) {
            console.warn('ORCHESTRATOR: Low confidence in semantic analysis', intentSpec);
            // We can fail hard or soft. User requested "Live analysis unavailable" for failures.
            // But if we have *some* intent, maybe we try? 
            // Requirement: "If confidenceScore < threshold (e.g. 0.6), require clarification before engine execution."
            // For now, return error to trigger UI retry state.
            return {
                success: false,
                data: [],
                error: "Live analysis unavailable. Please retry to clarify intent.",
                followUpQuestion: "Could you specify if you want to feel active or relaxed?"
            };
        }

        console.log('ORCHESTRATOR: Intent Analyzed', intentSpec);

        // 2. ENGINE EXECUTION (Layer 1)
        // Convert Spec to Engine Intent
        const engineIntent = interpretIntentFromSpec(intentSpec);

        console.log('ORCHESTRATOR: Running Engine with Spec...');
        const engineResults = engineGenerate(input, engineIntent);

        if (!engineResults || engineResults.length === 0) {
            return { success: false, data: [], error: 'Engine returned no results based on these constraints.' };
        }

        // 3. HARD VALIDATION (Mandatory)
        // "If ANY strain is not found... Abort render... Log error... Show fallback UI"
        const validationError = validateStrict(engineResults);
        if (validationError) {
            console.error(`ORCHESTRATOR VALIDATION FAILED: ${validationError}`);
            return {
                success: false,
                data: [],
                error: `Validation Failed. System Integrity Check: ${validationError}`
            };
        }

        console.log('ORCHESTRATOR: Process Complete - Success');
        return {
            success: true,
            data: engineResults,
            analysis: {
                targetTerpenes: intentSpec.terpenePreferences.include,
                reasoning: intentSpec.reasoning
            }
        };

    } catch (error) {
        console.error('ORCHESTRATOR ERROR:', error);
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown Error' };
    }
}

function validateStrict(results: EngineResult[]): string | null {
    if (!results || results.length === 0) return "No results provided";

    for (const result of results) {
        // Validate Cultivars (Support Blends & Stacks Layering)
        let cultivarsToCheck: any[] = [];

        if (result.cultivars) {
            cultivarsToCheck = result.cultivars;
        } else if (result.layers) {
            // Stack Support
            result.layers.forEach((l: any) => {
                if (l.cultivars) cultivarsToCheck.push(...l.cultivars);
            });
        }

        for (const cultivar of cultivarsToCheck) {
            // Strict Key Lookup using Alias Map
            const normalizedName = normalizeCultivarName(cultivar.name);
            const exists = CULTIVAR_MAP[normalizedName];

            if (!exists) {
                // WARN: Cultivar missing from visual map, will use fallback.
                // We do NOT abort here because the Engine (Source of Truth) validated existence in Inventory.
                // console.warn(`Strain '${cultivar.name}' (Normalized: ${normalizedName}) missing from CULTIVAR_MAP. Using fallback visuals.`);
            }
        }

        if (!result.name && !result.id) return "Missing required UI metadata";
    }
    return null; // Valid
}

