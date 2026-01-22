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

const GEMINI_ENDPOINT = '/api/llm'; // Proxying through the healthy OpenAI endpoint

export async function generateNarrative(input: GeminiNarrativeInput): Promise<string | null> {
    try {
        console.log("NARRATOR: Requesting narrative enhancement via OpenAI...");

        const systemPrompt = `You are a premium cannabis experience narrator.
Role: Enhance technical narratives into compelling, natural language.
Rule: No new facts, preserve all cultivars.
Tone: ${input.toneMode || 'neutral'}`;

        const userPrompt = `
Blend: ${input.tier1Narrative.name}
Technical Reasoning: ${input.tier1Narrative.reasoning}
User Intent: ${input.userIntentSummary}

Enhance this narrative for a premium experience.`.trim();

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o', // Use the heavy lifter for premium narratives
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.warn(`NARRATOR: HTTP ${response.status} - falling back to Tier-1`);
            return null;
        }

        const data = await response.json();

        // OpenAI format check
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.warn("NARRATOR: Empty content returned from OpenAI - falling back to Tier-1");
            return null;
        }

        console.log("NARRATOR: Enhancement successful ✓");
        return content.trim();

    } catch (e: any) {
        console.warn(`NARRATOR: Client error: ${e.message} - falling back to Tier-1`);
        return null;
    }
}
