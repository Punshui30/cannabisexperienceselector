/**
 * ENGINE ADAPTER
 * Translates between UI layer and calculation engine
 * Layer 1 (Intent Interpretation) + Layer 2 (Engine) integration
 */

import { calculateBlends, Intent, BlendRecommendation as EngineBlend } from './calculationEngine';
import { INVENTORY } from './inventory';
import { getStrainById } from './strainLibrary';

export type UserInput = {
  mode: 'describe' | 'product' | 'strain';
  text?: string;
  image?: string;
  strainName?: string;
  grower?: string;
};

export type UICultivar = {
  name: string;
  ratio: number;
  profile: string;
  characteristics: string[];
  prominentTerpenes: string[]; // Added specifically for the Resolving screen
};

export type UIBlendRecommendation = {
  id: string;
  name: string;
  cultivars: UICultivar[];
  matchScore: number;
  reasoning: string;
  effects: {
    onset: string;
    peak: string;
    duration: string;
  };
  timeline: {
    time: string;
    feeling: string;
  }[];
};




/**
 * LAYER 1: Intent Interpretation (Simplified NLP)
 * Converts natural language to Intent object
 */
function interpretIntent(input: UserInput): Intent {
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
export function generateRecommendations(input: UserInput): UIBlendRecommendation[] {
  // Layer 1: Interpret intent
  const intent = interpretIntent(input);

  // Layer 2: Call calculation engine
  const engineOutput = calculateBlends(INVENTORY, intent);

  // Handle errors
  if (engineOutput.error || engineOutput.recommendations.length === 0) {
    // Return fallback mock recommendation
    return [{
      id: 'fallback_1',
      name: 'Balanced Start',
      cultivars: [
        { name: 'Blue Dream', ratio: 0.6, profile: 'Balanced hybrid', characteristics: ['Uplifting', 'Creative', 'Smooth'], prominentTerpenes: ['Myrcene', 'Pinene', 'Caryophyllene'] },
        { name: 'Harlequin', ratio: 0.4, profile: 'Clear-headed', characteristics: ['Functional', 'Calm', 'Therapeutic'], prominentTerpenes: ['Myrcene', 'Pinene', 'Caryophyllene'] },
      ],
      matchScore: 85,
      reasoning: 'A gentle, balanced blend perfect for most situations. Blue Dream provides uplifting effects while Harlequin keeps things clear and functional.',
      effects: {
        onset: '5-12 minutes',
        peak: '25-80 minutes',
        duration: '2-3 hours',
      },
      timeline: [
        { time: '25-80 min', feeling: 'Peak balanced effects' },
        { time: '80-120 min', feeling: 'Gradual softening' },
        { time: '120+ min', feeling: 'Smooth return to baseline' },
      ],
    }];
  }

  // Transform engine output to UI format
  const uiRecommendations: UIBlendRecommendation[] = engineOutput.recommendations.map((blend, idx) => {
    const strainData = blend.cultivars.map(c => {
      const strain = getStrainById(c.id);
      return {
        name: strain ? strain.name : c.name,
        ratio: c.ratio,
        profile: generateProfile(c.id),
        characteristics: strain ? strain.vibeTags.slice(0, 3).map(tag =>
          tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')
        ) : ['Chemotyped'],
        prominentTerpenes: (() => {
          const inv = INVENTORY.cultivars.find(i => i.id === c.id);
          if (!inv || !inv.terpenes) return ['Myrcene', 'Pinene', 'Caryophyllene'];
          return Object.entries(inv.terpenes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
        })(),
      };
    });

    return {
      id: `blend_${idx + 1}`,
      name: generateBlendName(blend),
      cultivars: strainData,
      matchScore: Math.round(Math.max(0, (1 + blend.score) * 50)), // Transform score to 0-100 range
      reasoning: generateReasoning(blend, intent),
      effects: {
        onset: '5-12 minutes',
        peak: '25-80 minutes',
        duration: '2-3 hours',
      },
      timeline: generateTimeline(blend),
    };
  });

  return uiRecommendations;
}
