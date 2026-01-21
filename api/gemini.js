/**
 * GEMINI API PROXY (Hardened V5)
 * 
 * Primary Engine LLM for blend narratives.
 * ALWAYS returns 200 OK Status.
 */

module.exports = async function handler(request, response) {
    try {
        console.log('[GEMINI_API_V5] Request started');

        // CORS Header Setup
        response.setHeader('Access-Control-Allow-Credentials', true);
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
        response.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (request.method === 'OPTIONS') {
            response.status(200).end();
            return;
        }

        if (request.method !== 'POST') {
            return response.status(200).json({ ok: false, error: 'Method Not Allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[GEMINI_API_V5] Missing GEMINI_API_KEY');
            return response.status(200).json({ ok: false, error: 'missing_key' });
        }

        const { tier1Narrative, userIntentSummary, decisionSummary, toneMode } = request.body || {};

        if (!tier1Narrative?.reasoning) {
            return response.status(200).json({ ok: false, error: 'Missing Reasoning' });
        }

        const promptText = `You are a premium cannabis experience narrator.
Role: Enhance Tier-1 technical narratives into compelling, natural language.
Rule: No new facts, preserve all cultivars.
Tone: ${toneMode || 'neutral'}
Blend: ${tier1Narrative.name}
Facts: ${tier1Narrative.reasoning}`;

        // Use global fetch (built-in to Node 18+)
        // If it fails, the catch block will return 200
        const geminiRes = await fetch(
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

        if (!geminiRes.ok) {
            const status = geminiRes.status;
            return response.status(200).json({ ok: false, error: 'api_failed', status });
        }

        const data = await geminiRes.json();
        const narrative = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(' ').trim();

        if (!narrative) {
            return response.status(200).json({ ok: false, error: 'no_narrative' });
        }

        console.log('[GEMINI_API_V5] Success');
        return response.status(200).json({ ok: true, narrative });

    } catch (err) {
        console.error('[GEMINI_API_V5] Fatal Error:', err.message);
        return response.status(200).json({
            ok: false,
            error: 'fatal_error',
            details: err.message
        });
    }
};
