/**
 * CLAUDE NARRATOR (Client Wrapper)
 * 
 * Provides narrative interpretation for system outcomes.
 * DOES NOT DECIDE. DOES NOT MUTATE.
 * 
 * Conceptual Signature:
 * generateNarrative({ userIntentSummary, decisionSummary, blendContext, toneMode }): string
 */

export type ToneMode = "neutral" | "supportive" | "curious" | "confident" | "calm_reassuring";

export interface ClaudeNarrativeInput {
    userIntentSummary: string;
    decisionSummary: string;
    blendSummary: {
        name: string;
        cultivars: string[];
    }[];
    toneMode: ToneMode;
}

const CLAUDE_ENDPOINT = '/api/claude';

export async function generateNarrative(input: ClaudeNarrativeInput): Promise<string | null> {
    try {
        const response = await fetch(CLAUDE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            console.warn(`Claude Narrative Failed: ${response.status}`);
            return null; // Silent fallback
        }

        const data = await response.json();
        return data.narrative || null;

    } catch (e) {
        console.error("Claude Narrative Exception (Silent Fallback):", e);
        return null;
    }
}
