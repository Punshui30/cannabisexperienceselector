/**
 * ENGINE ADAPTER
 * Translates between UI layer and calculation engine
 * Layer 1 (Intent Interpretation) + Layer 2 (Engine) integration
 */

import { calculateBlends, Intent, BlendRecommendation as EngineBlend, BlendEvaluation } from './calculationEngine';
import { INVENTORY } from './inventory';
import { getStrainById } from './strainLibrary';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation, EngineResult } from '../types/domain';







const TERPENE_COLORS: Record<string, string> = {
  'Myrcene': '#84CC16', // Lime-600
  'Limonene': '#FACC15', // Yellow-400
  'Caryophyllene': '#A855F7', // Purple-500
  'Pinene': '#22C55E', // Green-500
  'Linalool': '#C084FC', // Violet-400
  'Humulene': '#FB923C', // Orange-400
  'Terpinolene': '#FB7185', // Rose-400
  'Ocimene': '#F472B6', // Pink-400
};

function getTerpeneColor(terpeneName: string): string {
  if (!terpeneName) return '#94A3B8'; // Slate-400 default
  // Handle case sensitivity and potential partial matches or formatting
  const key = Object.keys(TERPENE_COLORS).find(k =>
    k.toLowerCase() === terpeneName.toLowerCase()
  );
  return key ? TERPENE_COLORS[key] : '#94A3B8';
}

/**
 * LAYER 1: Intent Interpretation (Simplified NLP)
 * Converts natural language to Intent object
 */
