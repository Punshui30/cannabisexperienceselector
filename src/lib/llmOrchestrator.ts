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

        // 2. ENGINE EXECUTION
        const engineIntent = interpretIntentFromSpec(intentSpec);
        console.log('ORCHESTRATOR: Running Engine with Spec...');
        const engineResults = engineGenerate(input, engineIntent);

        if (!engineResults || engineResults.length === 0) {
            return { success: false, data: [], error: 'Engine returned no results based on these constraints.' };
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
                reasoning: intentSpec.reasoning
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

    // Default: Balanced/Hybrid
    const spec: IntentSpec = {
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
        originalInput: seed.text || ""
    };

    // 1. Sleep / Sedation
    if (text.match(/sleep|insomnia|bed|night|tired|rest|couch/)) {
        spec.targetEffects = ["sleep", "relaxation", "pain_relief"];
        spec.constraints.timeOfDay = "night";
        spec.terpenePreferences.include.push("Myrcene", "Linalool");
    }

    // 2. Focus / Energy / Work
    else if (text.match(/focus|work|study|energy|day|morning|alert|creative|active/)) {
        spec.targetEffects = ["focus", "energy", "creativity"];
        spec.avoidEffects.push("sedation", "couch_lock");
        spec.constraints.timeOfDay = "morning";
        spec.terpenePreferences.include.push("Limonene", "Pinene");
    }

    // 3. Social / Party
    else if (text.match(/social|party|friends|talk|laugh|fun|happy/)) {
        spec.targetEffects = ["social", "mood", "energy"];
        spec.avoidEffects.push("sedation");
        spec.constraints.timeOfDay = "evening";
        spec.terpenePreferences.include.push("Limonene");
    }

    // 4. Pain / Relief
    else if (text.match(/pain|hurt|ache|relief|body|sore|medic/)) {
        spec.targetEffects = ["pain_relief", "body", "relaxation"];
        spec.terpenePreferences.include.push("Caryophyllene", "Myrcene");
    }

    // 5. Anxiety / Calm
    else if (text.match(/anxiety|stress|calm|relax|chill|nervous|unwind/)) {
        spec.targetEffects = ["relaxation", "calm", "mood"];
        spec.avoidEffects.push("anxiety", "paranoia", "energy");
        spec.terpenePreferences.include.push("Linalool");
    }

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
