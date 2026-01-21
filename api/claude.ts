/**
 * CLAUDE API PROXY
 * /api/claude
 * 
 * Server-side only. Protects ANTHROPIC_API_KEY.
 * Enforces System Prompt and Constraints.
 */

const SYSTEM_PROMPT = `
You are a narrative editor for a cannabis experience application.

Your job is to ENHANCE the tone and flow of an existing "Tier-1" narrative provided by the system.
You do NOT make decisions. You do NOT change the facts (cultivars, effects).

CRITICAL POLICY:
1. PRESERVE INTENT: The original reasoning is mathematically correct. Do not contradict it.
2. IMPROVE VOICE: Make it sound more human, confident, or reassuring based on the requested Tone Mode.
3. BE CONCISE: Max 120 words.
4. NO ROBOTIC INTROS: Start directly with the explanation.

Input will include:
- User Intent
- Tier-1 Draft (Name & Reasoning)
- Tone Mode

Output:
- A polished version of the reasoning text only.
`.trim();

export default async function handler(request: any, response: any) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error("Missing ANTHROPIC_API_KEY");
        return response.status(500).json({ error: 'Configuration Error' });
    }

    try {
        const body = request.body || {};
        const { userIntentSummary, decisionSummary, blendSummary, toneMode, tier1Narrative } = body;

        // SAFEGUARD: If body is malformed, fail gracefully (200 OK)
        if (!userIntentSummary || !tier1Narrative) {
            console.warn("Claude API: Missing required fields (tier1Narrative)");
            return response.status(200).json({
                success: false,
                reason: "invalid_payload",
                narrative: null
            });
        }

        // Construct the User Message based on Tone
        let toneInstruction = "Tone Mode: neutral (Informative, Balanced, No emotional language)";

        switch (toneMode) {
            case 'supportive': toneInstruction = "Tone Mode: supportive (Acknowledge preferences, Validate experience, Gentle)"; break;
            case 'curious': toneInstruction = "Tone Mode: curious (Exploratory, Light questions, No assumptions)"; break;
            case 'confident': toneInstruction = "Tone Mode: confident (Clear, Concise, Decisive tradeoffs)"; break;
            case 'calm_reassuring': toneInstruction = "Tone Mode: calm_reassuring (Slower pacing, Grounded, Used for anxiety/confusion)"; break;
        }

        const userMessage = `
User Intent: ${userIntentSummary}
System Reasoning (Draft): "${tier1Narrative.reasoning}"

${toneInstruction}

Please rewrite the System Reasoning to match the Tone Mode. Keep the facts, improve the flow.
        `.trim();

        // SIGNAL: 30s Timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 200, // Hard limit 180 words -> ~250 tokens safe
                system: SYSTEM_PROMPT,
                messages: [
                    { role: "user", content: userMessage }
                ]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!anthropicResponse.ok) {
            const errText = await anthropicResponse.text();
            console.warn("Anthropic API Refusal/Error:", anthropicResponse.status, errText);

            // STANDARDIZED FAILURE RESPONSE (200 OK)
            return response.status(200).json({
                success: false,
                reason: "provider_refusal",
                narrative: null,
                details: `${anthropicResponse.status}: ${errText.slice(0, 100)}`
            });
        }

        const data = await anthropicResponse.json();
        const text = data.content?.[0]?.text || "";

        return response.status(200).json({
            success: true,
            narrative: text
        });

    } catch (error: any) {
        console.error("Claude Proxy Critical Error:", error);
        // STANDARDIZED FAILURE RESPONSE (200 OK)
        return response.status(200).json({
            success: false,
            reason: "internal_error",
            narrative: null
        });
    }
}
