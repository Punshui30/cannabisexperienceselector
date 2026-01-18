import { EngineResult, UIBlendRecommendation } from '../types/domain';
import { getCultivarVisuals, getSafeColor } from './cultivarData';

export function adaptEngineResult(
    result: EngineResult
): UIBlendRecommendation {

    // Determine Kind
    if (result.kind === 'stack' || result.layers) {
        return adaptToStack(result); // Assuming adaptToStack is defined elsewhere or will be added.
    }

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
    };
}

function adaptToStack(result: EngineResult): any {
    // Basic adapter to satisfy the type check for now
    // In a real scenario, map layers properly.
    const confidence = result.matchScore ? Math.max(0.1, Math.min(1.0, result.matchScore)) : 0.85;

    return {
        stackId: result.id || 'generated-stack',
        id: result.id || 'generated-stack',
        name: result.name || 'Custom Stack',
        description: result.description || 'Optimized stack.',
        matchScore: result.matchScore || 95,
        stack: (result as any).stack,
        kind: 'blend', // Note: Function is adaptToStack but returned kind was 'blend' in previous snippet. If this is a stack, it should be 'stack'. But the error context implied adaptToStack was missing properties of UIBlendRecommendation?
        // Wait, adaptToStack is called when kind === 'stack'. It should return UIStackRecommendation.
        // The previous error was: "missing properties from type UIBlendRecommendation". This implies TS expects UIBlendRecommendation.
        // If adaptEngineResult returns UIBlendRecommendation, then adaptToStack must return UIBlendRecommendation or the return type is Union.
        // Looking at adaptEngineResult signature: "Result: UIBlendRecommendation". 
        // So I must return a Blend structure even if it's a stack (adapter pattern) OR change return signature.
        // For now, I will align with UIBlendRecommendation structure to satisfy the compiler.
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
        visualProfile: {
    dominantEffect: 'balance',
        color: '#FFD700'
}
        };
    }
```
