import { IntentSeed, IntentSpec, EngineResult } from '../types/domain';
import { interpretIntentFromSpec, generateRecommendations as engineGenerate } from './engineAdapter';
import { getCultivarIdFromName } from './strainLibrary';

// Define OrchestratorResult locally
export interface OrchestratorResult {
    success: boolean;
    data: EngineResult[];
    error?: string;
    analysis?: {
        targetTerpenes?: string[];
        reasoning?: string;
        consultationScript?: string;
        outcomeCategory?: string;
    };
}

// ============================================================================
// INTENT-BOUND NAMING FUNCTIONS
// ============================================================================

/**
 * Generate blend name from user's stated GOAL, not terpene composition.
 * Names must reflect WHY this blend exists for this user.
 */
export function generateIntentBoundName(
    userInput: string | undefined,
    targetEffects: string[],
    variantType: 'primary' | 'secondary' | 'contextual'
): string {
    const text = (userInput || '').toLowerCase();

    // Extract primary goal from target effects or user text
    const primaryEffect = targetEffects[0]?.toLowerCase() || '';

    // Match user intent patterns
    const focusPattern = /focus|concentrate|work|study|clarity/i;
    const energyPattern = /energy|energize|awake|alert|active/i;
    const relaxPattern = /relax|calm|chill|unwind|peace/i;
    const sleepPattern = /sleep|bed|night|rest|drowsy/i;
    const socialPattern = /social|party|chat|conversation|friends/i;
    const creativePattern = /creative|art|music|inspire/i;
    const painPattern = /pain|ache|sore|relief/i;

    let baseName = '';

    // Intent-first naming (user input overrides effect tags)
    if (text.match(focusPattern) || primaryEffect.includes('focus')) {
        baseName = 'Clear Mind';
    } else if (text.match(energyPattern) || primaryEffect.includes('energy')) {
        baseName = 'Morning Lift';
    } else if (text.match(sleepPattern) || primaryEffect.includes('sleep')) {
        baseName = 'Deep Rest';
    } else if (text.match(relaxPattern) || primaryEffect.includes('calm') || primaryEffect.includes('relax')) {
        baseName = 'Evening Calm';
    } else if (text.match(socialPattern) || primaryEffect.includes('social')) {
        baseName = 'Social Ease';
    } else if (text.match(creativePattern) || primaryEffect.includes('creative')) {
        baseName = 'Creative Flow';
    } else if (text.match(painPattern) || primaryEffect.includes('pain')) {
        baseName = 'Body Relief';
    } else {
        baseName = 'Balanced State';
    }

    // Variant suffix
    if (variantType === 'secondary') {
        return `${baseName} (Alternative)`;
    } else if (variantType === 'contextual') {
        return `${baseName} (Gentle)`;
    }

    return baseName;
}

/**
 * Generate narrative explanation PER VARIANT.
 * Each blend card gets its own user-aware reasoning.
 */
export function generateVariantNarrative(params: {
    userInput: string | undefined;
    variantType: 'primary' | 'secondary' | 'contextual';
    targetEffects: string[];
    avoidEffects: string[];
    context?: any;
    variantShift?: string;
    contextShift?: { timeOfDay?: string; anxietyRelaxed?: boolean };
    terpeneChange?: string;
    cultivars: string[];
}): string {
    const {
        userInput,
        variantType,
        targetEffects,
        avoidEffects,
        context,
        variantShift,
        contextShift,
        cultivars
    } = params;

    const text = (userInput || '').toLowerCase();
    const primaryGoal = targetEffects[0] || 'balance';
    const primaryAvoid = avoidEffects[0] || 'side effects';
    const cultivarNames = cultivars.slice(0, 2).join(' and ');

    // Context-aware override
    if (context?.blendName) {
        return `Refining ${context.blendName}: You asked "${userInput}". I've adjusted the ${context.screen === 'BlendDetail' ? 'cultivar ratios' : 'stack layers'} to address this while keeping its core character.`;
    }

    // Variant-specific narratives
    if (variantType === 'primary') {
        return `Based on your request for ${primaryGoal}, this blend uses ${cultivarNames} to deliver that effect while avoiding ${primaryAvoid}. This is the most direct match to your stated goal.`;
    }

    if (variantType === 'secondary') {
        return `Alternative interpretation: This blend explores a different path to ${primaryGoal} by ${variantShift || 'balancing energy and body grounding'}. It uses ${cultivarNames} for a smoother, more sustained experience.`;
    }

    if (variantType === 'contextual') {
        const timeShift = contextShift?.timeOfDay ? ` optimized for ${contextShift.timeOfDay}` : '';
        const anxietyNote = contextShift?.anxietyRelaxed ? ' with relaxed anxiety constraints for broader cultivar selection' : '';
        return `Contextual adaptation${timeShift}${anxietyNote}. This blend prioritizes gentler delivery of ${primaryGoal} using ${cultivarNames}.`;
    }

    return `This blend is optimized for ${primaryGoal} while managing ${primaryAvoid}.`;
}

// =============================================================================
// ORCHESTRATOR LOGIC (rest of file remains unchanged)
// =============================================================================
