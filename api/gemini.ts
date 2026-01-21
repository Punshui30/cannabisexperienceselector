/**
 * GEMINI API PROXY (Hardened V4)
 * 
 * Primary Engine LLM for blend narratives.
 * Always returns 200 OK.
 */

export default async function handler(req: any, res: any) {
    try {
        console.log('[GEMINI_API_V4] Request received');

        // CORS Header Setup
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method !== 'POST') {
            return res.status(200).json({ ok: false, error: 'method_not_allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[GEMINI_API_V4] Missing API KEY');
            return res.status(200).json({ ok: false, error: 'missing_key' });
        }

        const body = req.body || {};
        const { tier1Narrative, userIntentSummary, decisionSummary, toneMode } = body;

        if (!tier1Narrative?.reasoning) {
            return res.status(200).json({ ok: false, error: 'invalid_input' });
        }

        const promptText = `You are a premium cannabis experience narrator.
Role: Enhance Tier-1 technical narratives into compelling, natural language.
Strict Rule: No new data, no fact changes, preserve all cultivars.
Tone: ${toneMode || 'neutral'}
Blend: ${tier1Narrative.name}
Facts: ${tier1Narrative.reasoning}
Limit: 2-3 sentences.`;

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: promptText }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
                })
            }
        );

        if (!geminiResponse.ok) {
            const status = geminiResponse.status;
            const text = await geminiResponse.text();
            console.warn('[GEMINI_API_V4] External API Error:', status, text.slice(0, 100));
            return res.status(200).json({ ok: false, error: 'api_failed', status });
        }

        const rawJson = await geminiResponse.text();
        let data;
        try {
            data = JSON.parse(rawJson);
        } catch (e) {
            return res.status(200).json({ ok: false, error: 'invalid_json', raw: rawJson.slice(0, 50) });
        }

        const narrative = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(' ').trim();

        if (!narrative) {
            return res.status(200).json({ ok: false, error: 'no_narrative' });
        }

        console.log('[GEMINI_API_V4] Success');
        return res.status(200).json({ ok: true, narrative });

    } catch (err: any) {
        console.error('[GEMINI_API_V4] Fatal Error:', err.message);
        return res.status(200).json({
            ok: false,
            error: 'fatal_error',
            details: err.message || 'Unknown crash'
        });
    }
}
