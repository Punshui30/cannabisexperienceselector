
/**
 * GPT NARRATOR (Fallback Provider)
 * 
 * Reliable, fast fallback when Claude is unavailable.
 * Uses the standard LLM endpoint but focused on narrative generation.
 */

import { ToneMode } from './claudeNarrator';

export interface GptNarrativeInput {
    userIntentSummary: string;
    decisionSummary: string;
    blendSummary: {
        name: string;
        cultivars: string[];
    }[];
    toneMode: ToneMode;
}

const LLM_ENDPOINT = '/api/llm';

const SYSTEM_PROMPT = `
You are a backup narrative generator for a cannabis app.
Your job is to explain a blend recommendation clearly and concisely.
- Be helpful and factual.
- Do not use robotic intro phrases.
- Max 140 words.
`.trim();

export async function generateGptNarrative(input: GptNarrativeInput): Promise<string | null> {
    try {
        // Construct a simple prompt for GPT
        const userPrompt = `
User Intent: ${input.userIntentSummary}
System Decision: ${input.decisionSummary}
Blends: ${input.blendSummary.map(b => `${b.name} (${b.cultivars.join(', ')})`).join('; ')}
Tone: ${input.toneMode}

Explain this outcome to the user.
`.trim();

        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Fast, cheap fallback
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;

    } catch (e) {
        console.error("GPT Fallback Failed:", e);
        return null;
    }
}
