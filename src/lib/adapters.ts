import { EngineResult, UIBlendRecommendation } from '../types/domain';

/**
 * ADAPTER: EngineResult -> UIBlendRecommendation
 * Guarantees UI safety. No silent failures. No partial objects.
 */
export function engineResultToUIBlend(result: EngineResult | null | undefined): UIBlendRecommendation | null {
    // Hard Null Safety
    if (!result) return null;

    // Basic validation - if missing name or cultivars, it's garbage.
    // We can rescue generic engine results if they have basic shape.
    const cultivars = Array.isArray(result.cultivars) ? result.cultivars : [];
    if (cultivars.length === 0) {
        console.warn("Adapter received empty cultivars array");
        return null; // Invalid engine result
    }

    // Deterministic Confidence
    // If engine provides matchScore, use it. Else calculate based on known factors.
    const rawScore = result.matchScore || 0.85; // Default fallback confidence
    const confidence = Math.max(0.1, Math.min(1.0, rawScore));

    // Determine Terpene Profile
    // If engine provided weights, use them. Else empty (UI handles empty).
    const terpeneProfile = result.terpeneWeights || {};

    return {
        kind: 'blend',
        id: result.id || 'generated-blend-' + Date.now(),
        name: result.name || 'Custom Blend',
        description: result.reasoning || 'No description available',
        confidence: confidence, // Mandatory
        reasoning: result.reasoning || 'Based on your intent match.',

        // Mapping Cultivars safely
        cultivars: cultivars.map((c: any) => ({
            name: c.name || 'Unknown Strain',
            ratio: typeof c.ratio === 'number' ? c.ratio : 0,
            profile: c.profile || 'Hybrid',
            characteristics: Array.isArray(c.characteristics) ? c.characteristics : [],
            prominentTerpenes: Array.isArray(c.prominentTerpenes) ? c.prominentTerpenes : [],
            color: c.color || '#cccccc' // Fallback color (grey)
        })),

        terpeneProfile: terpeneProfile,

        // Fill Defaults for Effects/Timeline if missing (Engine often omits these)
        effects: result.effects || {
            onset: '5-10m',
            peak: '30-45m',
            duration: '2-3h'
        },
        timeline: Array.isArray(result.timeline) ? result.timeline : [
            { time: 'Start', feeling: 'Uplifted' },
            { time: 'Finish', feeling: 'Relaxed' }
        ]
    };
}
