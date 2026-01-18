import { EngineResult, UIBlendRecommendation } from '../types/domain';
import { getCultivarVisuals, getSafeColor } from './cultivarData';

export function adaptEngineResult(
    result: EngineResult
): UIBlendRecommendation {

    // PASSTHROUGH: If already adapted (has visuals), return as-is
    // But verify color existence just in case
    if (result.kind === 'blend' && result.cultivars && result.cultivars.length > 0) {
        if ((result.cultivars[0] as any).color) {
            return result as UIBlendRecommendation;
        } else {
            console.warn('AdaptEngineResult: Passthrough object missing color. Repairing...');
        }
    }

    // Deterministic Confidence
    const confidence = result.matchScore ? Math.max(0.1, Math.min(1.0, result.matchScore)) : 0.85;

    return {
        id: result.id || `blend_${Date.now()}`,
        name: result.name || 'Custom Blend',
        description: result.description || 'Optimized for your intent.',
        matchScore: confidence,
        cultivars: (result.cultivars || []).map((c: any) => {
            const safeColor = getSafeColor(c.name || 'Unknown');
            return {
                name: c.name || 'Unknown',
                ratio: c.ratio || 0,
                profile: c.profile || 'Hybrid',
                characteristics: c.characteristics || [],
                prominentTerpenes: c.prominentTerpenes || [],
                color: safeColor // Guaranteed
            };
        }),
        stack: result.stack, // Pass stack if present
        kind: 'blend',
        terpeneProfile: result.terpeneWeights || {},
        // Default visuals if top-level needed
    };
}
