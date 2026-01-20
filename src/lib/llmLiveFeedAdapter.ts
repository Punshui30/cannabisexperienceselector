const LLM_ENDPOINT = '/api/llm';

export interface LiveFeedSource {
    blendName: string;
    cultivars: string[];
    outcomeCategory: string;
    userInput?: string;
}

const LIVE_FEED_SYSTEM_PROMPT = `
You are the High-Fidelity Chronicler for a premium cannabis network.
Your goal is to generate short, compelling, and human-readable commentary for a "Live Network Feed".

COMMENTARY REQUIREMENTS:
- Length: 1-3 sentences.
- Tone: Interesting, shareable, non-generic, cultural, or experiential.
- Include at least ONE of:
    1. A historical fact about one of the cultivars.
    2. An insight about why this specific blend is unusual or synergistic.
    3. A story or "vibe" tied to the blend name.
    4. A cultural hook.

PROHIBITED PHRASES (DO NOT USE):
- "clinical-grade configuration"
- "targets your specific goals"
- "optimizing terpene ratios"
- "controlled, repeatable experience"
- "Direct match to your goal"
- "Synergistic combination"

FAIL LOUD:
If you cannot generate something interesting, or if you feel like you are using a template, return an error message or "FAIL".
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
