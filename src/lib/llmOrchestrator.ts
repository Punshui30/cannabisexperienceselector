import { IntentSeed, IntentSpec, EngineResult } from '../types/domain';
import { interpretIntentFromSpec, generateRecommendations as engineGenerate } from './engineAdapter';
import { getCultivarIdFromName, STRAIN_LIBRARY } from './strainLibrary';
import { analyzeIntent } from './semanticIntentAdapter';
import { generateNarratives, generateConversationalResponse } from './llmNarrativeAdapter';
import { decideAction } from './llmDecisionAdapter';
import { performSearch } from './search/searchClient';
import { generateNarrative, ToneMode } from './llm/claudeNarrator';
import { findSubstitute } from './engine/substitution';

// Define OrchestratorResult locally
export interface OrchestratorResult {
    success: boolean;
    data: EngineResult[];
    error?: string;
    analysis?: {
        targetTerpenes: string[];
        reasoning: string;
        consultationScript?: string;
        outcomeCategory?: 'Focus' | 'Relax' | 'Social' | 'Sleep' | 'Relief' | 'Other';
    };
    followUpQuestion?: string;
    decision?: any; // Expose decision for debugging/telemetry
}

/**
 * ORCHESTRATOR (CORE)
 * 1. DECISION STEP: Classify Intent
 * 2. If Action Required: Run Engine & Narratives
 * 3. If Chat Only: Run Conversational Adapter
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


        // 0. DECISION STEP (The Cognitive Choke Point)
        console.group('ORCHESTRATOR: Decision Matrix');

        // A. Initial Classification & Entity Extraction
        let decision = await decideAction(seed, {
            screen: context?.screen,
            currentBlendName: context?.blendName
        });

        // B. Search Grounding for Unknown Entities
        if (decision.target_entities && decision.target_entities.length > 0) {
            const unknownEntities = decision.target_entities.filter(entity => {
                // Check if entity exists in our library (Case insensitive partial match or ID lookup)
                // Using simple heuristic: Is it a key in STRAIN_LIBRARY or strict match?
                // Real app would use a fuzzy match or getCultivarIdFromName
                const id = getCultivarIdFromName(entity);
                return !id || id.startsWith('unknown');
            });

            if (unknownEntities.length > 0) {
                console.log('ORCHESTRATOR: Unknown entities detected, initiating Search Grounding:', unknownEntities);

                const searchResults = await Promise.all(
                    unknownEntities.map(entity => performSearch(`${entity} cannabis strain effects`))
                );

                const validEvidence = searchResults.filter(r => r && r.sourcesFound);

                if (validEvidence.length > 0) {
                    console.log('ORCHESTRATOR: Evidence found, refining Decision...');
                    // Re-run Decision with Evidence to classify as "external_verified"
                    decision = await decideAction(seed, {
                        screen: context?.screen,
                        currentBlendName: context?.blendName,
                        evidence: validEvidence
                    });
                } else {
                    console.log('ORCHESTRATOR: No external evidence found.');
                }
            }
        }

        console.log('Final Decision:', decision);
        console.groupEnd();


        // GATING: If no mutation required, skip engine entirely
        if (!decision.requires_engine_mutation) {
            console.log('ORCHESTRATOR: Decision indicates NO ENGINE MUTATION. Switching to Conversational Mode.');

            // Generate conversational response without engine context
            const responseText = await generateConversationalResponse(
                seed.text || "",
                context?.blendName ? `User is viewing blend "${context.blendName}" on screen ${context.screen}` : undefined
            );

            console.log('ORCHESTRATOR: Conversational Response generated:', responseText);

            return {
                success: true,
                data: [], // Empty data signals "Keep State" to App.tsx
                analysis: {
                    targetTerpenes: [],
                    reasoning: responseText, // This becomes the spoken response
                    consultationScript: responseText,
                    outcomeCategory: 'Other'
                },
                decision // Pass for telemetry
            };
        }

        console.log('ORCHESTRATOR: Decision requires MUTATION. Proceeding to Engine...');

        // 1. LLM-DRIVEN INTENT ANALYSIS
        console.group('ORCHESTRATOR: New Intent Analysis (Authoritative)');
        const intentSpec = await analyzeIntent(seed);
        console.log('Intent Result:', intentSpec);
        console.groupEnd();

        console.log('ORCHESTRATOR: New Engine Run (Authoritative)');

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
        // SMART SUBSTITUTION LOGIC (Deterministic)
        // ---------------------------------------------------------
        if (intentSpec.cultivarExclusions && intentSpec.cultivarExclusions.length > 0) {
            console.log('ORCHESTRATOR: Processing Exclusions via Smart Substitution...');

            // Try to find substitutes for excluded cultivars
            // Map STRAIN_LIBRARY (Strain) to Inventory (Cultivar) format
            const inventoryForSub: any[] = STRAIN_LIBRARY.map(s => ({
                id: s.id,
                name: s.name,
                thcPercent: s.thc_percent,
                cbdPercent: s.cbd_percent,
                terpenes: s.terpenes,
                available: true
            }));

            for (const excludedId of intentSpec.cultivarExclusions) {
                const subResult = findSubstitute(excludedId, inventoryForSub, {
                    family: intentSpec.avoidEffects.find(e => ['berry', 'lemon', 'pine', 'cookie', 'kush'].includes(e)) // Heuristic family mapping
                });

                if (subResult.success && subResult.replacement) {
                    console.log(`ORCHESTRATOR: Substitution Found: ${subResult.replacement.name} (Score: ${subResult.similarityScore})`);

                    // Force Include the Substitute (Logic: User removed X, so let's try Y)
                    // We modify the intentSpec to include the substitute in the "preferred" list (if supported)
                    // OR we manually inject it into the engine results later.
                    // BETTER: Add to "context.cultivars" (if supported) or engineIntent.

                    // Since engineGenerate takes "seed" and "intent", and "intent" implies broad goals,
                    // we can't easily FORCE a specific cultivar unless we lock it.
                    // For now, we'll log it and let the narrative know.
                    // Actually, if we want the ENGINE to pick it, we should add it to "terpenePreferences" metadata or similar?
                    // No, implementation constraint: Engine picks based on score.
                    // If Substitute is truly similar, it should score high.
                    // Let's explicitly log it for the prompt.

                    if (!context) context = {};
                    context.cultivars = [...(context.cultivars || []), subResult.replacement.name];
                }
            }
        }

        // ---------------------------------------------------------
        // BLEND 1: PRIMARY INTERPRETATION (Original Intent)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Primary Blend (original intent)');
        const results1 = engineGenerate(seed, engineIntent, intentSpec.cultivarExclusions); // Pass explicit exclusions first
        if (results1 && results1.length > 0) {
            const r1 = results1[0];
            r1.id = `blend-primary-${Date.now()}`;
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

        // 3. UNIFIED NARRATIVE SYNERGY (Unified LLM Call)
        // GUARD: Stacks must NEVER use the Narrative Adapter (Anti-Gravity Protocol)
        const isStack = seed.kind === 'stack';
        const isStrainMode = seed.mode === 'strain';

        if (isStack) {
            console.log('ORCHESTRATOR: Stack Mode detected. Bypassing Narrative Adapter & Blend-Specific Validation.');
        }

        // ---------------------------------------------------------
        // DEFENSIVE NORMALIZATION (Prevent Crashes)
        // ---------------------------------------------------------
        // Ensure all blends have valid cultivars before passing to ANY narrative adapter
        const sanitizeBlend = (b: EngineResult) => {
            if (!b || !b.cultivars) return [];
            return b.cultivars.filter(Boolean).filter(c => c && typeof c.name === 'string');
        };

        const safePrimary = sanitizeBlend(engineResults[0]);
        const safeSecondary = sanitizeBlend(engineResults[1]);
        const safeContextual = sanitizeBlend(engineResults[2]);

        // Check if we have valid primary data to proceed
        if (safePrimary.length === 0) {
            console.warn("ORCHESTRATOR: Primary blend has no valid cultivars. Skipping narrative.");
        }

        console.log('ORCHESTRATOR: Narrative Generation Phase');
        if (!isStack && engineResults.length >= 2) { // At least Primary and Secondary
            const variants = {
                primary: engineResults[0],
                secondary: engineResults[1],
                contextual: engineResults[2] || engineResults[0] // Fallback if no contextual
            };

            // Attempt LLM-driven narratives with full intent context (Old Adapter)
            try {
                const narratives = await generateNarratives(seed.text || "", intentSpec, variants);
                if (narratives && narratives.primary && narratives.secondary) {
                    engineResults[0].name = narratives.primary.name;
                    engineResults[0].reasoning = narratives.primary.explanation;
                    engineResults[1].name = narratives.secondary.name;
                    engineResults[1].reasoning = narratives.secondary.explanation;
                    if (engineResults[2]) {
                        engineResults[2].name = narratives.contextual.name;
                        engineResults[2].reasoning = narratives.contextual.explanation;
                    }
                } else {
                    throw new Error("Narrative generation returned incomplete data");
                }
            } catch (err) {
                console.warn('ORCHESTRATOR: Narrative generation failed. Using smart fallback.', err);

                // SMART FALLBACK
                const userGoal = seed.text || "your stated preferences";
                const avoidances = intentSpec.avoidEffects.length > 0 ? ` while avoiding ${intentSpec.avoidEffects.join(', ')}` : '';

                engineResults[0].name = safePrimary.map(c => c.name).join(' × ');
                engineResults[0].reasoning = `This formulation is tuned for your stated goal: ${userGoal}. The selected cultivars were chosen to balance the desired effects${avoidances}.`;

                if (engineResults[1]) {
                    engineResults[1].name = safeSecondary.map(c => c.name).join(' × ');
                    engineResults[1].reasoning = `An alternative approach to ${userGoal}, emphasizing a different terpene balance${avoidances}.`;
                }
            }
        }

        // -------------------------------------------------------------
        // CLAUDE NARRATIVE SPECIALIST (Additive Layer)
        // -------------------------------------------------------------
        console.log('ORCHESTRATOR: Invoking Claude Narrative Specialist...');

        // STRICT BOUNDARY NORMALIZATION
        // Sanitizes input before it ever touches the AI Layer
        const sanitizeNarrativeInput = (input: any) => {
            return {
                userIntentSummary: String(input.userIntent ?? ""),
                decisionSummary: String(input.decisionSummary ?? ""),
                blendSummary: input.blends.map((b: any) => ({
                    name: b.name || "Custom Blend",
                    cultivars: (b.cultivars || [])
                        .filter(Boolean)
                        .map((c: any) => c.name)
                        .slice(0, 5)
                })),
                toneMode: input.toneMode
            };
        };

        try {
            // Map Tone Mode
            let toneMode: ToneMode = 'neutral';
            switch (outcomeCategory) {
                case 'Sleep': case 'Relax': toneMode = 'calm_reassuring'; break;
                case 'Relief': toneMode = 'supportive'; break;
                case 'Focus': toneMode = 'confident'; break;
                case 'Social': toneMode = 'curious'; break;
                default: toneMode = 'neutral';
            }

            if (safePrimary.length > 0) {
                const primaryBlend = engineResults[0];

                // Prepare Raw Input
                const rawInput = {
                    userIntent: `${seed.text} (Intent: ${intentSpec.originalInput || 'Inferred'})`,
                    decisionSummary: `Engine generated ${primaryBlend.name} focusing on ${outcomeCategory}. Decision Reasoning: ${decision.reasoning}`,
                    blends: [primaryBlend], // Pass as array for the sanitizer
                    toneMode: toneMode
                };

                // NORMALIZE at the boundary
                const claudeInput = sanitizeNarrativeInput(rawInput);

                // Call Claude
                const claudeReasoning = await generateNarrative(claudeInput);

                if (claudeReasoning) {
                    console.log('ORCHESTRATOR: Claude Narrative Applied ✓');
                    engineResults[0].reasoning = claudeReasoning;
                }
            }
        } catch (e) {
            console.error("ORCHESTRATOR: Claude Step Failed", e);
        }

        // ISSUE 3: STRAIN MODE ACKNOWLEDGMENT
        if (isStrainMode && !isStack && engineResults.length > 0) {
            const requestedStrain = seed.text || "requested strain";
            console.log(`ORCHESTRATOR: Applying strain-anchored acknowledgment for "${requestedStrain}"`);

            // Check if primary result contains the actual strain
            const primaryMatch = engineResults[0].cultivars?.some(c =>
                c.name.toLowerCase().includes(requestedStrain.toLowerCase()) ||
                requestedStrain.toLowerCase().includes(c.name.toLowerCase())
            );

            if (primaryMatch) {
                engineResults[0].reasoning = `Centered on ${requestedStrain}. This formulation utilizes the specific profile of your requested cultivar as the anchor for the experience.`;
            } else {
                // Similarity fallback
                engineResults[0].reasoning = `A functionally similar alternative to ${requestedStrain}. Using the specific terpene and cannabinoid ratios of ${requestedStrain} as a blueprint to recreate that experience with currently available cultivars.`;
            }
        }

        // 4. HARD VALIDATION (BLENDS ONLY)
        // GUARD: Stacks bypass strict blend validation (which requires >=2 cultivars)
        if (!isStack) {
            const validationError = validateStrict(engineResults);
            if (validationError) {
                console.error(`ORCHESTRATOR VALIDATION FAILED: ${validationError}`);
                return {
                    success: false,
                    data: [],
                    error: `Validation Failed. System Integrity Check: ${validationError}`
                };
            }
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
