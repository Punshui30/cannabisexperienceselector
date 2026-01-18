import { EngineResult, UIBlendRecommendation, UIStackRecommendation } from '../types/domain';

function adaptToStack(result: EngineResult): UIStackRecommendation {
    // Generate Layers if missing (fallback logic)
    const layers = result.layers || (result.cultivars ? [{
        type: 'blend',
        layerName: 'Core Blend',
        cultivars: result.cultivars,
        description: 'Primary effect driver.',
        timing: '0-2h'
    }] : []);

    const recommendation: UIStackRecommendation = {
        kind: 'stack',
        stackId: result.id || `stack_${Date.now()}`,
        id: result.id || `stack_${Date.now()}`,
        name: result.name || 'Custom Stack',
        description: result.description || 'optimized protocol',
        matchScore: result.matchScore || 0.9,
        totalDuration: result.totalDuration || result.effects?.duration || '2-3h',
        confidence: 0.9,
        reasoning: result.reasoning || 'Layered for optimal effect.',
        effects: {
            onset: "5-10m",
            peak: "30-45m",
            duration: "2-3h"
        },
        timeline: [
            { time: "0m", feeling: "Onset" },
            { time: "30m", feeling: "Peak" },
            { time: "2h", feeling: "Landing" }
        ],
        layers: layers.map((l: any) => ({
            type: l.type || 'blend',
            layerName: l.layerName || 'Phase',
            cultivars: l.cultivars || [],
            description: l.description,
            phaseIntent: l.phaseIntent,
            timing: l.timing || '0:00'
        }))
    };
    return recommendation;
}

export function adaptEngineResult(
    result: EngineResult
): UIBlendRecommendation | UIStackRecommendation {

    // Determine Kind
    if (result.kind === 'stack' || result.layers) {
        return adaptToStack(result);
    }

    // PASSTHROUGH: If already adapted (has visuals), return as-is
    // But verify color existence just in case
    if (result.kind === 'blend' && result.cultivars && result.cultivars.length > 0) {
        if ((result.cultivars[0] as any).color) {
            return result as UIBlendRecommendation;
        }
    }

    // Deterministic Confidence
    const confidence = result.matchScore ? Math.max(0.1, Math.min(1.0, result.matchScore)) : 0.85;

    return {
        id: result.id || `blend_${Date.now()}`,
        name: result.name || 'Custom Blend',
        description: result.description || 'Optimized for your intent.',
        matchScore: result.matchScore || confidence,
        kind: 'blend',
        confidence: confidence,
        reasoning: result.reasoning || "Optimized based on your distinct preferences.",
        effects: {
            onset: "5-10m",
            peak: "30-45m",
            duration: "2-3h"
        },
        timeline: [
            { time: "0m", feeling: "Onset" },
            { time: "30m", feeling: "Peak Experience" },
            { time: "2h", feeling: "Tapering Off" }
        ],
        terpeneProfile: (result as any).terpeneWeights || {},
        cultivars: (result.cultivars || []).map((c: any) => ({
            name: c.name || 'Unknown',
            ratio: c.ratio || 0.5,
            profile: c.profile || 'Hybrid',
            characteristics: c.characteristics || [],
            prominentTerpenes: [],
            color: '#FFD700'
        }))
    };
}
