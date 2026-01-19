import { IntentSeed, IntentSpec, EngineResult } from '../types/domain';
import { interpretIntentFromSpec, generateRecommendations as engineGenerate } from './engineAdapter';

// Define OrchestratorResult locally
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
 * ORCHESTRATOR (CORE)
 * 1. Takes Raw User Input (IntentSeed)
 * 2. Parses it locally (Regex/Keyword) -> IntentSpec
 * 3. Runs Engine 3 times with variation -> EngineResult[]
 * 4. Returns OrchestratorResult
 */
export async function processIntent(seed: IntentSeed, mode: string = 'blend-engine'): Promise<OrchestratorResult> {
    try {
        console.log(`ORCHESTRATOR: Starting Process for`, seed);

        // 1. LOCAL INTENT PARSING (Standardized)
        console.log('ORCHESTRATOR: Parsing Intent Locally...');
        const intentSpec = parseIntentLocally(seed);
        console.log('ORCHESTRATOR: Intent Analyzed', intentSpec);

        // 2. ENGINE EXECUTION (Generate 3 Options)
        const engineIntent = interpretIntentFromSpec(intentSpec);
        console.log('ORCHESTRATOR: Running Engine with Spec...');

        const engineResults: EngineResult[] = [];

        // ---------------------------------------------------------
        // BLEND 1: CLASSIC (Optimal)
        // ---------------------------------------------------------
        const results1 = engineGenerate(seed, engineIntent);
        if (results1 && results1.length > 0) {
            const r1 = results1[0];
            r1.id = `blend-primary-${Date.now()}`;
            // Use optimal engine output
            engineResults.push(r1);
        }

        // ---------------------------------------------------------
        // BLEND 2: ALTERNATIVE (Forced Variety - Balanced)
        // ---------------------------------------------------------
        const results2 = engineGenerate(seed, engineIntent);
        if (results2 && results2.length > 0) {
            const r2 = { ...results2[0] }; // Clone
            r2.id = `blend-alt-${Date.now()}`;
            r2.name = "Alternative: " + r2.name;

            // Force Ratio Shift to Ensure Visual Difference
            // Target: 33/33/33 Split
            if (r2.cultivars && r2.cultivars.length >= 2) {
                // Normalize to equal parts
                const count = r2.cultivars.length;
                const equalShare = Number((1.0 / count).toFixed(2));
                r2.cultivars.forEach((c: any) => c.ratio = equalShare);

                // Fix rounding error on last one
                if (count > 0) {
                    const sum = r2.cultivars.reduce((acc: number, c: any) => acc + c.ratio, 0);
                    const diff = 1.0 - sum;
                    r2.cultivars[count - 1].ratio += diff;
                }
            }
            engineResults.push(r2);
        }

        // ---------------------------------------------------------
        // BLEND 3: EXPERIMENTAL (Forced Variety - Dominant)
        // ---------------------------------------------------------
        const results3 = engineGenerate(seed, engineIntent);
        if (results3 && results3.length > 0) {
            const r3 = { ...results3[0] };
            r3.id = `blend-exp-${Date.now()}`;
            r3.name = "Experimental: " + r3.name;

            // Force Ratio Shift to Ensure Visual Difference
            // Target: 80% Dominant
            if (r3.cultivars && r3.cultivars.length >= 2) {
                // First strain gets 80%, rest share 20%
                const count = r3.cultivars.length;
                r3.cultivars[0].ratio = 0.80;
                const remainder = 0.20 / (count - 1);
                for (let i = 1; i < count; i++) {
                    r3.cultivars[i].ratio = remainder;
                }
            }
            engineResults.push(r3);
        }

        // FALLBACK: If engine returns nothing
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
                reasoning: intentSpec.consultationScript || "Analysis complete."
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
 * Maps user text to IntentSpec.
 */
function parseIntentLocally(seed: IntentSeed): IntentSpec {
    const text = (seed.text || "").toLowerCase();

    // 1. Generic Dynamic Script (Quote User)
    // Truncate safely
    const rawText = seed.text || "";
    const previewText = rawText.length > 30 ? rawText.substring(0, 30) + "..." : rawText;

    // Default Script
    let script = `Analyzing request: "${previewText}". Calibrating terpene ratios...`;

    // 2. Keyword Topic Detection
    const topicMatch = text.match(/(sleep|pain|focus|energy|anxiety|relax|diesel|haze|kush|purple|creative|social)/i);

    if (topicMatch) {
        const topic = topicMatch[0].toLowerCase();
        // Enhance script
        script = `Detected focus on ${topic} in "${previewText}". Adjusting chemotypes for optimal synergy.`;
    }

    // 3. Construct Spec
    const spec: IntentSpec = {
        targetEffects: ["mood", "relaxation"], // Defaults
        avoidEffects: ["anxiety"],
        terpenePreferences: { include: [], exclude: [] },
        constraints: {
            timeOfDay: "afternoon",
            experienceLevel: "regular",
            sensitivity: "medium"
        },
        confidenceScore: 1.0,
        reasoning: `Local Analysis: Keywords detected.`,
        originalInput: rawText,
        consultationScript: script,
    };

    // 4. Apply Keyword Logic (Simple Rules)
    if (text.includes('sleep') || text.includes('insomnia')) {
        spec.targetEffects = ["sleep", "sedation"];
        spec.constraints.timeOfDay = "night";
        spec.terpenePreferences.include.push("Myrcene", "Linalool");
    }
    else if (text.includes('energy') || text.includes('focus') || text.includes('work')) {
        spec.targetEffects = ["energy", "focus"];
        spec.constraints.timeOfDay = "morning";
        spec.terpenePreferences.include.push("Limonene", "Pinene");
    }
    else if (text.includes('anxiety') || text.includes('stress')) {
        spec.targetEffects = ["calm", "relaxation"];
        spec.avoidEffects.push("paranoia");
        spec.terpenePreferences.include.push("Linalool", "Caryophyllene");
    }

    return spec;
}

function validateStrict(results: EngineResult[]): string | null {
    if (!results) return "No results object";
    for (const r of results) {
        if (!r.cultivars || r.cultivars.length < 2) return "Blend has fewer than 2 cultivars";
    }
    return null;
}
