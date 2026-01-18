import { BlendEvaluation } from "../lib/calculationEngine";

/**
 * 1. IntentSeed (Input & Presets)
 * - Required for all flows
 * - Must be strictly typed
 */
export type IntentSeed = {
    kind: 'stack' | 'blend';
    mode: 'preset' | 'engine';
    text: string;
    image?: string;
};

/**
 * Preset Kinds
 */
export type PresetKind = 'intent' | 'blend' | 'stack';

/**
 * 2. OutcomeExemplar (Static, Educational)
 */
export type OutcomeExemplar = StackOutcomeExemplar | BlendOutcomeExemplar;

export type StackOutcomeExemplar = {
    kind: 'stack';
    id: string;
    title: string;
    description: string;
    subtitle: string;
    data: UIStackRecommendation;
    source: 'preset';
    visualProfile: {
        dominantEffect: 'focus' | 'calm' | 'sleep' | 'energy' | 'social' | 'creative' | 'balance';
        color: string;
    };
};

export type BlendOutcomeExemplar = {
    kind: 'blend';
    id: string;
    title: string;
    description: string;
    subtitle: string;
    data: UIBlendRecommendation;
    source: 'preset';
    visualProfile: {
        dominantEffect: 'focus' | 'calm' | 'sleep' | 'energy' | 'social' | 'creative' | 'balance';
        color: string;
    };
};

/**
 * 3. UIBlendRecommendation (Public UI Contract)
 */
export type UIBlendRecommendation = {
    kind: 'blend';
    id: string;
    name: string;
    matchScore: number;
    confidence: number;
    reasoning: string;
    cultivars: {
        name: string;
        ratio: number;
        profile: string;
        characteristics: string[];
        prominentTerpenes: string[];
        color: string;
    }[];
    effects: {
        onset: string;
        peak: string;
        duration: string;
    };
    timeline: {
        time: string;
        feeling: string;
    }[];
    terpeneProfile: Record<string, number>; // Required by UI
    description?: string; // Optional helper
    blendEvaluation?: BlendEvaluation;
};

/**
 * 4. UIStackRecommendation (Public UI Contract)
 */
export type UIStackRecommendation = {
    kind: 'stack';
    stackId: string; // was id
    id: string; // keep for compat if needed, or unify
    name: string;
    description: string;
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
        phaseIntent: string;
        whyThisPhase: string;
        onsetEstimate: string;
        durationEstimate: string;
        consumptionGuidance: string;
        purpose: string;
        timing: string;
    }>;
    // Explicitly disallow single-blend properties
    cultivars?: never;
    effects?: never;
    timeline?: never;
    confidence?: never;
};

/**
 * Internal Engine Result (NOT FOR UI)
 */
export type EngineResult = {
    // Defined vaguely to allow adapter to ingest anything engine throws
    kind?: string;
    name?: string;
    reasoning?: string;
    matchScore?: number;
    cultivars?: any[];
    terpeneWeights?: Record<string, number>;
    layers?: any[];
    // ... allow partials we adapt from
    [key: string]: any;
};

// --- Runtime Guards ---

export function assertBlend(rec: any): asserts rec is UIBlendRecommendation {
    if (!rec || rec.kind !== 'blend') {
        throw new Error(`BlendDetailScreen received invalid or non-blend recommendation (kind: ${rec?.kind})`);
    }
}

export function assertStack(rec: any): asserts rec is UIStackRecommendation {
    if (!rec || rec.kind !== 'stack') {
        throw new Error(`StackDetailScreen received invalid or non-stack recommendation (kind: ${rec?.kind})`);
    }
}
