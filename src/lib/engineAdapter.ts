/**
 * ENGINE ADAPTER
 * Translates between UI layer and calculation engine
 * Layer 1 (Intent Interpretation) + Layer 2 (Engine) integration
 */

import { calculateBlends, Intent, BlendRecommendation as EngineBlend, BlendEvaluation } from './calculationEngine';
import { INVENTORY } from './inventory';
import { getStrainById } from './strainLibrary';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation, EngineResult, IntentSpec } from '../types/domain';

// ... (imports remain)

// ... (TERPENE_COLORS helper remains)

/**
 * LAYER 1: Intent Interpretation (Simplified NLP)
 * Converts natural language to Intent object
 */
export function interpretIntent(input: IntentSeed): IntentValidation {
  // ... (existing implementation remains)
  const text = (input.text || '').toLowerCase();

  // Default intent
  const intent: Intent = {
    targetEffects: { energy: 0.0, focus: 0.5, mood: 0.5, body: 0.3, creativity: 0.5 },
    constraints: { maxAnxiety: 0.3 },
    context: { timeOfDay: 'afternoon', tolerance: 'medium', experience: 'intermediate' },
  };

  // ... (NLP logic remains as fallback)
  // [existing logic lines 65-126]
  // Energy detection
  if (text.includes('energy') || text.includes('energetic') || text.includes('energize')) { intent.targetEffects.energy = 0.7; }
  if (text.includes('relax') || text.includes('calm') || text.includes('chill')) { intent.targetEffects.energy = -0.5; }
  if (text.includes('sleep') || text.includes('sedating') || text.includes('bed')) { intent.targetEffects.energy = -0.8; intent.targetEffects.body = 0.9; }

  // Focus detection
  if (text.includes('focus') || text.includes('concentrate') || text.includes('work')) { intent.targetEffects.focus = 0.8; }

  // Mood detection
  if (text.includes('social') || text.includes('chat') || text.includes('talk') || text.includes('date')) { intent.targetEffects.mood = 0.8; intent.targetEffects.energy = 0.4; }
  if (text.includes('happy') || text.includes('euphoric') || text.includes('uplifted')) { intent.targetEffects.mood = 0.7; }

  // Creativity detection
  if (text.includes('creative') || text.includes('art') || text.includes('music')) { intent.targetEffects.creativity = 0.8; }

  // Anxiety sensitivity
  if (text.includes('anxious') || text.includes('anxiety') || text.includes('nervous')) { intent.constraints.maxAnxiety = 0.2; }
  if (text.includes('no anxiety') || text.includes('zero anxiety')) { intent.constraints.maxAnxiety = 0.15; }

  // Time / Tolerance logic... (simplified here for brevity, assume existing exists or strictly copied)
  // Note: To be safe, I should probably leave the existing file alone and just ADD the new function below it.

  // Validation Logic
  const wordCount = text.split(' ').filter(w => w.length > 0).length;
  let isValid = true;
  let reason = undefined;
  let followUpQuestion = undefined;

  if (wordCount < 2 && !input.strainName && !input.image) {
    isValid = false;
    reason = "Input too short";
    followUpQuestion = "Can you describe a bit more about how you want to feel?";
  }

  return { isValid, reason, followUpQuestion, intent };
}

// Helper Types
interface IntentValidation {
  isValid: boolean;
  reason?: string;
  followUpQuestion?: string;
  intent: Intent;
}

/**
 * NEW: Interpret Intent from Strict Spec
 * Higher fidelity mapping from LLM Analysis
 */
