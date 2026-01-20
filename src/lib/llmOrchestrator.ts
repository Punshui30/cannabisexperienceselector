import { IntentSeed, IntentSpec, EngineResult } from '../types/domain';
import { interpretIntentFromSpec, generateRecommendations as engineGenerate } from './engineAdapter';
import { getCultivarIdFromName, STRAIN_LIBRARY } from './strainLibrary';
import { generateIntentBoundName, generateVariantNarrative } from './llmOrchestrator_helpers';

// Define OrchestratorResult locally
export interface OrchestratorResult {
    success: boolean;
    data: EngineResult[];
    error?: string;
    analysis?: {
        targetTerpenes: string[];
        reasoning: string;
        outcomeCategory?: 'Focus' | 'Relax' | 'Social' | 'Sleep' | 'Relief' | 'Other';
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
export async function processIntent(
    seed: IntentSeed,
    context?: {
        screen?: string;
        blendName?: string;
        blendConfig?: any;
        cultivars?: string[];
    },
    mode: string = 'blend-engine'
): Promise<OrchestratorResult> {
    try {
        console.log(`ORCHESTRATOR: Starting Process`);
        console.log(`  Input: "${seed.text}"`);
        console.log(`  Context:`, context?.blendName ? `${context.blendName} (${context.screen})` : "General");

        // 1. LOCAL INTENT PARSING (Standardized)
        console.log('ORCHESTRATOR: Parsing Intent Locally...');
        const intentSpec = parseIntentLocally(seed);
        console.log('ORCHESTRATOR: Intent Analyzed', intentSpec);

        // Derive Outcome Category for downstream consumers (REFINED)
        let outcomeCategory: 'Focus' | 'Relax' | 'Social' | 'Sleep' | 'Relief' | 'Other' = 'Other';
        const searchPool = (seed.text + " " + (intentSpec.targetEffects?.join(" ") || "")).toLowerCase();

        if (['focus', 'energy', 'creative', 'work', 'clarity', 'study'].some(k => searchPool.includes(k))) outcomeCategory = 'Focus';
        else if (['sleep', 'sedation', 'night', 'insomnia', 'rest'].some(k => searchPool.includes(k))) outcomeCategory = 'Sleep';
        else if (['pain', 'relief', 'medical', 'ache', 'sore', 'physical'].some(k => searchPool.includes(k))) outcomeCategory = 'Relief';
        else if (['social', 'party', 'fun', 'conversation', 'friends'].some(k => searchPool.includes(k))) outcomeCategory = 'Social';
        else if (['relax', 'calm', 'chill', 'unwind', 'stress'].some(k => searchPool.includes(k))) outcomeCategory = 'Relax';

        // 2. ENGINE EXECUTION (Generate 3 Options with Diversity)
        const engineIntent = interpretIntentFromSpec(intentSpec);
        console.log('ORCHESTRATOR: Running Engine with Spec...');

        const engineResults: EngineResult[] = [];
        const usedCultivarIds = new Set<string>(intentSpec.cultivarExclusions || []); // Start with user-defined exclusions

        // ---------------------------------------------------------
        // BLEND 1: PRIMARY INTERPRETATION (Original Intent)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Primary Blend (original intent)');
        const results1 = engineGenerate(seed, engineIntent, intentSpec.cultivarExclusions); // Pass explicit exclusions first
        if (results1 && results1.length > 0) {
            const r1 = results1[0];
            r1.id = `blend-primary-${Date.now()}`;

            // INTENT-BOUND NAMING: Generate name from user's stated goal
            r1.name = generateIntentBoundName(seed.text, intentSpec.targetEffects, 'primary');

            // PER-VARIANT NARRATIVE: Build user-specific reasoning for PRIMARY
            r1.reasoning = generateVariantNarrative({
                userInput: seed.text,
                variantType: 'primary',
                targetEffects: intentSpec.targetEffects,
                avoidEffects: intentSpec.avoidEffects,
                context,
                cultivars: r1.cultivars?.map(c => c.name) || []
            });

            engineResults.push(r1);
            console.log('Primary Blend:', r1.name, '|', r1.cultivars?.map(c => c.name).join(', '));

            // Track used cultivar IDs for exclusion
            r1.cultivars?.forEach(c => {
                const cultivarId = getCultivarIdFromName(c.name) || (c as any).id;
                if (cultivarId) {
                    usedCultivarIds.add(cultivarId);
                    console.log(`  ✓ Excluding cultivar ID: ${cultivarId} (${c.name})`);
                }
            });
        }

        // ---------------------------------------------------------
        // BLEND 2: SECONDARY EMPHASIS (STRONG Effect Priority Shift)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Secondary Blend (STRONG priority shift)');
        const intent2 = { ...engineIntent };

        // STRONG SHIFT: Completely invert top 2 effects + boost body
        const effects2 = Object.entries(intent2.targetEffects)
            .sort(([, a], [, b]) => Math.abs((b as number)) - Math.abs((a as number)));

        let shiftDesc = "balanced profile";
        if (effects2.length >= 2) {
            const [primary, secondary] = effects2;
            const temp = intent2.targetEffects[primary[0] as keyof typeof intent2.targetEffects];
            intent2.targetEffects[primary[0] as keyof typeof intent2.targetEffects] =
                intent2.targetEffects[secondary[0] as keyof typeof intent2.targetEffects];
            intent2.targetEffects[secondary[0] as keyof typeof intent2.targetEffects] = temp;
            shiftDesc = `swapping ${primary[0]} for ${secondary[0]}`;
            console.log(`  STRONG SHIFT: Swapped ${primary[0]} ↔ ${secondary[0]}`);
        }

        // Boost body/relaxation to shift cultivar class
        intent2.targetEffects.body = Math.min(0.8, (intent2.targetEffects.body || 0) + 0.4);
        console.log(`  Boosted body to ${intent2.targetEffects.body}`);

        // Pass exclusions to force diversity
        const exclusions2 = Array.from(usedCultivarIds);
        console.log(`  Excluding ${exclusions2.length} cultivars:`, exclusions2);
        const results2 = engineGenerate(seed, intent2, exclusions2);
        if (results2 && results2.length > 0) {
            const r2 = results2[0];
            r2.id = `blend-secondary-${Date.now()}`;

            // INTENT-BOUND NAMING: Generate name from SECONDARY variant's intent
            r2.name = generateIntentBoundName(seed.text, intentSpec.targetEffects, 'secondary');

            // PER-VARIANT NARRATIVE: Build reasoning specific to SECONDARY variant
            r2.reasoning = generateVariantNarrative({
                userInput: seed.text,
                variantType: 'secondary',
                targetEffects: intentSpec.targetEffects,
                avoidEffects: intentSpec.avoidEffects,
                variantShift: shiftDesc,
                cultivars: r2.cultivars?.map(c => c.name) || []
            });

            engineResults.push(r2);
            console.log('Secondary Blend:', r2.name, '|', r2.cultivars?.map(c => c.name).join(', '));

            // Track additional used cultivars
            r2.cultivars?.forEach(c => {
                const cultivarId = getCultivarIdFromName(c.name) || (c as any).id;
                if (cultivarId) {
                    usedCultivarIds.add(cultivarId);
                    console.log(`  ✓ Excluding cultivar ID: ${cultivarId} (${c.name})`);
                }
            });
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
        let terpeneChange = "";
        if (intent3.targetEffects.energy && intent3.targetEffects.energy > 0.3) {
            intent3.targetEffects.energy = Math.max(0, intent3.targetEffects.energy - 0.4);
            intent3.targetEffects.creativity = Math.min(0.9, (intent3.targetEffects.creativity || 0) + 0.5);
            terpeneChange = ", and emphasizing creativity over raw energy";
            console.log(`  Terpene bias: Reduced energy, boosted creativity`);
        }

        // Pass exclusions to force further diversity
        const exclusions3 = Array.from(usedCultivarIds);
        console.log(`  Excluding ${exclusions3.length} cultivars:`, exclusions3);
        const results3 = engineGenerate(seed, intent3, exclusions3);
        if (results3 && results3.length > 0) {
            const r3 = results3[0];
            r3.id = `blend-contextual-${Date.now()}`;

            // INTENT-BOUND NAMING: Generate name from CONTEXTUAL variant's intent
            r3.name = generateIntentBoundName(seed.text, intentSpec.targetEffects, 'contextual');

            // PER-VARIANT NARRATIVE: Build reasoning specific to CONTEXTUAL variant
            r3.reasoning = generateVariantNarrative({
                userInput: seed.text,
                variantType: 'contextual',
                targetEffects: intentSpec.targetEffects,
                avoidEffects: intentSpec.avoidEffects,
                contextShift: { timeOfDay: intent3.context.timeOfDay, anxietyRelaxed: true },
                terpeneChange,
                cultivars: r3.cultivars?.map(c => c.name) || []
            });

            engineResults.push(r3);
            console.log('Contextual Blend Cultivars:', r3.cultivars?.map(c => c.name).join(', '));
        }

        // FALLBACK: If engine returns nothing
        if (engineResults.length === 0) {
            return { success: false, data: [], error: 'Engine returned no results.' };
        }

        // DIVERSITY VALIDATION: Check for duplicate blends (ID-based)
        const uniqueBlendSignatures = new Set(
            engineResults.map(r =>
                r.cultivars?.map(c => {
                    const id = getCultivarIdFromName(c.name) || (c as any).id;
                    return id;
                }).sort().join(',')
            )
        );

        if (uniqueBlendSignatures.size < engineResults.length) {
            console.warn('⚠️ WARNING: Duplicate blends detected!');
            console.log('  Unique signatures:', uniqueBlendSignatures.size, '/ Total blends:', engineResults.length);
            console.log('  This indicates exclusions may not be working or inventory is too small.');
            console.log('  Signatures:', Array.from(uniqueBlendSignatures));
        } else {
            console.log(`✓ DIVERSITY CHECK PASSED: ${uniqueBlendSignatures.size} unique blends generated`);
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
                reasoning: intentSpec.consultationScript || "Analysis complete.",
                outcomeCategory: outcomeCategory
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
    const rawText = seed.text || "";

    // 1. TOPIC & SENTIMENT ANALYSIS
    const topicMatch = text.match(/(sleep|pain|focus|energy|anxiety|relax|diesel|haze|kush|purple|creative|social|relief)/i);
    const topic = topicMatch ? topicMatch[0].toLowerCase() : null;

    // 2. NEGATIVE STRAIN DETECTION (Explicit Exclusions)
    const exclusions: string[] = [];
    const negativeStrainMatch = text.match(/(don't like|not a fan of|avoid|bad experience|exclude|remove|no|without|makes me edgy|makes me anxious|makes me paranoid|don't want|rather not have)\s+([a-z0-9\s#]+)/i);

    if (negativeStrainMatch) {
        const potentialStrain = negativeStrainMatch[2].trim();
        // Check if this matches a known strain
        const foundId = getCultivarIdFromName(potentialStrain);
        if (foundId) {
            exclusions.push(foundId);
            console.log(`PARSE_INTENT: Explicitly excluding ${potentialStrain} (ID: ${foundId})`);
        } else {
            // Fuzzy match for common names if explicit lookup fails
            const fuzzyMatch = STRAIN_LIBRARY.find(s => potentialStrain.toLowerCase().includes(s.name.toLowerCase()));
            if (fuzzyMatch) {
                exclusions.push(fuzzyMatch.id);
                console.log(`PARSE_INTENT: Fuzzy excluded ${fuzzyMatch.name} (from "${potentialStrain}")`);
            }
        }
    }

    // 3. GENERATE NON-MIRRORED CONSULTATION SCRIPT
    let script = "";
    if (exclusions.length > 0) {
        const strainObj = STRAIN_LIBRARY.find(s => s.id === exclusions[0]);
        script = `Understood. I've removed ${strainObj?.name} from the active formulation parameters. Finding a cleaner outcome that maintains your intended profile without any unwanted variables.`;
    } else if (topic === 'pain' || topic === 'relief') {
        script = "Got it. I'm focusing on physical comfort and systemic relief. Re-balancing the terpene ratios to prioritize a smoothing effect on the body.";
    } else if (topic === 'focus' || topic === 'energy') {
        script = "Understood. Prioritizing mental clarity and sustained energy. Selecting chemotypes with sharp, stimulating profiles for daytime endurance.";
    } else if (topic === 'sleep' || topic === 'relax') {
        script = "Understood. Calibrating for deep relaxation and a quiet transition. Emphasizing heavier sedating terpenes for a restorative finish.";
    } else if (topic) {
        script = `I've adjusted the engine logic to emphasize those characteristic ${topic} notes while ensuring the final blend stays aligned with your stated primary goal.`;
    } else {
        script = "I'm re-balancing the active logic layer based on your feedback. Fine-tuning the synergy for a smoother, more effective result.";
    }

    // 4. CONSTRUCT SPEC
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
        reasoning: `Local Analysis: ${topic ? `Targeting ${topic}` : 'General refinement'}. ${exclusions.length ? `Excluding ${exclusions.length} strains.` : ''}`,
        originalInput: rawText,
        consultationScript: script,
        cultivarExclusions: exclusions
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
    else if (text.includes('pain') || text.includes('relief') || text.includes('ache') || text.includes('sore')) {
        spec.targetEffects = ["pain relief", "physical comfort"];
        spec.terpenePreferences.include.push("Caryophyllene", "Myrcene", "Humulene");
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
