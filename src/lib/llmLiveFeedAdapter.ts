const LLM_ENDPOINT = '/api/llm';

export interface LiveFeedSource {
    blendName: string;
    cultivars: string[];
    outcomeCategory: string;
    userInput?: string;
}

const LIVE_FEED_SYSTEM_PROMPT = `
You are the StrainMath™ Lead Curator and Experience Architect.
Your task is to provide an elite, high-definition commentary on why a specific cannabis blend was meticulously crafted for this user's unique journey.

CONSULTANT PROTOCOL:
1. Tone: Ultra-premium, sophisticated, and evocative. Think "Haute Couture for Cannabinoids".
2. Depth: Go deep into the metabolic synergy. Don't just list effects; describe the interaction between the terpene profile and the user's specific lifestyle setting (e.g., focused writing, social engagement, or physical recovery).
3. Precision: Reference the synergy between the specific cultivars listed and why they were chosen for the original user intent.
4. Length: Exactly 3-4 detailed, sophisticated sentences.
5. Social Impact: This text is shared to a live feedback stream. It must feel like an exclusive expert insight—authoritative, interesting, and highly "share-worthy".
6. **USER-AWARENESS CONTRACT (NON-NEGOTIABLE)**: Every word of your commentary must be explicitly aware of the specific user input and metabolic intent. Reference their literal terms and the lifestyle moment they described (e.g. "writing session", "nature walk"). Generic or neutral responses are a failure of the contract.
`.trim();

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