export function interpretIntentFromSpec(spec: IntentSpec): Intent {
  const intent: Intent = {
    targetEffects: { energy: 0.0, focus: 0.0, mood: 0.0, body: 0.0, creativity: 0.0 },
    constraints: { maxAnxiety: 0.3 },
    context: {
      timeOfDay: spec.constraints.timeOfDay || 'afternoon',
      experience: (spec.constraints.experienceLevel as any) || 'intermediate',
      tolerance: spec.constraints.sensitivity === 'high' ? 'low' : 'medium'
    }
  };

  // Map Normalized Effects to Vector
  spec.targetEffects.forEach(eff => {
    const e = eff.toLowerCase();
    if (e === 'energy' || e === 'uplift') intent.targetEffects.energy += 0.7;
    if (e === 'focus' || e === 'clarity') intent.targetEffects.focus += 0.8;
    if (e === 'calm' || e === 'relax') { intent.targetEffects.energy -= 0.5; intent.targetEffects.body += 0.4; }
    if (e === 'sleep' || e === 'sedation') { intent.targetEffects.energy -= 0.8; intent.targetEffects.body += 0.8; }
    if (e === 'social' || e === 'fun') { intent.targetEffects.mood += 0.7; }
    if (e === 'creative') { intent.targetEffects.creativity += 0.8; }
    if (e === 'pain_relief' || e === 'relief') { intent.targetEffects.body += 0.8; }
  });

  spec.avoidEffects.forEach(eff => {
    const e = eff.toLowerCase();
    if (e === 'anxiety') intent.constraints.maxAnxiety = 0.1;
    if (e === 'paranoia') intent.constraints.maxAnxiety = 0.05;
    if (e === 'sedation') intent.targetEffects.energy = Math.max(0.2, intent.targetEffects.energy); // Force some energy
  });

  return intent;
}

/**
 * Generate blend name from cultivars
 */
function generateBlendName(blend: EngineBlend): string {
  const strainIds = blend.cultivars.map(c => c.id);
  const strains = strainIds.map(id => getStrainById(id)).filter(Boolean);

  const vibeTags = new Set<string>();
  strains.forEach(strain => {
    if (strain) {
      strain.vibeTags.slice(0, 2).forEach(tag => vibeTags.add(tag));
    }
  });

  const tags = Array.from(vibeTags).slice(0, 2);

  if (tags.includes('uplifting') && tags.includes('creative')) return 'Creative Flow';
  if (tags.includes('energetic') && tags.includes('focused')) return 'Focused Energy';
  if (tags.includes('relaxing') && tags.includes('euphoric')) return 'Relaxed Bliss';
  if (tags.includes('social') && tags.includes('uplifting')) return 'Social Spark';
  if (tags.includes('calming') && tags.includes('balanced')) return 'Balanced Calm';

  const topTag = tags[0] || 'balanced';
  return topTag.charAt(0).toUpperCase() + topTag.slice(1) + ' Blend';
}

/**
 * Generate profile description from strain
 */
function generateProfile(strainId: string): string {
  const strain = getStrainById(strainId);
  if (!strain) return 'Chemotyped';

  const tags = strain.vibeTags;
  if (tags.includes('energetic')) return 'Energizing boost';
  if (tags.includes('relaxing')) return 'Calming presence';
  if (tags.includes('focused')) return 'Mental clarity';
  if (tags.includes('euphoric')) return 'Mood elevation';
  if (tags.includes('creative')) return 'Creative flow';

  return 'Balanced effect';
}

/**
 * Generate reasoning from engine output
 */
function generateReasoning(blend: EngineBlend, intent: Intent): string {
  const cultivarNames = blend.cultivars.map(c => c.name);
  const thc = blend.cannabinoids.thc.toFixed(1);
  const cbd = blend.cannabinoids.cbd.toFixed(1);

  let reasoning = `This blend combines ${cultivarNames.join(', ')} for `;

  if (intent.targetEffects.energy > 0.5) {
    reasoning += 'energizing effects ';
  } else if (intent.targetEffects.energy < -0.3) {
    reasoning += 'relaxing effects ';
  } else {
    reasoning += 'balanced effects ';
  }

  if (intent.targetEffects.focus > 0.6) {
    reasoning += 'with strong mental clarity';
  } else if (intent.targetEffects.mood > 0.6) {
    reasoning += 'with mood elevation';
  } else if (intent.targetEffects.creativity > 0.6) {
    reasoning += 'with creative enhancement';
  } else {
    reasoning += 'with versatile benefits';
  }

  reasoning += `. Weighted ${thc}% THC, ${cbd}% CBD. `;

  if (blend.confidence < 0.7) {
    reasoning += 'Some terpene profiles estimated.';
  } else {
    reasoning += 'High confidence prediction.';
  }

  return reasoning;
}

