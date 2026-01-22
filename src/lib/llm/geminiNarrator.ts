/**
 * GEMINI NARRATOR (Primary Engine LLM)
 * 
 * STRICT BOUNDARIES:
 * - ONLY used for blend narratives and engine explanations
 * - BLOCKING: waits for response but doesn't crash pipeline
 * - Returns null on failure → Tier-1 deterministic fallback
 * - NEVER falls back to other LLMs
 */

export type ToneMode = "neutral" | "supportive" | "curious" | "confident" | "calm_reassuring";

export interface GeminiNarrativeInput {
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

const GEMINI_ENDPOINT = '/api/gemini';

export async function generateNarrative(input: GeminiNarrativeInput): Promise<string | null> {
    try {
        console.log("GEMINI: Requesting narrative enhancement...");
        console.log("GEMINI PAYLOAD SIZE (chars):", JSON.stringify(input).length);

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            console.warn(`GEMINI: HTTP ${response.status} - falling back to Tier-1`);
            return null;
        }

        const data = await response.json();

        // Handle graceful API failures (200 OK with error flag)
        if (!data.ok) {
            console.warn(`GEMINI: API returned error: ${data.error}`);
            if (data.details) {
                console.warn(`GEMINI: Error details:`, data.details);
            }
            if (data.status) {
                console.warn(`GEMINI: HTTP Status:`, data.status);
            }
            console.warn('GEMINI: Falling back to Tier-1');
            return null;
        }

        if (!data.narrative) {
            console.warn("GEMINI: Empty narrative returned - falling back to Tier-1");
            return null;
        }

        console.log("GEMINI: Narrative enhancement successful ✓");
        return data.narrative;

    } catch (e: any) {
        console.warn(`GEMINI: Client error: ${e.message} - falling back to Tier-1`);
        // Return null to ensure Tier-1 fallback, never crash the pipeline
        return null;
    }
}
