
import { BlendEvaluation } from "../lib/calculationEngine";

/**
 * 1. IntentSeed (Input & Presets)
 * - Input-side only
 * - No engine output
 * - No cultivars
 * - No chemistry
 */
/**
 * Preset Kinds
 * - intent: Text-only helpers (InputScreen)
 * - blend: Static blend results (ResultsScreen)
 * - stack: Static stack results (StackDetailScreen)
 */
export type PresetKind = 'intent' | 'blend' | 'stack';

/**
 * 2. OutcomeExemplar (Static, Educational)
 * - Was "Preset Stack"
 * - Static description only
 * - Must route to PresetDetailScreen
 * - MUST NOT render BlendCard or Stack visuals
 * - MUST NOT expect cultivars
 */
export type OutcomeExemplar = {
    kind: 'stack';
    id: string;
    title: string;
    description: string;
    subtitle: string; // Keeping for card
    data: UIStackRecommendation;
    source: 'preset';
    visualProfile: {
        dominantEffect: 'focus' | 'calm' | 'sleep' | 'energy' | 'social' | 'creative';
        color: string;
    };
};

/**
 * 3. BlendRecommendation (Engine Output - Single)
 * - Single holistic chemotype
 * - One blended profile
 * - One effect curve
 */
export type UIBlendRecommendation = {
    kind: 'blend';
    id: string;
    name: string;
    cultivars: {
        name: string;
        ratio: number;
        profile: string;
        characteristics: string[];
        prominentTerpenes: string[];
        color: string;
    }[];
    matchScore: number;
    confidence: number;
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
    blendEvaluation?: BlendEvaluation;
};

/**
 * 4. StackRecommendation (Engine Output - Multi-Phase)
 * - 2-6 phases
 * - Ordered timeline
 * - Explicit chronological intent
 */
export type UIStackRecommendation = {
    kind: 'stack';
    id: string;
    name: string;
    matchScore: number;
    reasoning: string;
    totalDuration: string;
    layers: Array<{
        layerName: string;
        cultivars: Array<{
            name: string;
            ratio: number;
            profile: string;
            characteristics: string[];
        }>;
        purpose: string;
        timing: string;
    }>;
    // Explicitly disallow single-blend properties to catch rendering errors
    cultivars?: never;
    effects?: never;
    timeline?: never;
};

/**
 * Union type for any Engine Result
 */
export type EngineResult = UIBlendRecommendation | UIStackRecommendation;

// --- Runtime Guards ---

export function assertBlend(rec: EngineResult): asserts rec is UIBlendRecommendation {
    if (rec.kind !== 'blend') {
        throw new Error(`BlendDetailScreen received non-blend recommendation (kind: ${rec.kind})`);
    }
}

export function assertStack(rec: EngineResult): asserts rec is UIStackRecommendation {
    if (rec.kind !== 'stack') {
        throw new Error(`StackDetailScreen received non-stack recommendation (kind: ${rec.kind})`);
    }
}