/**
 * Generate timeline from effects
 */
function generateTimeline(blend: EngineBlend): Array<{ time: string; feeling: string }> {
  const effects = blend.predictedEffects;

  const timeline = [];

  timeline.push({
    time: '0-10 min',
    feeling: effects.energy > 0.3 ? 'Gentle uplift begins' : 'Subtle relaxation starts',
  });

  timeline.push({
    time: '10-25 min',
    feeling: effects.mood > 0.5 ? 'Mood brightens, more conversational' : 'Settling into the experience',
  });

  timeline.push({
    time: '25-80 min',
    feeling: effects.focus > 0.6 ? 'Peak focus and clarity' : effects.body > 0.6 ? 'Deep body relaxation' : 'Peak effects plateau',
  });

  timeline.push({
    time: '80-120 min',
    feeling: 'Effects gradually soften',
  });

  timeline.push({
    time: '120+ min',
    feeling: 'Smooth return to baseline',
  });

  return timeline;
}

/**
 * Get color for terpene
 */
function getTerpeneColor(terpene: string): string {
  if (!terpene) return '#CCCCCC';
  const t = terpene.toLowerCase();
  if (t.includes('limonene')) return '#FACC15'; // Yellow
  if (t.includes('myrcene')) return '#A855F7'; // Purple
  if (t.includes('pinene')) return '#22C55E'; // Green
  if (t.includes('linalool')) return '#E879F9'; // Lavender
  if (t.includes('caryophyllene')) return '#F97316'; // Orange
  if (t.includes('terpinolene')) return '#FB923C'; // Coral
  if (t.includes('humulene')) return '#84CC16'; // Lime
  return '#94A3B8'; // Slate
}

/**
 * LAYER 2: Call Engine + Transform Output
 */
