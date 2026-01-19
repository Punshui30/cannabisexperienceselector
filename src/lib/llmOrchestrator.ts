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
 * 3. Runs Engine 3 times with STRONG variation -> EngineResult[]
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
            r1.reasoning = `Primary interpretation: Optimized for your stated goals with balanced constraint enforcement.`;
            engineResults.push(r1);
            console.log('Primary Blend Cultivars:', r1.cultivars?.map(c => c.name).join(', '));
        }

        // ---------------------------------------------------------
        // BLEND 2: SECONDARY EMPHASIS (STRONG Effect Priority Shift)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Secondary Blend (STRONG priority shift)');
        const intent2 = { ...engineIntent };

        // STRONG SHIFT: Completely invert top 2 effects + boost body
        const effects2 = Object.entries(intent2.targetEffects)
            .sort(([, a], [, b]) => Math.abs((b as number)) - Math.abs((a as number)));

        if (effects2.length >= 2) {
            const [primary, secondary] = effects2;
            const temp = intent2.targetEffects[primary[0] as keyof typeof intent2.targetEffects];
            intent2.targetEffects[primary[0] as keyof typeof intent2.targetEffects] =
                intent2.targetEffects[secondary[0] as keyof typeof intent2.targetEffects];
            intent2.targetEffects[secondary[0] as keyof typeof intent2.targetEffects] = temp;
            console.log(`  STRONG SHIFT: Swapped ${primary[0]} ↔ ${secondary[0]}`);
        }

        // Boost body/relaxation to shift cultivar class
        intent2.targetEffects.body = Math.min(0.8, (intent2.targetEffects.body || 0) + 0.4);
        console.log(`  Boosted body to ${intent2.targetEffects.body}`);

        const results2 = engineGenerate(seed, intent2);
        if (results2 && results2.length > 0) {
            const r2 = results2[0];
            r2.id = `blend-secondary-${Date.now()}`;
            r2.name = "Alternative: " + (r2.name || "Blend");
            r2.reasoning = `Secondary emphasis: Prioritized ${effects2[1]?.[0] || 'balance'} over ${effects2[0]?.[0] || 'primary'}, increased body effect for grounding.`;
            engineResults.push(r2);
            console.log('Secondary Blend Cultivars:', r2.cultivars?.map(c => c.name).join(', '));
        }

        // ---------------------------------------------------------
        // BLEND 3: CONTEXTUAL VARIANT (STRONG Constraint Changes)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Contextual Blend (STRONG context shift)');
        const intent3 = { ...engineIntent };

        // Ensure context and constraints exist
        if (!intent3.context) {
            intent3.context = { timeOfDay: 'afternoon', tolerance: 'medium', experience: 'intermediate' };
        }
        if (!intent3.constraints) {
            intent3.constraints = { maxAnxiety: 0.3 };
        }

        // STRONG SHIFT 1: Dramatically relax anxiety constraint
        const originalAnxiety = intent3.constraints.maxAnxiety || 0.3;
        intent3.constraints.maxAnxiety = Math.min(0.7, originalAnxiety + 0.35);
        console.log(`  STRONG SHIFT: Anxiety ${originalAnxiety.toFixed(2)} → ${intent3.constraints.maxAnxiety.toFixed(2)}`);

        // STRONG SHIFT 2: Major time shift
        const originalTime = intent3.context.timeOfDay || 'afternoon';
        intent3.context.timeOfDay = originalTime === 'morning' ? 'night' :
            originalTime === 'afternoon' ? 'evening' :
                originalTime === 'evening' ? 'morning' : 'afternoon';
        console.log(`  Time shift: ${originalTime} → ${intent3.context.timeOfDay}`);

        // STRONG SHIFT 3: Reduce energy, boost creativity (terpene bias)
        if (intent3.targetEffects.energy && intent3.targetEffects.energy > 0.3) {
            intent3.targetEffects.energy = Math.max(0, intent3.targetEffects.energy - 0.4);
            intent3.targetEffects.creativity = Math.min(0.9, (intent3.targetEffects.creativity || 0) + 0.5);
            console.log(`  Terpene bias: Reduced energy, boosted creativity`);
        }

        const results3 = engineGenerate(seed, intent3);
        if (results3 && results3.length > 0) {
            const r3 = results3[0];
            r3.id = `blend-contextual-${Date.now()}`;
            r3.name = "Experimental: " + (r3.name || "Blend");
            r3.reasoning = `Contextual variant: Relaxed anxiety constraint (${originalAnxiety.toFixed(2)} → ${intent3.constraints.maxAnxiety.toFixed(2)}), shifted to ${intent3.context.timeOfDay} profile, emphasized creativity over raw energy.`;
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
    const rawText = seed.text || "";
    const previewText = rawText.length > 30 ? rawText.substring(0, 30) + "..." : rawText;

    // Default Script
    let script = `Analyzing request: "${previewText}". Calibrating terpene ratios...`;
    console.log('PARSE_INTENT: Generated script:', script);

    // 2. Keyword Topic Detection
    const topicMatch = text.match(/(sleep|pain|focus|energy|anxiety|relax|diesel|haze|kush|purple|creative|social)/i);

    if (topicMatch) {
        const topic = topicMatch[0].toLowerCase();
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
