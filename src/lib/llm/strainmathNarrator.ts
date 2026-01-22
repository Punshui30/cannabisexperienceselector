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

/**
 * ANALYZE IMAGE (Vision + Tavily Grounding)
 * Returns a technical summary of the product in the image.
 */
export async function analyzeImage(imageBase64: string): Promise<string | null> {
    try {
        console.log("NARRATOR: Analyzing image via master gateway (Vision + Search)...");

        const response = await fetch(STRAINMATH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 })
        });

        if (!response.ok) {
            console.warn(`NARRATOR: Image analysis HTTP failure: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.ok && data.data) {
            console.log("NARRATOR: Image analysis successful ✓");
            return data.data;
        } else {
            console.warn("NARRATOR: Image analysis returned no data", data.error);
            return null;
        }
    } catch (e: any) {
        console.error("NARRATOR: Image analysis client error:", e.message);
        return null;
    }
}
