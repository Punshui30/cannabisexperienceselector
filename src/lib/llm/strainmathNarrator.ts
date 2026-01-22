/**
 * STRAINMATH NARRATOR (Primary Engine LLM)
 * 
 * STRICT BOUNDARIES:
 * - ONLY used for blend narratives and engine explanations
 * - BLOCKING: waits for response but doesn't crash pipeline
 * - Returns null on failure → Tier-1 deterministic fallback
 * - NEVER falls back to other LLMs
 */

export type ToneMode = "neutral" | "supportive" | "curious" | "confident" | "calm_reassuring";

export interface StrainMathNarrativeInput {
    tier1Narrative: {
        name: string;
        reasoning: string;
    };
    userIntentSummary: string;
    decisionSummary: string;
    blendSummary: {
        name: string;
        cultivars: string[];
    }[];
    toneMode: ToneMode;
}

const STRAINMATH_ENDPOINT = '/api/strainmath';

export interface EnhancedNarrative {
    newName: string;
    narrative: string;
}

export async function generateNarrative(input: StrainMathNarrativeInput): Promise<EnhancedNarrative[] | null> {
    try {
        console.log("NARRATOR: Requesting multi-narrative enhancement via master gateway...");

        const response = await fetch(STRAINMATH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            console.warn(`NARRATOR: HTTP ${response.status} - falling back`);
            return null;
        }

        const data = await response.json();

        if (data.ok && data.narratives) {
            console.log("NARRATOR: Enhancement successful ✓");
            return data.narratives;
        } else {
            console.warn("NARRATOR: Enhancement failed", data.error);
            return null;
        }

    } catch (e: any) {
        console.warn(`NARRATOR: Client error: ${e.message}`);
        return null;
    }
}
