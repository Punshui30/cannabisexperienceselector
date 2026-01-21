/**
 * CLAUDE API PROXY
 * /api/claude
 * 
 * Server-side only. Protects ANTHROPIC_API_KEY.
 * Enforces System Prompt and Constraints.
 */

const SYSTEM_PROMPT = `
You are a narrative interpreter for a cannabis experience application.

Your job is to explain outcomes that have already been determined by the system.
You do NOT make decisions. You do NOT change results. You do NOT invent data.

CRITICAL POLICY:
1. ACT FIRST: If the user expressed a dislike or preference, the system has *already* acted on it. You explain the result. Never ask for permission.
2. SANITIZED LANGUAGE: Never use robotic phrases like "updating parameters", "adjusting variables", or "processing request". Speak human-to-human. "Got it, I've swapped that out."
3. NO CLARIFICATION: Do not ask clarifying questions about binary preferences. Assume the user wants a smart substitution.

Your goal is to explain the NEW blend state to the user.
Explain *why* the new blend is better given their input.
Cite the substitution if one happened (e.g. "I replaced Cherry Pie with [Substitute] to avoid the cherry notes while keeping the [Effect].")

Your output must be plain text only. Max 140 words.
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

    const { userIntentSummary, decisionSummary, blendSummary, toneMode } = request.body;

    // Construct the User Message based on Tone
    let toneInstruction = "Tone Mode: neutral (Informative, Balanced, No emotional language)";

    switch (toneMode) {
        case 'supportive': toneInstruction = "Tone Mode: supportive (Acknowledge preferences, Validate experience, Gentle)"; break;
        case 'curious': toneInstruction = "Tone Mode: curious (Exploratory, Light questions, No assumptions)"; break;
        case 'confident': toneInstruction = "Tone Mode: confident (Clear, Concise, Decisive tradeoffs)"; break;
        case 'calm_reassuring': toneInstruction = "Tone Mode: calm_reassuring (Slower pacing, Grounded, Used for anxiety/confusion)"; break;
    }

    // Format Blend Summary for Prompt
    const formattedContext = blendSummary.map((b: any, i: number) =>
        `Option ${i + 1} (${b.name}): Contains ${b.cultivars.join(', ')}.`
    ).join('\n');

    const userMessage = `
User Intent: ${userIntentSummary}
System Decision: ${decisionSummary}
Outcome Context:
${formattedContext}

${toneInstruction}

Explain this outcome to the user. Max 140 words. Plain text only.
    `.trim();

    try {
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
            })
        });

        if (!anthropicResponse.ok) {
            const errText = await anthropicResponse.text();
            console.error("Anthropic API Error:", anthropicResponse.status, errText);
            return response.status(500).json({ error: "Upstream Error" });
        }

        const data = await anthropicResponse.json();
        const text = data.content?.[0]?.text || "";

        return response.status(200).json({ narrative: text });

    } catch (error: any) {
        console.error("Claude Proxy Error:", error);
        return response.status(500).json({ error: "Internal Error" });
    }
}
