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
        // DIAGNOSTIC LOGGING (User Request)
        try {
            console.log("CLAUDE PAYLOAD SIZE (chars):", JSON.stringify(input).length);
            console.log("CLAUDE MODEL: claude-3-5-sonnet-20240620 (configured in /api/claude.ts)");
        } catch (err) {
            console.error("CLAUDE DEBUG: Payload stringify failed", err);
        }

        const response = await fetch(CLAUDE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            throw new Error(`Claude API responded with ${response.status}`);
        }

        const data = await response.json();
        if (!data.narrative) throw new Error("Claude returned empty narrative");

        return data.narrative;

    } catch (e) {
        // Re-throw so Orchestrator can handle fallback
        throw e;
    }
}