function interpretIntent(input: IntentSeed): Intent {

  const text = (input.text || '').toLowerCase();

  // Default intent
  const intent: Intent = {
    targetEffects: {
      energy: 0.0,
      focus: 0.5,
      mood: 0.5,
      body: 0.3,
      creativity: 0.5,
    },
    constraints: {
      maxAnxiety: 0.3,
    },
    context: {
      timeOfDay: 'afternoon',
      tolerance: 'medium',
      experience: 'intermediate',
    },
  };

  // Energy detection
  if (text.includes('energy') || text.includes('energetic') || text.includes('energize')) {
    intent.targetEffects.energy = 0.7;
  }
  if (text.includes('relax') || text.includes('calm') || text.includes('chill')) {
    intent.targetEffects.energy = -0.5;
  }
  if (text.includes('sleep') || text.includes('sedating') || text.includes('bed')) {
    intent.targetEffects.energy = -0.8;
    intent.targetEffects.body = 0.9;
  }

  // Focus detection
  if (text.includes('focus') || text.includes('concentrate') || text.includes('work')) {
    intent.targetEffects.focus = 0.8;
  }

  // Mood detection
  if (text.includes('social') || text.includes('chat') || text.includes('talk') || text.includes('date')) {
    intent.targetEffects.mood = 0.8;
    intent.targetEffects.energy = 0.4;
  }
  if (text.includes('happy') || text.includes('euphoric') || text.includes('uplifted')) {
    intent.targetEffects.mood = 0.7;
  }

  // Creativity detection
  if (text.includes('creative') || text.includes('art') || text.includes('music')) {
    intent.targetEffects.creativity = 0.8;
  }

  // Anxiety sensitivity
  if (text.includes('anxious') || text.includes('anxiety') || text.includes('nervous')) {
    intent.constraints.maxAnxiety = 0.2;
  }
  if (text.includes('no anxiety') || text.includes('zero anxiety')) {
    intent.constraints.maxAnxiety = 0.15;
  }

  // Time of day
  if (text.includes('morning') || text.includes('breakfast')) {
    intent.context!.timeOfDay = 'morning';
  }
  if (text.includes('afternoon')) {
    intent.context!.timeOfDay = 'afternoon';
  }
  if (text.includes('evening') || text.includes('dinner')) {
    intent.context!.timeOfDay = 'evening';
  }
  if (text.includes('night') || text.includes('bedtime')) {
    intent.context!.timeOfDay = 'night';
  }

  // Tolerance
  if (text.includes('beginner') || text.includes('new to')) {
    intent.context!.experience = 'beginner';
    intent.context!.tolerance = 'low';
  }
  if (text.includes('experienced') || text.includes('veteran')) {
    intent.context!.experience = 'expert';
    intent.context!.tolerance = 'high';
  }

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
 * LAYER 2: Call Engine + Transform Output
 */
/**
 * LAYER 2: Call Engine + Transform Output
 */
export function generateRecommendations(input: IntentSeed): EngineResult[] {
  // Layer 1: Interpret intent
  const intent = interpretIntent(input);

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

    // For V2 Engine (Mocking multi-phase by running distinct intents or splitting results)
    // Here we'll take top results and assign them to phases for demonstration of the ARCHITECTURE.
    // In a real implementation, we'd parse "A then B" into Intent A and Intent B.

    // Simplification: Run engine once, distribute top 2 strains into phases
    const engineOutput = calculateBlends(INVENTORY, intent);

    if (engineOutput.recommendations.length >= 2) {
      const rec1 = engineOutput.recommendations[0];
      const rec2 = engineOutput.recommendations[1];

      const stack: UIStackRecommendation = {
        kind: 'stack',
        id: `stack_${Date.now()}`,
        name: generateBlendName(rec1).replace('Blend', 'Journey'), // "Creative Flow Journey"
        matchScore: Math.round((rec1.blendScore + rec2.blendScore) / 2),
        reasoning: `A multi-phase experience. Starts with ${rec1.cultivars[0].name} for immediate effect, then transitions into ${rec2.cultivars[0].name}.`,
        totalDuration: '3-4 hours',
        layers: [
          {
            layerName: 'Onset Phase',
            cultivars: [{
              name: rec1.cultivars[0].name,
              ratio: 1.0,
              profile: generateProfile(rec1.cultivars[0].id),
              characteristics: ['Immediate', 'Potent']
            }],
            purpose: 'Initial elevation and mood setting',
            timing: '0-45 mins'
          },
          {
            layerName: 'Sustain Phase',
            cultivars: [{
              name: rec2.cultivars[0].name,
              ratio: 1.0,
              profile: generateProfile(rec2.cultivars[0].id),
              characteristics: ['Long-lasting', 'Stable']
            }],
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
  const engineOutput = calculateBlends(INVENTORY, intent);
  console.log('LAYER 2: Engine Output', {
    candidatesEvaluated: engineOutput.audit.candidatesEvaluated,
    topBlendIDs: engineOutput.recommendations.map(r => r.cultivars.map(c => c.id))
  });

  // Handle errors
  if (engineOutput.error || engineOutput.recommendations.length === 0) {
    // Return fallback mock recommendation
    console.warn('ENGINE ADAPTER: Returning fallback recommendations (3 cultivars)');
    return [{
      id: 'fallback_1',
      name: 'Balanced Start',
      cultivars: [
        { name: 'Blue Dream', ratio: 0.4, profile: 'Balanced hybrid', characteristics: ['Uplifting', 'Creative', 'Smooth'], prominentTerpenes: ['Myrcene', 'Pinene', 'Caryophyllene'], color: '#84CC16' },
        { name: 'Harlequin', ratio: 0.35, profile: 'Clear-headed', characteristics: ['Functional', 'Calm', 'Therapeutic'], prominentTerpenes: ['Myrcene', 'Pinene', 'Caryophyllene'], color: '#84CC16' },
        { name: 'ACDC', ratio: 0.25, profile: 'Soothing baseline', characteristics: ['Relaxed', 'Focused', 'Gentle'], prominentTerpenes: ['Myrcene', 'Pinene', 'Caryophyllene'], color: '#84CC16' },
      ],
      matchScore: 85,
      confidence: 0.9,
      reasoning: 'A gentle, balanced blend perfect for most situations. Blue Dream provides uplift, Harlequin maintains clarity, and ACDC adds a soothing baseline.',
      effects: {
        onset: '5-12 minutes',
        peak: '25-80 minutes',
        duration: '2-3 hours',
      },
      timeline: [
        { time: '120+ min', feeling: 'Smooth return to baseline' },
      ],
      kind: 'blend',
    }];
  }

  // Transform engine output to UI format
  const uiRecommendations: UIBlendRecommendation[] = engineOutput.recommendations.map((blend, idx) => {
    const strainData = blend.cultivars.map(c => {
      const strain = getStrainById(c.id);

      const prominentTerpenes = (() => {
        const inv = INVENTORY.cultivars.find(i => i.id === c.id);
        if (!inv || !inv.terpenes) return ['Myrcene', 'Pinene', 'Caryophyllene'];
        return Object.entries(inv.terpenes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
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

    // Score Normalization
    const normalizedScore = Math.round(blend.blendScore);

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
      kind: 'blend',
    };
  });

  return uiRecommendations;
}
