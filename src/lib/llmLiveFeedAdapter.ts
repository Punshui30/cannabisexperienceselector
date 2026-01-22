const LLM_ENDPOINT = '/api/llm';

export interface LiveFeedSource {
    blendName: string;
    cultivars: string[];
    outcomeCategory: string;
    userInput?: string;
}

const LIVE_FEED_SYSTEM_PROMPT = `
You are the High-Fidelity Chronicler for a premium cannabis network.
Your goal is to generate short, punchy, and current commentary for a "Live Network Feed". 

TONE REQUIREMENTS:
- Modern, casual, and social-media ready.
- Avoid any "marketing-speak" or corporate jargon.
- Speak like a knowledgeable peer, not a doctor or a salesman.
- Use a "vibe-first" approach.

COMMENTARY REQUIREMENTS:
- Length: 1-2 short sentences maximum.
- Include one of:
    1. A modern take on the strain's history or culture.
    2. A sensory "snap" (e.g., "The diesel-gas scent on this one is unreal").
    3. A casual observation about when to use this (e.g., "Perfect for a late-night focus session").

HARD RULES:
- NEVER use generic template phrases or clinical jargon.
- No emojis (the UI handles that).
- Reference the actual blend or strains naturally.

PROHIBITED PHRASES:
- "clinical-grade", "targets your goals", "optimizing", "controlled experience", "synergistic", "designed to help"

If it's not vibey and current, return "FAIL".
`;

/**
 * Generate unique commentary for the Public Feed.
 */
export async function generateLiveFeedCommentary(source: LiveFeedSource): Promise<string | null> {
    console.log(`LIVE_FEED: Generating LLM Commentary for [${source.blendName}]...`);

    try {
        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: "system", content: LIVE_FEED_SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `Blend: ${source.blendName}\nCultivars: ${source.cultivars.join(', ')}\nCategory: ${source.outcomeCategory}\nOriginal User Intent: ${source.userInput || 'General exploration'}`
                    }
                ],
                temperature: 0.8 // Higher temp for creative commentary
            })
        });

        if (!response.ok) {
            console.warn('LIVE_FEED: API Failure', response.status);
            return null;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        if (!content || content.includes("FAIL")) {
            console.warn('LIVE_FEED: LLM failed to generate interesting commentary.');
            return null;
        }

        console.log('LIVE_FEED: Successfully generated unique insight');
        return content.trim();

    } catch (e) {
        console.error('LIVE_FEED: Generation Error', e);
        return null;
    }
}
