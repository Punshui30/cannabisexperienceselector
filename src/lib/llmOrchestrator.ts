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
        // BLEND 1: PRIMARY INTERPRETATION (Original Intent)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Primary Blend (original intent)');
        const results1 = engineGenerate(seed, engineIntent);
        if (results1 && results1.length > 0) {
            const r1 = results1[0];
            r1.id = `blend-primary-${Date.now()}`;
            r1.name = r1.name || "Primary Blend";
            engineResults.push(r1);
            console.log('Primary Blend Cultivars:', r1.cultivars?.map(c => c.name).join(', '));
        }

        // ---------------------------------------------------------
        // BLEND 2: SECONDARY EMPHASIS (Shift Effect Priorities)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Secondary Blend (shifted priorities)');
        const intent2 = { ...engineIntent };

        // Shift priorities among expressed goals
        if (intent2.targetEffects.energy > 0.5 && intent2.targetEffects.focus > 0.3) {
            // If both energy and focus, make this focus-forward
            const temp = intent2.targetEffects.energy;
            intent2.targetEffects.energy = intent2.targetEffects.focus;
            intent2.targetEffects.focus = temp;
            console.log('  Shifted: Energy ↔ Focus');
        } else if (intent2.targetEffects.mood > 0.5 && intent2.targetEffects.body > 0.3) {
            // If both mood and body, swap them
            const temp = intent2.targetEffects.mood;
            intent2.targetEffects.mood = intent2.targetEffects.body;
            intent2.targetEffects.body = temp;
            console.log('  Shifted: Mood ↔ Body');
        } else {
            // Boost secondary effect
            const effects = Object.entries(intent2.targetEffects)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
            if (effects.length >= 2) {
                const [primary, secondary] = effects;
                intent2.targetEffects[secondary[0] as keyof typeof intent2.targetEffects] += 0.3;
                console.log(`  Boosted: ${secondary[0]} (+0.3)`);
            }
        }

        const results2 = engineGenerate(seed, intent2);
        if (results2 && results2.length > 0) {
            const r2 = results2[0];
            r2.id = `blend-secondary-${Date.now()}`;
            r2.name = "Alternative: " + (r2.name || "Blend");
            engineResults.push(r2);
            console.log('Secondary Blend Cultivars:', r2.cultivars?.map(c => c.name).join(', '));
        }

        // ---------------------------------------------------------
        // BLEND 3: CONTEXTUAL VARIANT (Adjust Context/Constraints)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Contextual Blend (adjusted context)');
        const intent3 = { ...engineIntent };

        // Adjust context
        const timeShift: Record<string, string> = {
            'morning': 'afternoon',
            'afternoon': 'evening',
            'evening': 'night',
            'night': 'morning'
        };
        intent3.context.timeOfDay = timeShift[intent3.context.timeOfDay] || 'evening';

        // Adjust tolerance
        const toleranceShift: Record<string, string> = {
            'low': 'medium',
            'medium': 'high',
            'high': 'medium'
        };
        intent3.context.tolerance = toleranceShift[intent3.context.tolerance] || 'high';

        // Relax anxiety constraint slightly
        if (intent3.constraints.maxAnxiety) {
            intent3.constraints.maxAnxiety = Math.min(0.5, intent3.constraints.maxAnxiety + 0.15);
        }

        console.log(`  Context: ${engineIntent.context?.timeOfDay || 'afternoon'} → ${intent3.context.timeOfDay}`);
        console.log(`  Tolerance: ${engineIntent.context?.tolerance || 'medium'} → ${intent3.context.tolerance}`);
        console.log(`  Max Anxiety: ${engineIntent.constraints?.maxAnxiety || 0.3} → ${intent3.constraints.maxAnxiety}`);

        const results3 = engineGenerate(seed, intent3);
        if (results3 && results3.length > 0) {
            const r3 = results3[0];
            r3.id = `blend-contextual-${Date.now()}`;
            r3.name = "Experimental: " + (r3.name || "Blend");
            engineResults.push(r3);
            console.log('Contextual Blend Cultivars:', r3.cultivars?.map(c => c.name).join(', '));
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
    console.log('PARSE_INTENT: Generated script:', script);

    // 2. Keyword Topic Detection
    const topicMatch = text.match(/(sleep|pain|focus|energy|anxiety|relax|diesel|haze|kush|purple|creative|social)/i);

    if (topicMatch) {
        const topic = topicMatch[0].toLowerCase();
        // Enhance script
        script = `Detected focus on ${topic} in "${previewText}". Adjusting chemotypes for optimal synergy.`;
        console.log('PARSE_INTENT: Enhanced script with topic:', script);
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
    console.log('PARSE_INTENT: Final spec with consultationScript:', spec.consultationScript);

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