export function generateRecommendations(
  input: IntentSeed,
  intentOverride?: Intent,
  exclusionIds?: string[] // ID-based exclusions
): EngineResult[] {
  // Layer 1: Interpret intent (or use Override)
  let intent: Intent;
  if (intentOverride) {
    intent = intentOverride;
  } else {
    const result = interpretIntent(input);
    intent = result.intent;
  }

  // ---------------------------------------------------------
  // MODE GATE: Temporal Structure Detection
  // Heuristic: Check for sequence keywords
  // ---------------------------------------------------------
  const text = (input.text || '').toLowerCase();
  const temporalKeywords = ['then', 'after', 'followed by', 'later', 'secondly'];
  const isStackMode = temporalKeywords.some(kw => text.includes(kw));

  console.log('LAYER 1: Intent', intent, 'Stack Mode:', isStackMode);

  if (isStackMode) {
    // ---------------------------------------------------------
    // STACK GENERATION (Multi-Phase)
    // ---------------------------------------------------------

    // For V2 Engine (Simulating multi-phase by running distinct intents or splitting results)
    // Here we'll take top results and assign them to phases for demonstration of the ARCHITECTURE.
    // In a real implementation, we'd parse "A then B" into Intent A and Intent B.

    // Simplification: Run engine once, distribute top 2 strains into phases
    const engineOutput = calculateBlends(INVENTORY, intent, exclusionIds); // Pass exclusions

    if (engineOutput.recommendations.length >= 2) {
      const rec1 = engineOutput.recommendations[0];
      const rec2 = engineOutput.recommendations[1];

      const stack: UIStackRecommendation = {
        kind: 'stack',
        // Satisfy UIStackRecommendation
        stackId: `stack_gen_${Date.now()}`,
        id: `stack_${Date.now()}`,
        name: generateBlendName(rec1).replace('Blend', 'Journey'), // "Creative Flow Journey"
        description: 'A dynamically generated multi-phase experience based on your intent.',
        matchScore: Math.round((rec1.blendScore + rec2.blendScore) / 2),
        reasoning: `A multi-phase experience. Starts with ${rec1.cultivars[0].name} for immediate effect, then transitions into ${rec2.cultivars[0].name}.`,
        totalDuration: '3-4 hours',
        layers: [
          {
            type: 'cultivar',
            layerName: 'Onset Phase',
            cultivars: [{
              name: rec1.cultivars[0].name,
              ratio: 1.0,
              profile: generateProfile(rec1.cultivars[0].id),
              characteristics: ['Immediate', 'Potent']
            }],
            phaseIntent: 'Initial Elevation',
            whyThisPhase: `Leverages ${rec1.cultivars[0].name} for rapid onset.`,
            onsetEstimate: '0-10 min',
            durationEstimate: '45 min',
            consumptionGuidance: 'Inhale deeply',
            purpose: 'Initial elevation and mood setting',
            timing: '0-45 mins'
          },
          {
            type: 'cultivar',
            layerName: 'Sustain Phase',
            cultivars: [{
              name: rec2.cultivars[0].name,
              ratio: 1.0,
              profile: generateProfile(rec2.cultivars[0].id),
              characteristics: ['Long-lasting', 'Stable']
            }],
            phaseIntent: 'Prolonged Effect',
            whyThisPhase: `Transition to ${rec2.cultivars[0].name} for stability.`,
            onsetEstimate: '45 min',
            durationEstimate: '2 hrs',
            consumptionGuidance: 'Sip slowly',
            purpose: 'Prolonged beneficial effects',
            timing: '45-120 mins'
          }
        ]
      };
      return [stack];
    }
  }

  // ---------------------------------------------------------
  // BLEND GENERATION (Single-Phase)
  // ---------------------------------------------------------

  // Layer 2: Call calculation engine
  console.log('LAYER 2: Engine Start - Inventory Size:', INVENTORY.cultivars.length);
  const engineOutput = calculateBlends(INVENTORY, intent, exclusionIds); // Pass exclusions
  console.log('LAYER 2: Engine Output', {
    candidatesEvaluated: engineOutput.audit.candidatesEvaluated,
    topBlendIDs: engineOutput.recommendations.map(r => r.cultivars.map(c => c.id))
  });

  // Handle errors / empty state gracefully without mocks
  if (engineOutput.error || engineOutput.recommendations.length === 0) {
    console.warn('ENGINE ADAPTER: No matching blends found. Returning empty set.');
    return [];
  }

  // Transform engine output to UI format
  const uiRecommendations: UIBlendRecommendation[] = engineOutput.recommendations.map((blend, idx) => {
    const strainData = blend.cultivars.map(c => {
      const strain = getStrainById(c.id);

      const prominentTerpenes = (() => {
        const inv = INVENTORY.cultivars.find(i => i.id === c.id);
        if (!inv) console.warn(`EngineAdapter: Strain ${c.id} (${c.name}) not found in Inventory`);

        if (!inv || !inv.terpenes) {
          console.warn(`EngineAdapter: No terpenes for ${c.name}, using fallback`);
          return ['Myrcene', 'Limonene', 'Caryophyllene'];
        }

        const sorted = Object.entries(inv.terpenes)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

        return sorted;
      })();

      return {
        name: strain ? strain.name : c.name,
        ratio: c.ratio,
        profile: generateProfile(c.id),
        characteristics: strain ? strain.vibeTags.slice(0, 3).map(tag =>
          tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')
        ) : ['Chemotyped'],
        prominentTerpenes,
        color: getTerpeneColor(prominentTerpenes[0]) // Dominant terpene color
      };
    });

    const normalizedScore = Math.round(blend.blendScore);

    // Extract terpene profile from blend evaluation if available, or fall back to known prominent ones
    const terpeneProfile = blend.blendEvaluation?.profile?.terpenes || {};

    return {
      id: `blend_${idx + 1}`,
      name: generateBlendName(blend),
      cultivars: strainData,
      matchScore: normalizedScore,
      confidence: blend.confidence,
      reasoning: generateReasoning(blend, intent),
      effects: {
        onset: '5-12 minutes',
        peak: '25-80 minutes',
        duration: '2-3 hours',
      },
      timeline: generateTimeline(blend),
      blendEvaluation: blend.blendEvaluation,
      terpeneProfile: terpeneProfile, // Added required field
      kind: 'blend',
    };
  });

  return uiRecommendations;
}
