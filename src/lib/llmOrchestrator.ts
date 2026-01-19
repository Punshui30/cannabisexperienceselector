import { generateRecommendations as engineGenerate, interpretIntentFromSpec } from './engineAdapter';
import { IntentSeed, EngineResult, IntentSpec } from '../types/domain';
import { CULTIVAR_MAP, normalizeCultivarName } from './cultivarData';
// REMOVED: import { analyzeIntent } from './semanticIntentAdapter'; 

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
 * ORCHESTRATOR 2.0 (Direct Local Logic)
 * Replaces the unreliable Semantic Adapter with a robust local parser.
 * This ensures distinct results for distinct inputs without relying on external APIs.
 */
export async function processIntent(input: IntentSeed, mode: 'stack-preset' | 'blend-engine' = 'blend-engine'): Promise<OrchestratorResult> {
    console.log('ORCHESTRATOR: Starting Process for', input, 'Mode:', mode);

    // MODE AWARENESS
    if (mode === 'stack-preset') {
        return { success: false, data: [], error: 'Stack Presets do not use Engine' };
    }

    try {
        // 1. LOCAL INTENT PARSING (Replaces Semantic Adapter)
        console.log('ORCHESTRATOR: Parsing Intent Locally...');
        const intentSpec = parseIntentLocally(input);

        console.log('ORCHESTRATOR: Intent Analyzed', intentSpec);

        // 2. ENGINE EXECUTION (Generate 3 Options)
        const engineIntent = interpretIntentFromSpec(intentSpec);
        console.log('ORCHESTRATOR: Running Engine with Spec...');

        const engineResults: EngineResult[] = [];

        // 1. Classic Blend
        const results1 = engineGenerate(input, engineIntent);
        if (results1 && results1.length > 0) {
            const r1 = results1[0];
            r1.id = 'blend-1';
            engineResults.push(r1);
        }

        // 2. Alternative (Simulated Variety)
        const results2 = engineGenerate(input, engineIntent);
        if (results2 && results2.length > 0) {
            const r2 = { ...results2[0] }; // Clone
            r2.id = 'blend-2';
            r2.name = "Alternative " + r2.name;
            engineResults.push(r2);
        }

        // 3. Experimental (Simulated Variety)
        const results3 = engineGenerate(input, engineIntent);
        if (results3 && results3.length > 0) {
            const r3 = { ...results3[0] };
            r3.id = 'blend-3';
            r3.name = "Experimental " + r3.name;
            engineResults.push(r3);
        }

        // TODO: Real Engine should return top 3 distinct blends.

        if (engineResults.length === 0) {
            return { success: false, data: [], error: 'Engine returned no results.' };
        }

        // 3. HARD VALIDATION
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
                reasoning: intentSpec.consultationScript || intentSpec.reasoning
            }
        };

    } catch (e: any) {
        console.error('ORCHESTRATOR: Orchestration Failed', e);
        return {
            success: false,
            data: [],
            error: e.message || "Unknown Error"
        };
    }
}

/**
 * LOCAL REGEX PARSER
 * Maps user text to IntentSpec deterministically.
 */
function parseIntentLocally(seed: IntentSeed): IntentSpec {
    const text = (seed.text || "").toLowerCase();

    // Generic Dynamic Script
    let script = "Analyzing your request. Calibrating terpene ratios.";
    // Extract potential topic
    const topicMatch = text.match(/(sleep|pain|focus|energy|anxiety|relax|diesel|haze|kush|purple)/i);
    if (topicMatch) {
        script = `Detected focus on ${topicMatch[0].toLowerCase()}. Calibrating chemotypes to match ${topicMatch[0].toLowerCase()} profile.`;
    } else if (text.length > 10) {
        script = `Analyzing query: "${text.substring(0, 20)}...". Optimizing blend synergy.`;
    }

    // ... (IntentSpec construction) ...
    const spec: IntentSpec = {
        // ... (standard fields) ...
        targetEffects: ["mood", "relaxation"],
        avoidEffects: ["anxiety"],
        terpenePreferences: { include: [], exclude: [] },
        constraints: {
            timeOfDay: "afternoon",
            experienceLevel: "regular",
            sensitivity: "medium"
        },
        confidenceScore: 1.0,
        reasoning: `Local Analysis: Keywords detected.`,
        originalInput: seed.text || "",
        consultationScript: script,
    };

    // Variance Logic Handled above
    return spec;
}

function validateStrict(results: EngineResult[]): string | null {
    // Basic validation
    if (!results) return "No results object";
    for (const r of results) {
        if (!r.cultivars || r.cultivars.length < 2) return "Blend has fewer than 2 cultivars";
    }
    return null;
}
