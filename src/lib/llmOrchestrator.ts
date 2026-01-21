import { IntentSeed, IntentSpec, EngineResult } from '../types/domain';
import { interpretIntentFromSpec, generateRecommendations as engineGenerate } from './engineAdapter';
import { getCultivarIdFromName, STRAIN_LIBRARY } from './strainLibrary';
import { analyzeIntent } from './semanticIntentAdapter';
import { generateNarratives, generateConversationalResponse } from './llmNarrativeAdapter';
import { decideAction } from './llmDecisionAdapter';
import { performSearch } from './search/searchClient';
import { generateNarrative, ToneMode } from './llm/geminiNarrator';
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

                // Check for Tavily degradation
                if (searchResults.some((r: any) => r?.tavily_failed)) {
                    console.log('[SEARCH_DEGRADED] Tavily search failed, proceeding with internal heuristics only');
                }

                if (validEvidence.length > 0) {
                    console.log('ORCHESTRATOR: Evidence found, refining Decision...');
                    // Re-run Decision with Evidence to classify as "external_verified"
                    decision = await decideAction(seed, {
                        screen: context?.screen,
                        currentBlendName: context?.blendName,
                        evidence: validEvidence
                    });
                } else {
                    console.warn('[SEARCH_FALLBACK_APPLIED] No external evidence found. Proceeding with internal heuristic inference.');
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

        // ---------------------------------------------------------
        // ANCHOR CONSTRAINT DEFINITION (The "Iron Laws")
        // ---------------------------------------------------------
        const anchorConstraints = {
            avoidEffects: intentSpec.avoidEffects || [],
            cultivarExclusions: new Set<string>(intentSpec.cultivarExclusions || []),
            safetyThresholds: {
                maxAnxiety: intentSpec.avoidEffects.includes('anxiety') ? 0.1 : (intentSpec.avoidEffects.includes('paranoia') ? 0.05 : undefined),
                maxParanoia: intentSpec.avoidEffects.includes('paranoia') ? 0.05 : undefined // Strict paranoia lock
            }
        };

        console.log('ORCHESTRATOR: Anchor Constraints Established', anchorConstraints);

        // 2. ENGINE EXECUTION (Generate 3 Options with Diversity)
        const engineIntent = interpretIntentFromSpec(intentSpec);
        console.log('ORCHESTRATOR: Running Engine with Spec...');

        const engineResults: EngineResult[] = [];
        const usedCultivarIds = new Set<string>(intentSpec.cultivarExclusions || []);

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
                // Mocking COA data since it's not in the main library yet
                thcPercent: 22.5,
                cbdPercent: 0.1,
                terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
                available: true
            }));

            for (const excludedId of intentSpec.cultivarExclusions) {
                const subResult = findSubstitute(excludedId, inventoryForSub, {
                    family: intentSpec.avoidEffects.find(e => ['berry', 'lemon', 'pine', 'cookie', 'kush'].includes(e)) // Heuristic family mapping
                });

                if (subResult.success && subResult.replacement) {
                    console.log(`ORCHESTRATOR: Substitution Found: ${subResult.replacement.name} (Score: ${subResult.similarityScore})`);
                    if (!context) context = {};
                    context.cultivars = [...(context.cultivars || []), subResult.replacement.name];
                }
            }
        }

        /**
         * HELPER: HARD CONSTRAINT VALIDATOR
         * Returns true if blend complies with anchors, false if rejection required.
         */
        const validateCompliance = (blend: EngineResult, contextLabel: string): boolean => {
            // 1. Check Avoided Effects (Heuristic check on vibeTags or logic)
            // This is hard to check perfectly without chem data, but we can check vibeTags
            if (!blend.cultivars) return false;

            for (const c of blend.cultivars) {
                const id = getCultivarIdFromName(c.name) || (c as any).id;
                if (anchorConstraints.cultivarExclusions.has(id)) {
                    console.warn(`VALIDATION FAILURE (${contextLabel}): Contains explicitly excluded cultivar ${c.name}`);
                    return false;
                }
            }

            // Future: real chemistry check against maxAnxiety
            return true;
        };

        // ---------------------------------------------------------
        // BLEND 1: PRIMARY INTERPRETATION (Original Intent)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Primary Blend (original intent)');
        // BOUNDED REGENERATION LOGIC (Primary)
        let results1: EngineResult[] = [];
        let r1Attempts = 0;
        const r1Exclusions = Array.from(anchorConstraints.cultivarExclusions);

        while (r1Attempts < 3) {
            results1 = engineGenerate(seed, engineIntent, r1Exclusions);
            if (results1.length > 0) {
                if (validateCompliance(results1[0], `Primary (Attempt ${r1Attempts + 1})`)) {
                    break; // Success
                } else {
                    console.warn(`Primary Attempt ${r1Attempts + 1} failed validation. enforcing exclusions.`);
                    results1[0].cultivars?.forEach(c => {
                        const id = getCultivarIdFromName(c.name);
                        if (id) r1Exclusions.push(id);
                    });
                }
            }
            r1Attempts++;
        }

        if (results1 && results1.length > 0) {
            const r1 = results1[0];
            // Final check or fallback
            if (validateCompliance(r1, "Primary Final")) {
                r1.id = `blend-primary-${Date.now()}`;
                r1.role = 'primary'; // DETERMINISTIC ROLE ASSIGNMENT
                engineResults.push(r1);
                console.log('Primary Blend:', r1.name, '|', r1.cultivars?.map(c => c.name).join(', '));

                r1.cultivars?.forEach(c => {
                    const cultivarId = getCultivarIdFromName(c.name) || (c as any).id;
                    if (cultivarId) usedCultivarIds.add(cultivarId);
                });
            } else {
                console.error("CRITICAL: Primary blend failed validation after max attempts.");
            }
        }

        // ---------------------------------------------------------
        // BLEND 2: SECONDARY EMPHASIS (STRONG Effect Priority Shift)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Secondary BlendWith ANCHOR ENFORCEMENT');
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

        // Boost body/relaxation only if not conflicting with anchors?
        // Body boost is generally safe unless "sedation" is avoided.
        if (!anchorConstraints.avoidEffects.includes('sedation')) {
            intent2.targetEffects.body = Math.min(0.8, (intent2.targetEffects.body || 0) + 0.4);
            console.log(`  Boosted body to ${intent2.targetEffects.body}`);
        }

        // ENFORCE ANCHORS: Reset constraints to original strictness
        if (anchorConstraints.safetyThresholds.maxAnxiety !== undefined) {
            intent2.constraints.maxAnxiety = anchorConstraints.safetyThresholds.maxAnxiety;
            console.log(`  Anchor Locked: maxAnxiety reset to ${intent2.constraints.maxAnxiety}`);
        }

        // Pass exclusions to force diversity
        const exclusions2 = Array.from(usedCultivarIds);
        // Add original exclusions just in case
        intentSpec.cultivarExclusions?.forEach(e => exclusions2.push(e));

        // BOUNDED REGENERATION LOGIC (Secondary)
        let results2: EngineResult[] = [];
        let r2Attempts = 0;

        while (r2Attempts < 3) {
            results2 = engineGenerate(seed, intent2, exclusions2);
            if (results2.length > 0) {
                // Check uniqueness against Primary
                const isUnique = !results2[0].cultivars?.some(c => usedCultivarIds.has(getCultivarIdFromName(c.name) || ''));

                if (validateCompliance(results2[0], `Secondary (Attempt ${r2Attempts + 1})`) && isUnique) {
                    break;
                } else {
                    console.warn(`Secondary Attempt ${r2Attempts + 1} failed validation/uniqueness.`);
                    results2[0].cultivars?.forEach(c => {
                        const id = getCultivarIdFromName(c.name);
                        if (id) exclusions2.push(id);
                    });
                }
            } else {
                break; // Engine exhausted
            }
            r2Attempts++;
        }

        if (results2 && results2.length > 0 && validateCompliance(results2[0], "Secondary Final")) {
            const r2 = results2[0];
            r2.id = `blend-secondary-${Date.now()}`;
            r2.role = 'alternative'; // DETERMINISTIC ROLE ASSIGNMENT
            engineResults.push(r2);
            console.log('Secondary Blend:', r2.name, '|', r2.cultivars?.map(c => c.name).join(', '));
            r2.cultivars?.forEach(c => {
                const cultivarId = getCultivarIdFromName(c.name) || (c as any).id;
                if (cultivarId) usedCultivarIds.add(cultivarId);
            });
        }

        // ---------------------------------------------------------
        // BLEND 3: CONTEXTUAL VARIANT (STRONG Constraint Changes)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Contextual Blend with ANCHOR ENFORCEMENT');
        const intent3 = { ...engineIntent };

        if (!intent3.context) intent3.context = { timeOfDay: 'afternoon', tolerance: 'medium', experience: 'intermediate' };
        if (!intent3.constraints) intent3.constraints = { maxAnxiety: 0.3 };

        // STRONG SHIFT 1: Anxiety Relaxation (CONDITIONAL)
        // Only relax if NOT an anchor
        const originalAnxiety = intent3.constraints.maxAnxiety || 0.3;
        if (anchorConstraints.safetyThresholds.maxAnxiety === undefined) {
            intent3.constraints.maxAnxiety = Math.min(0.7, originalAnxiety + 0.35);
            console.log(`  Shift Allowed: Anxiety relaxed ${originalAnxiety.toFixed(2)} → ${intent3.constraints.maxAnxiety.toFixed(2)}`);
        } else {
            console.log(`  Shift BLOCKED: Anxiety locked at ${originalAnxiety.toFixed(2)} by Anchor.`);
        }

        // STRONG SHIFT 2: Time shift (Generally safe exploration)
        const originalTime = intent3.context.timeOfDay || 'afternoon';
        intent3.context.timeOfDay = originalTime === 'morning' ? 'night' :
            originalTime === 'afternoon' ? 'evening' :
                originalTime === 'evening' ? 'morning' : 'afternoon';
        console.log(`  Time shift: ${originalTime} → ${intent3.context.timeOfDay}`);

        // STRONG SHIFT 3: Terpene Bias
        if (intent3.targetEffects.energy && intent3.targetEffects.energy > 0.3) {
            intent3.targetEffects.energy = Math.max(0, intent3.targetEffects.energy - 0.4);
            intent3.targetEffects.creativity = Math.min(0.9, (intent3.targetEffects.creativity || 0) + 0.5);
        }

        const exclusions3 = Array.from(usedCultivarIds);
        // Add original exclusions just in case
        intentSpec.cultivarExclusions?.forEach(e => exclusions3.push(e));

        // BOUNDED REGENERATION LOGIC (Contextual)
        let results3: EngineResult[] = [];
        let r3Attempts = 0;

        while (r3Attempts < 3) {
            results3 = engineGenerate(seed, intent3, exclusions3);
            if (results3.length > 0) {
                const isUnique = !results3[0].cultivars?.some(c => usedCultivarIds.has(getCultivarIdFromName(c.name) || ''));

                if (validateCompliance(results3[0], `Contextual (Attempt ${r3Attempts + 1})`) && isUnique) {
                    break;
                } else {
                    console.warn(`Contextual Attempt ${r3Attempts + 1} failed validation/uniqueness.`);
                    results3[0].cultivars?.forEach(c => {
                        const id = getCultivarIdFromName(c.name);
                        if (id) exclusions3.push(id);
                    });
                }
            } else {
                break;
            }
            r3Attempts++;
        }

        if (results3 && results3.length > 0 && validateCompliance(results3[0], "Contextual Final")) {
            const r3 = results3[0];
            r3.id = `blend-contextual-${Date.now()}`;
            r3.role = 'contextual'; // DETERMINISTIC ROLE ASSIGNMENT
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
        console.log('ORCHESTRATOR: Generating Tier-1 Deterministic Narratives...');

        /**
         * HELPER: SANITIZE BLEND
         */
        const sanitizeBlend = (b: EngineResult) => {
            if (!b || !b.cultivars) return [];
            return b.cultivars.filter(Boolean).filter(c => c && typeof c.name === 'string');
        };

        /**
         * GENERATE DETERMINISTIC NARRATIVE
         * This function produces the final-quality output derived strictly from engine math.
         * It must NOT depend on any LLM.
         */
        const generateDeterministicNarrative = (
            result: EngineResult,
            role: 'primary' | 'alternative' | 'contextual',
            intent: IntentSpec,
            seedText: string
        ): { name: string, reasoning: string } => {
            const cultivars = result.cultivars || [];
            if (cultivars.length === 0) return { name: "Custom Blend", reasoning: "A specialized formulation." };

            // 1. Identify Roles (Anchor vs Support)
            // Assumes engine returns sorted by ratio desc, or we sort here.
            const sorted = [...cultivars].sort((a, b) => b.ratio - a.ratio);
            const anchor = sorted[0];
            const supports = sorted.slice(1);

            // 2. Derive Math Insight
            let insight = "";
            const requestedEffect = intent.targetEffects[0] || "balance"; // Heuristic main effect
            const avoid = intent.avoidEffects.length > 0 ? intent.avoidEffects[0] : null;

            if (role === 'primary') {
                if (anchor.name.toLowerCase().includes(seedText.toLowerCase())) {
                    insight = `This formulation is anchored by ${anchor.name} as requested, preserving its core profile while using ${supports.length > 0 ? supports[0].name : "supporting strains"} to modulate the experience.`;
                } else if (avoid) {
                    insight = `Constructed to bypass ${avoid} by selecting ${anchor.name} as a low-risk foundation.`;
                } else {
                    insight = `${anchor.name} drives the primary ${requestedEffect} effect, while ${supports.map(s => s.name).join(' and ')} broaden the terpene profile for a more complex finish.`;
                }
            } else if (role === 'alternative') {
                // Secondary usually flips effects
                const isBodyFocus = intent.targetEffects.some(e => ['body', 'sleep', 'relax', 'sedation', 'pain'].includes(e.toLowerCase()));
                insight = `An alternative approach to ${requestedEffect}. While the primary blend relies on ${isBodyFocus ? 'body' : 'cerebral'} effects, this shifts the focus toward a ${anchor.profile || 'distinct'} profile using ${anchor.name}.`;
            } else if (role === 'contextual') {
                // Contextual usually shifts constraints (Time/Anxiety)
                const time = intent.constraints.timeOfDay;
                const isAnxietyReduced = intent.avoidEffects.includes('anxiety') || intent.targetEffects.includes('calm');
                insight = `Optimized for ${time || 'specific context'}. adjusted to fit a ${isAnxietyReduced ? 'lower intensity' : 'different'} use-case, relying on ${anchor.name} for consistent output.`;
            }

            // 3. Construct Name
            const name = sorted.length <= 2
                ? sorted.map(c => c.name).join(' + ')
                : `${anchor.name} System`;

            return {
                name: name,
                reasoning: insight
            };
        };

        // APPLY TIER-1 NARRATIVE TO ALL RESULTS
        const safePrimary = sanitizeBlend(engineResults[0]);
        if (engineResults[0] && safePrimary.length > 0) {
            const t1 = generateDeterministicNarrative(engineResults[0], 'primary', intentSpec, seed.text || "");
            engineResults[0].name = t1.name;
            engineResults[0].reasoning = t1.reasoning;
            console.log("TIER-1 (Primary):", t1.reasoning);
        }

        if (engineResults[1]) {
            const t1 = generateDeterministicNarrative(engineResults[1], 'alternative', intentSpec, seed.text || "");
            engineResults[1].name = t1.name;
            engineResults[1].reasoning = t1.reasoning;
            console.log("TIER-1 (Alt):", t1.reasoning);
        }

        if (engineResults[2]) {
            const t1 = generateDeterministicNarrative(engineResults[2], 'contextual', intentSpec, seed.text || "");
            engineResults[2].name = t1.name;
            engineResults[2].reasoning = t1.reasoning;
            console.log("TIER-1 (Context):", t1.reasoning);
        }


        // -------------------------------------------------------------
        // TIER-2: GEMINI ENHANCEMENT (Timeout-Protected)
        // -------------------------------------------------------------
        // CRITICAL: Gemini NEVER blocks UI indefinitely
        // Max wait: 2 seconds
        // On timeout or failure: Return Tier-1 immediately

        if (!isStack && engineResults.length > 0) {
            console.log('ORCHESTRATOR: Attempting Gemini Enhancement (2s timeout)...');

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

                // Prepare Input for Gemini Enhancement
                const primaryBlend = engineResults[0];

                const geminiInput = {
                    tier1Narrative: {
                        name: primaryBlend.name || "Custom Blend",
                        reasoning: primaryBlend.reasoning || ""
                    },
                    userIntentSummary: `${seed.text} (Intent: ${intentSpec.originalInput || 'Inferred'})`,
                    decisionSummary: `Engine decision: ${decision.reasoning}`,
                    blendSummary: engineResults.map(b => ({
                        name: b.name || "Blend",
                        cultivars: (b.cultivars || []).map(c => c.name)
                    })),
                    toneMode: toneMode
                };

                // Race Gemini against timeout
                const enhancedText = await Promise.race([
                    generateNarrative(geminiInput),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
                ]);

                if (enhancedText) {
                    console.log(`[GEMINI_ENHANCED] Narrative enhancement applied ✓`);
                    engineResults[0].reasoning = enhancedText;
                } else {
                    console.log("[GEMINI_TIMEOUT_OR_FAILED] Using Tier-1 narrative (Gemini took >2s or failed)");
                }

            } catch (e) {
                console.error("[GEMINI_FAILED_USING_TIER1] Enhancement failed (non-fatal)", e);
                // Tier-1 remains unchanged
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

        // CRITICAL PATH COMPLETE: Return results to UI
        // Gemini either enhanced within 2s or Tier-1 is used
        console.log('[ORCHESTRATOR_V4_FINAL] Returning results to UI');

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
