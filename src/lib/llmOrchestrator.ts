import { IntentSeed, IntentSpec, EngineResult, EnginePhase } from '../types/domain';
import { InvocationContext, createContextBoundFlags } from '../types/context';
import { interpretIntentFromSpec, generateRecommendations as engineGenerate } from './engineAdapter';
import { getCultivarIdFromName, STRAIN_LIBRARY } from './strainLibrary';
import { analyzeIntent } from './semanticIntentAdapter';
import { generateConversationalResponse } from './llmNarrativeAdapter';
import { decideAction } from './llmDecisionAdapter';
import { performSearch } from './search/searchClient';
import { generateNarrative, ToneMode, EnhancedNarrative, analyzeImage } from './llm/strainmathNarrator';
import { findSubstitute } from './engine/substitution';

const VISION_ENABLED = false; // Feature Gate: Quarantine Vision Recognition

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
    context?: InvocationContext & {
        screen?: string;
        blendName?: string;
        blendConfig?: any;
        cultivars?: string[];
        recommendation?: any;
        onPhaseChange?: (phase: EnginePhase) => void;
    },
    mode: string = 'blend-engine'
): Promise<OrchestratorResult> {
    const updatePhase = (phase: EnginePhase) => {
        console.log(`[PHASE_CHANGE] ${phase}`);
        if (context?.onPhaseChange) {
            context.onPhaseChange(phase);
        }
    };

    try {
        updatePhase('intent');
        console.log(`ORCHESTRATOR: Starting Process`);
        console.log(`  Input: "${seed.text}"`);
        console.log(`  Context:`, context?.blendName ? `${context.blendName} (${context.screen})` : "General");

        // GLOBAL ASSISTANT CONTEXT GUARD — AUTHORITATIVE
        const contextFlags = createContextBoundFlags(context as InvocationContext, seed.text);
        console.log(`[CONTEXT_GUARD] bound=${contextFlags.contextBound} scope=${contextFlags.mutationScope} stackMode=${contextFlags.stackMode || false}`);

        // Apply context binding to orchestrator behavior
        if (contextFlags.contextBound && contextFlags.stackMode) {
            console.log(`[STACK_MODE] Activated for stack: ${contextFlags.activeStackId}`);
            // Force stack mode - will be used in intent classification
        }

        // 0. DECISION STEP (The Cognitive Choke Point)
        console.group('ORCHESTRATOR: Decision Matrix');

        // A. Initial Classification & Entity Extraction
        let decision = await decideAction(seed, {
            screen: context?.screen,
            currentBlendName: context?.blendName,
            contextBound: contextFlags.contextBound,
            stackMode: contextFlags.stackMode,
            activeEntityId: contextFlags.activeStackId
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

            let evidenceContext = "";
            if (unknownEntities.length > 0) {
                console.log('ORCHESTRATOR: Unknown entities detected, initiating Search Grounding:', unknownEntities);

                const searchResults = await Promise.all(
                    unknownEntities.map(entity => performSearch(`${entity} cannabis strain effects`))
                );

                const validEvidence = searchResults.filter(r => r && r.sourcesFound);

                // Construct textual context from evidence
                evidenceContext = validEvidence.length > 0
                    ? validEvidence.map(e => e ? `[SEARCH GROUNDING for ${e.query}]:\n${e.summary || JSON.stringify(e.evidence.slice(0, 2))}` : "").filter(Boolean).join("\n---\n")
                    : "";

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

            // Store evidence for the analyzer
            (seed as any)._evidenceContext = evidenceContext;
        }

        console.log('Final Decision:', decision);
        console.groupEnd();


        // GATING: If no mutation required, skip engine entirely
        if (!decision.requires_engine_mutation) {
            updatePhase('chat'); // terminal phase - UI must resolve immediately
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

        // STACK AUGMENTATION MODE - Special handling for stack mutations
        if (contextFlags.stackMode && contextFlags.activeStackId) {
            console.log(`[STACK_AUGMENTATION] Processing stack modification for: ${contextFlags.activeStackId}`);

            // Get the existing stack data from context
            const existingStack = context?.recommendation;
            if (!existingStack || existingStack.kind !== 'stack') {
                throw new Error('Stack augmentation requested but no valid stack found in context');
            }

            // Force intent to stack augmentation mode
            seed.text = `AUGMENT_STACK:${seed.text}`;
            seed.kind = 'stack';

            console.log('[STACK_AUGMENTATION] Forced stack augmentation mode');
        }

        // 0.5. IMAGE ANALYSIS (Vision Gated)
        if (seed.image && VISION_ENABLED) {
            console.log('ORCHESTRATOR: Image detected. Triggering Vision + Search synthesis...');
            const visionSummary = await analyzeImage(seed.image);
            if (visionSummary) {
                console.log('ORCHESTRATOR: Vision Summary extracted:', visionSummary);
                // Augment seed text with vision data for semantic analysis
                seed.text = `${seed.text}\n\n[ENVIRONMENTAL EVIDENCE]: ${visionSummary}`;
            }
        } else if (seed.image) {
            console.log('ORCHESTRATOR: Image detected. Vision pipeline is currently DISABLED.');
        }

        // 1. STRAIN MODE: Tavily-Assisted Reference Lookup
        let intentSpec: IntentSpec;
        let strainProfile: any = null;
        let strainLookupFailed = false;

        if (seed.mode === 'strain') {
            console.log('[STRAIN_MODE] tavily_lookup strain="' + seed.strainName + '" producer="' + (seed.grower || '') + '"');

            // Extract structured query from seed
            const strainQuery = seed.strainName;
            const producer = seed.grower;

            // Perform Tavily research lookup
            strainProfile = await performStrainLookup(strainQuery, producer);

            if (strainProfile) {
                // Convert Tavily results to internal structured data
                intentSpec = convertStrainProfileToIntentSpec(strainProfile, strainQuery, producer);

                console.log('[STRAIN_MODE] Successfully retrieved strain profile for:', strainQuery);
            } else {
                // Fallback: try without producer
                if (producer) {
                    console.log('[STRAIN_MODE] Retrying lookup without producer');
                    strainProfile = await performStrainLookup(strainQuery, null);
                    if (strainProfile) {
                        intentSpec = convertStrainProfileToIntentSpec(strainProfile, strainQuery, null);
                        console.log('[STRAIN_MODE] Success on retry without producer');
                    }
                }

                if (!strainProfile) {
                    // Could not find strain - mark as failed for proper handling
                    console.warn('[STRAIN_MODE] Strain lookup completely failed for:', strainQuery);
                    strainLookupFailed = true;

                    // Create a fallback intent spec for unknown strains
                    intentSpec = createFallbackStrainIntentSpec(strainQuery, producer);
                }
            }
        }

        // 2. LLM-DRIVEN INTENT ANALYSIS (for non-strain modes only)
        console.group('ORCHESTRATOR: Intent Analysis');

        if (!intentSpec && seed.mode !== 'strain') {
            // Inject search grounding evidence if available
            if ((seed as any)._evidenceContext) {
                seed.text = `${seed.text}\n\n[SEARCH GROUNDING EVIDENCE]:\n${(seed as any)._evidenceContext}`;
            }

            intentSpec = await analyzeIntent(seed, {
                blendName: context?.blendName,
                originalQuery: context?.userInput || seed.text,
                cultivars: context?.recommendation ?
                    (context.recommendation as any).cultivars?.map((c: any) => c.name) : []
            });
        }

        // Ensure we have an intentSpec for strain mode fallbacks
        if (!intentSpec) {
            console.error('[ORCHESTRATOR] No intent spec available for processing');
            throw new Error('Failed to create intent specification');
        }
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

        updatePhase('engine');

        // STRAIN MODE: Pass reference profile to engine
        if (seed.mode === 'strain' && strainProfile) {
            console.log('[STRAIN_MODE] Feeding reference profile to engine');

            // Add reference profile to intent for engine
            (intentSpec as any).referenceEffectProfile = intentSpec.targetEffects;
            (intentSpec as any).referenceEntourage = intentSpec.terpenePreferences.include;
            (intentSpec as any).referenceTiming = intentSpec.constraints.timeOfDay;
        }

        // STACK AUGMENTATION EXECUTION - Special handling for stack mutations
        if (decision.intent === 'augment_stack' && contextFlags.stackMode && context?.recommendation) {
            console.log('[STACK_AUGMENTATION] Executing stack augmentation');

            const existingStack = context.recommendation;
            if (existingStack.kind !== 'stack') {
                throw new Error('Stack augmentation requested but existing entity is not a stack');
            }

            // Create augmented stack by adding new layer(s)
            const augmentedStack = await createAugmentedStack(existingStack, intentSpec, seed.text);
            engineResults.push(augmentedStack);

            console.log('[STACK_AUGMENTATION] Stack augmented successfully');

            // Skip normal engine execution for stack augmentation
            return finalizeAugmentedStack(augmentedStack, intentSpec, outcomeCategory, context);
        }

        // 2. NORMAL ENGINE EXECUTION (Generate 3 Options with Diversity)
        const engineIntent = interpretIntentFromSpec(intentSpec);
        console.log('ORCHESTRATOR: Running Engine with Spec...');

        const engineResults: EngineResult[] = [];
        const usedCultivarIds = new Set<string>(intentSpec.cultivarExclusions || []);

        // ---------------------------------------------------------
        // SMART SUBSTITUTION LOGIC (Deterministic)
        // ---------------------------------------------------------
        if (intentSpec.cultivarExclusions && intentSpec.cultivarExclusions.length > 0) {
            const { INVENTORY } = await import('./inventory');

            for (const excludedId of intentSpec.cultivarExclusions) {
                const subResult = findSubstitute(excludedId, INVENTORY.cultivars, {
                    family: intentSpec.avoidEffects.find(e => ['berry', 'lemon', 'pine', 'cookie', 'kush'].includes(e))
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
            const rawResult = engineGenerate(seed, engineIntent, r1Exclusions);

            // Handle Stack Type mismatch (Engine returns a single object if in Stack Mode)
            if (rawResult && (rawResult as any).kind === 'stack') {
                console.log('ORCHESTRATOR: Engine returned a STACK. Bypassing blend iterations.');
                engineResults.push(rawResult as any);
                updatePhase('chat'); // terminal phase - UI must resolve immediately
                return {
                    success: true,
                    data: engineResults,
                    analysis: {
                        targetTerpenes: intentSpec.terpenePreferences.include || [],
                        reasoning: intentSpec.reasoning || "Balanced stack generated.",
                        consultationScript: intentSpec.consultationScript,
                        outcomeCategory: outcomeCategory
                    }
                };
            }

            results1 = rawResult as EngineResult[];
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
                if (validateCompliance(results3[0], `Contextual (Attempt ${r3Attempts + 1})`)) {
                    const isUnique = !results3[0].cultivars?.some(c => usedCultivarIds.has(getCultivarIdFromName(c.name) || ''));

                    // Try to be unique, but if we can't find anything unique after 2 tries, accept a duplicate
                    if (isUnique || r3Attempts > 1) {
                        break;
                    }
                }

                // If not unique or invalid, exclude and try again
                console.warn(`Contextual Attempt ${r3Attempts + 1} failed validation/uniqueness.`);
                results3[0].cultivars?.forEach(c => {
                    const id = getCultivarIdFromName(c.name);
                    if (id) exclusions3.push(id);
                });
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
            console.error('ORCHESTRATOR: Engine failed to find ANY results. Returning fallback blend.');
            updatePhase('validation'); // Terminal phase for fallback
            // Add a hard fallback blend from inventory
            const fallbackBlend = engineGenerate(seed, intent3, []);
            if (fallbackBlend.length > 0) {
                engineResults.push(fallbackBlend[0]);
            } else {
                updatePhase('chat'); // terminal phase - UI must resolve immediately
                return { success: false, data: [], error: 'Engine returned no results.' };
            }
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
        // GUARD: Stacks must NEVER use the Narrative Adapter (StrainMath™ Protocol)
        const isStack = engineResults.some(r => (r as any).kind === 'stack');
        const isStrainMode = seed.mode === 'strain';

        if (isStack) {
            console.log('ORCHESTRATOR: Stack Mode detected. Bypassing Narrative Adapter & Blend-Specific Validation.');
        }

        // ---------------------------------------------------------
        // DEFENSIVE NORMALIZATION (Prevent Crashes)
        // ---------------------------------------------------------
        console.log('ORCHESTRATOR: Generating Tier-1 Deterministic Narratives...');
        updatePhase('tier1');

        // Helpers are now defined at global scope to avoid duplications


        // APPLY TIER-1 NARRATIVE TO ALL RESULTS
        const safePrimary = sanitizeBlend(engineResults[0]);
        if (engineResults[0] && safePrimary.length > 0) {
            const t1 = generateDeterministicNarrative(engineResults[0], 'primary', intentSpec, seed.text || "", isStrainMode);
            engineResults[0].name = t1.name;
            engineResults[0].reasoning = t1.reasoning;
            console.log("TIER-1 (Primary):", t1.reasoning);
        }

        if (engineResults[1]) {
            const t1 = generateDeterministicNarrative(engineResults[1], 'alternative', intentSpec, seed.text || "", isStrainMode);
            engineResults[1].name = t1.name;
            engineResults[1].reasoning = t1.reasoning;
            console.log("TIER-1 (Alt):", t1.reasoning);
        }

        if (engineResults[2]) {
            const t1 = generateDeterministicNarrative(engineResults[2], 'contextual', intentSpec, seed.text || "", isStrainMode);
            engineResults[2].name = t1.name;
            engineResults[2].reasoning = t1.reasoning;
            console.log("TIER-1 (Context):", t1.reasoning);
        }


        // -------------------------------------------------------------
        // TIER-2: STRAINMATH™ ENHANCEMENT (Fire-and-Forget)
        // -------------------------------------------------------------
        // CRITICAL: StrainMath™ NEVER blocks UI readiness
        // Enhancement happens in background, phase transitions immediately

        if (!isStack && engineResults.length > 0) {
            console.log('ORCHESTRATOR: Initiating background StrainMath™ Enhancement...');
            updatePhase('tier2');

            // FIRE-AND-FORGET: Start enhancement in background
            (async () => {
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

                    // Prepare Input for StrainMath™ Enhancement
                    const primaryBlend = engineResults[0];

                    const strainmathInput = {
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

                    console.log('[STRAINMATH_INPUT]', JSON.stringify(strainmathInput, null, 2));

                    const enhancedNarratives = await Promise.race([
                        generateNarrative(strainmathInput),
                        new Promise<EnhancedNarrative[] | null>((resolve) =>
                            setTimeout(() => resolve(null), 12000)
                        )
                    ]);

                    if (enhancedNarratives && Array.isArray(enhancedNarratives)) {
                        console.log(`[STRAINMATH_SUCCESS] Multi-narrative enhancement applied ✓`);
                        enhancedNarratives.forEach((enhanced, idx) => {
                            if (engineResults[idx]) {
                                try {
                                    let raw = typeof enhanced === 'string' ? enhanced : JSON.stringify(enhanced);
                                    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

                                    const parsed = typeof enhanced === 'object' ? enhanced : JSON.parse(raw);

                                    if (parsed.newName) engineResults[idx].name = parsed.newName;
                                    if (parsed.narrative) engineResults[idx].reasoning = parsed.narrative;
                                } catch (parseErr) {
                                    console.warn(`[STRAINMATH_PARSE_FAIL] Failed to parse enhancement for index ${idx}`);
                                }
                            }
                        });
                    } else {
                        console.log(`[STRAINMATH] Timeout or null response, keeping Tier-1 narratives`);
                    }
                } catch (err) {
                    console.warn("[STRAINMATH_FAILED]", err);
                }
            })().catch(err => {
                console.warn("[STRAINMATH_BACKGROUND_ERROR]", err);
            });
        }



        // 4. HARD VALIDATION (BLENDS ONLY)
        // GUARD: Stacks bypass strict blend validation (which requires >=2 cultivars)
        if (!isStack) {
            updatePhase('validation');
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
        // STRAINMATH™ enhancement is now truly backgrounded (non-blocking)
        console.log('[ORCHESTRATOR_V8.5_ASYNC] Returning results to UI');
        updatePhase('chat'); // terminal phase - UI must resolve immediately

        // LOG TO LIVE NETWORK FEED (Fire-and-Forget)
        if (engineResults.length > 0) {
            const primaryBlend = engineResults[0];

            // FIRE-AND-FORGET: Live feed logging never blocks main flow
            (async () => {
                try {
                    const [{ Intelligence }, { generateLiveFeedCommentary }] = await Promise.all([
                        import('./merchantIntelligence'),
                        import('./llmLiveFeedAdapter')
                    ]);

                    const commentary = await generateLiveFeedCommentary({
                        blendName: primaryBlend.name || 'Custom Blend',
                        cultivars: (primaryBlend.cultivars || []).map(c => c.name),
                        outcomeCategory: outcomeCategory,
                        userInput: seed.text
                    }).catch(err => {
                        console.warn('[LIVE_FEED] Commentary generation failed, using fallback', err);
                        return null;
                    });

                    Intelligence.logResolution({
                        inputMode: seed.mode === 'engine' ? 'freeform' : 'preset',
                        inputText: seed.text,
                        blendId: primaryBlend.id || `blend-${Date.now()}`,
                        blendName: primaryBlend.name || 'Custom Blend',
                        confidenceScore: (primaryBlend.matchScore || 85) / 100,
                        componentSkus: (primaryBlend.cultivars || []).map(c => c.name),
                        outcomeCategory: outcomeCategory,
                        commentary: commentary || `${primaryBlend.name} - ${(primaryBlend.cultivars || []).map(c => c.name).join(', ')}`
                    });
                    console.log('[LIVE_FEED] Event logged successfully');
                } catch (err) {
                    console.warn('[LIVE_FEED] Background logging failed', err);
                }
            })().catch(err => {
                console.warn('[LIVE_FEED_BACKGROUND_ERROR]', err);
            });
        }

        return {
            success: true,
            data: engineResults,
            analysis: {
                targetTerpenes: intentSpec.terpenePreferences.include || [],
                reasoning: intentSpec.reasoning || "Analysis complete.",
                consultationScript: intentSpec.consultationScript,
                outcomeCategory: outcomeCategory
            }
        };

    } catch (e: any) {
        console.error('ORCHESTRATOR: Orchestration Failed', e);
        updatePhase('chat'); // terminal phase - UI must resolve immediately
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


// STRAIN MODE HELPERS

async function performStrainLookup(strainName: string, producer: string | null): Promise<any> {
    try {
        const query = producer
            ? `${strainName} by ${producer} cannabis strain effects timing terpenes`
            : `${strainName} cannabis strain effects timing terpenes`;

        const searchResult = await performSearch(query);

        if (!searchResult || !searchResult.sourcesFound) {
            return null;
        }

        return searchResult;
    } catch (error) {
        console.error('[STRAIN_MODE] Tavily lookup failed:', error);
        return null;
    }
}

function convertStrainProfileToIntentSpec(searchResult: any, strainName: string, producer: string | null): IntentSpec {
    // Extract structured data from Tavily results
    // This is a simplified implementation - in practice you'd parse the search results more thoroughly

    const intentSpec: IntentSpec = {
        originalInput: strainName + (producer ? ` by ${producer}` : ''),
        targetEffects: [], // Will be populated based on search results
        avoidEffects: [],
        terpenePreferences: { include: [], exclude: [] },
        constraints: {
            timeOfDay: "afternoon", // Default, will be overridden if found in search
            experienceLevel: "regular",
            sensitivity: "medium"
        },
        confidenceScore: 0.8, // High confidence for direct strain lookup
        reasoning: `Strain profile lookup for ${strainName}${producer ? ` by ${producer}` : ''}`,
        consultationScript: `This blend is designed to replicate the reported effects of ${strainName}${producer ? ` by ${producer}` : ''}.`
    };

    // Parse search results to extract effects, timing, terpenes
    // This is a simplified implementation - you'd want more sophisticated parsing
    const summary = searchResult.summary || '';
    const lowerSummary = summary.toLowerCase();

    // Extract effects
    if (lowerSummary.includes('relax') || lowerSummary.includes('calm')) {
        intentSpec.targetEffects.push('relaxation');
    }
    if (lowerSummary.includes('focus') || lowerSummary.includes('energy')) {
        intentSpec.targetEffects.push('focus');
    }
    if (lowerSummary.includes('sleep') || lowerSummary.includes('sedat')) {
        intentSpec.targetEffects.push('sleep');
    }
    if (lowerSummary.includes('pain') || lowerSummary.includes('relief')) {
        intentSpec.targetEffects.push('pain relief');
    }
    if (lowerSummary.includes('social') || lowerSummary.includes('happy')) {
        intentSpec.targetEffects.push('social');
    }

    // Extract timing
    if (lowerSummary.includes('day') || lowerSummary.includes('morning')) {
        intentSpec.constraints.timeOfDay = 'morning';
    } else if (lowerSummary.includes('night') || lowerSummary.includes('evening')) {
        intentSpec.constraints.timeOfDay = 'evening';
    }

    // Extract common terpenes (simplified)
    if (lowerSummary.includes('limonene')) {
        intentSpec.terpenePreferences.include.push('Limonene');
    }
    if (lowerSummary.includes('myrcene')) {
        intentSpec.terpenePreferences.include.push('Myrcene');
    }
    if (lowerSummary.includes('caryophyllene')) {
        intentSpec.terpenePreferences.include.push('Caryophyllene');
    }
    if (lowerSummary.includes('humulene')) {
        intentSpec.terpenePreferences.include.push('Humulene');
    }
    if (lowerSummary.includes('pinene')) {
        intentSpec.terpenePreferences.include.push('Pinene');
    }
    if (lowerSummary.includes('linalool')) {
        intentSpec.terpenePreferences.include.push('Linalool');
    }

    // Set default effects if none found
    if (intentSpec.targetEffects.length === 0) {
        intentSpec.targetEffects = ['relaxation', 'focus'];
    }

    // Set default terpenes if none found
    if (intentSpec.terpenePreferences.include.length === 0) {
        intentSpec.terpenePreferences.include = ['Myrcene', 'Limonene'];
    }

    return intentSpec;
}

function createFallbackStrainIntentSpec(strainName: string, producer: string | null): IntentSpec {
    console.log('[STRAIN_MODE] Creating fallback intent spec for unknown strain:', strainName);

    return {
        originalInput: strainName + (producer ? ` by ${producer}` : ''),
        targetEffects: ['relaxation', 'focus'], // Default balanced effects
        avoidEffects: ['anxiety'],
        terpenePreferences: {
            include: ['Myrcene', 'Limonene'], // Common terpenes
            exclude: []
        },
        constraints: {
            timeOfDay: 'afternoon',
            experienceLevel: 'regular',
            sensitivity: 'medium'
        },
        confidenceScore: 0.3, // Lower confidence for unknown strains
        reasoning: `Limited information available for ${strainName}. Using balanced profile.`,
        consultationScript: `I couldn't find specific information about ${strainName}. This blend uses common terpene patterns that may approximate its effects.`
    };
}

// STACK AUGMENTATION HELPERS

async function createAugmentedStack(existingStack: any, intentSpec: IntentSpec, userQuery: string): Promise<EngineResult> {
    console.log('[STACK_AUGMENTATION] Creating augmented stack');

    // Parse user intent to determine what kind of augmentation is needed
    const augmentationType = detectAugmentationType(userQuery);

    // Generate new layer content based on the augmentation request
    const newLayerIntent = interpretIntentFromSpec(intentSpec);

    // Get existing cultivars to avoid duplicates
    const existingCultivarIds = new Set<string>();
    if (existingStack.layers) {
        existingStack.layers.forEach((layer: any) => {
            if (layer.cultivars) {
                layer.cultivars.forEach((c: any) => {
                    const id = getCultivarIdFromName(c.name) || (c as any).id;
                    if (id) existingCultivarIds.add(id);
                });
            }
        });
    }

    // Generate new layer with exclusion of existing cultivars
    const exclusionArray = Array.from(existingCultivarIds);
    const newLayerResults = engineGenerate({ text: userQuery, kind: 'blend' }, newLayerIntent, exclusionArray);

    if (!newLayerResults || newLayerResults.length === 0) {
        throw new Error('Failed to generate new layer for stack augmentation');
    }

    // Create augmented stack structure
    const augmentedStack: EngineResult = {
        ...existingStack,
        id: `stack-augmented-${Date.now()}`,
        name: generateAugmentedStackName(existingStack.name, augmentationType),
        reasoning: `Stack augmented with new ${augmentationType} layer: ${newLayerResults[0].reasoning}`,
        layers: [
            ...(existingStack.layers || []),
            {
                type: 'cultivar',
                layerName: generateLayerName(augmentationType),
                cultivars: newLayerResults[0].cultivars || [],
                purpose: intentSpec.reasoning || `Added ${augmentationType} phase`,
                onsetEstimate: estimateTiming(augmentationType),
                durationEstimate: '2-4 hours'
            }
        ]
    };

    return augmentedStack;
}

function detectAugmentationType(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('morning') || lowerQuery.includes('wake') || lowerQuery.includes('energy')) {
        return 'morning';
    }
    if (lowerQuery.includes('evening') || lowerQuery.includes('wind down') || lowerQuery.includes('relax')) {
        return 'evening';
    }
    if (lowerQuery.includes('sleep') || lowerQuery.includes('night')) {
        return 'sleep';
    }
    if (lowerQuery.includes('social') || lowerQuery.includes('party')) {
        return 'social';
    }

    return 'additional'; // Generic fallback
}

function generateAugmentedStackName(originalName: string, augmentationType: string): string {
    if (augmentationType === 'morning' && !originalName.toLowerCase().includes('wake')) {
        return `${originalName} + Morning Wake`;
    }
    if (augmentationType === 'evening' && !originalName.toLowerCase().includes('evening')) {
        return `${originalName} + Evening Wind`;
    }
    if (augmentationType === 'sleep' && !originalName.toLowerCase().includes('sleep')) {
        return `${originalName} + Sleep Phase`;
    }
    if (augmentationType === 'social' && !originalName.toLowerCase().includes('social')) {
        return `${originalName} + Social Boost`;
    }

    return `${originalName} (Enhanced)`;
}

function generateLayerName(augmentationType: string): string {
    switch (augmentationType) {
        case 'morning': return 'Morning Wake Layer';
        case 'evening': return 'Evening Wind-Down';
        case 'sleep': return 'Sleep Preparation';
        case 'social': return 'Social Enhancement';
        default: return 'Additional Phase';
    }
}

function estimateTiming(augmentationType: string): string {
    switch (augmentationType) {
        case 'morning': return '6-8 AM';
        case 'evening': return '6-8 PM';
        case 'sleep': return '9-11 PM';
        case 'social': return 'Evening';
        default: return 'As needed';
    }
}

function finalizeAugmentedStack(augmentedStack: EngineResult, intentSpec: IntentSpec, outcomeCategory: string, context?: any): Promise<OrchestratorResult> {
    console.log('[STACK_AUGMENTATION] Finalizing augmented stack');

    return Promise.resolve({
        success: true,
        data: [augmentedStack],
        analysis: {
            targetTerpenes: intentSpec.terpenePreferences.include || [],
            reasoning: `Stack successfully augmented with new layer. Existing ${augmentedStack.layers?.length || 1} layers preserved.`,
            consultationScript: `Added new phase to your existing stack. The original ${augmentedStack.layers?.length ? (augmentedStack.layers.length - 1) : 0} layers remain unchanged.`,
            outcomeCategory: outcomeCategory as any
        }
    });
}

function sanitizeBlend(blend: EngineResult): string[] {
    if (!blend || !blend.cultivars) return [];
    return blend.cultivars.map(c => c.name);
}

function generateDeterministicNarrative(
    blend: EngineResult,
    type: 'primary' | 'alternative' | 'contextual',
    intent: IntentSpec,
    userInput: string,
    isStrainMatch: boolean = false
): { name: string; reasoning: string } {
    if (!blend?.cultivars?.length) return { name: "Custom Blend", reasoning: "Analysis complete." };

    const cultivarNames = blend.cultivars.map(c => c.name).join(' & ');
    let name = '';
    let reasoning = '';

    if (isStrainMatch && type === 'primary') {
        // For strain mode, use the actual strain name from the lookup
        const strainName = intent.originalInput || userInput;
        name = `${strainName} Inspired Blend`;
        // Use consultation script if available (for fallbacks), otherwise default message
        reasoning = intent.consultationScript || `This blend is designed to replicate the reported effects of ${strainName}.`;
    } else if (type === 'primary') {
        name = `${blend.cultivars[0].name} Dominant Blend`;
        reasoning = `${blend.cultivars[0].name} anchors this blend for ${intent.targetEffects[0] || 'balanced effects'}.`;
    } else if (type === 'alternative') {
        name = `${blend.cultivars[1]?.name || blend.cultivars[0].name} Offset`;
        reasoning = `Alternative approach emphasizing ${intent.targetEffects[1] || intent.targetEffects[0] || 'complementary effects'}.`;
    } else {
        name = `Contextual ${blend.cultivars[0].name} Mix`;
        reasoning = `Contextual variation using ${cultivarNames} for consistent results.`;
    }

    return { name, reasoning };
}

function validateStrict(results: EngineResult[]): string | null {
    if (!results || results.length === 0) return "No results object";
    for (const r of results) {
        if ((r as any).kind === 'stack') continue; // Stacks have an internal structure, bypass blend-specific check
        if (!r.cultivars || r.cultivars.length < 2) return "Blend has fewer than 2 cultivars";
    }
    return null;
}

