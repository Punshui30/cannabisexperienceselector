/**
 * ANTIGRAVITY NARRATOR (Primary Engine LLM)
 * 
 * STRICT BOUNDARIES:
 * - ONLY used for blend narratives and engine explanations
 * - BLOCKING: waits for response but doesn't crash pipeline
 * - Returns null on failure → Tier-1 deterministic fallback
 * - NEVER falls back to other LLMs
 */

export type ToneMode = "neutral" | "supportive" | "curious" | "confident" | "calm_reassuring";

export interface AntigravityNarrativeInput {
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

const ANTIGRAVITY_ENDPOINT = '/api/antigravity';

export async function generateNarrative(input: AntigravityNarrativeInput): Promise<string | null> {
    try {
        console.log("NARRATOR: Requesting narrative enhancement via Antigravity Vertex...");

        const response = await fetch(ANTIGRAVITY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input) // Pass the full input as expected by api/antigravity.js
        });

        if (!response.ok) {
            console.warn(`NARRATOR: HTTP ${response.status} - falling back to Tier-1`);
            return null;
        }

        const data = await response.json();

        if (data.ok && data.narrative) {
            console.log("NARRATOR: Enhancement successful ✓");
            return data.narrative.trim();
        } else {
            console.warn("NARRATOR: No narrative returned from Vertex - falling back to Tier-1", data.error);
            return null;
        }

    } catch (e: any) {
        console.warn(`NARRATOR: Client error: ${e.message} - falling back to Tier-1`);
        return null;
    }
}
