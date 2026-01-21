/**
 * GEMINI API PROXY (Hardened V8 - TypeScript)
 * 
 * Path: /api/gemini.ts
 * Primary Engine LLM for blend narratives.
 * GUARANTEED 200 OK STATUS.
 */

export default async function handler(request: any, response: any) {
    try {
        console.log('[GEMINI_API_V8] Request started');

        // CORS Header Setup (Standard for Vercel functions)
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
        response.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (request.method === 'OPTIONS') {
            return response.status(200).end();
        }

        if (request.method !== 'POST') {
            return response.status(200).json({ ok: false, error: 'method_not_allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[GEMINI_API_V8] Missing API KEY in Environment');
            return response.status(200).json({ ok: false, error: 'missing_key' });
        }

        // Use request.body (Vercel parses this automatically for JSON)
        const { tier1Narrative, toneMode } = request.body || {};

        if (!tier1Narrative?.reasoning) {
            return response.status(200).json({ ok: false, error: 'invalid_input' });
        }

        const promptText = `You are a premium cannabis experience narrator.
Role: Enhance Tier-1 technical narratives into compelling, natural language.
Rule: No new facts, preserve all cultivars.
Tone: ${toneMode || 'neutral'}
Blend: ${tier1Narrative.name}
Facts: ${tier1Narrative.reasoning}`;

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
            const errorText = await geminiRes.text().catch(() => 'No error text');
            console.warn(`[GEMINI_API_V8] API Error ${status}:`, errorText.slice(0, 100));
            return response.status(200).json({ ok: false, error: 'api_failed', status });
        }

        const data = await geminiRes.json();

        // Robust Extraction
        const textParts = data?.candidates?.[0]?.content?.parts || [];
        const narrative = textParts.map((p: any) => p.text || '').join(' ').trim();

        if (!narrative) {
            console.warn('[GEMINI_API_V8] No narrative extraction possible', JSON.stringify(data).slice(0, 100));
            return response.status(200).json({ ok: false, error: 'empty_extraction' });
        }

        console.log('[GEMINI_API_V8] Success');
        return response.status(200).json({ ok: true, narrative });

    } catch (err: any) {
        console.error('[GEMINI_API_V8] Global Catch:', err.message);
        return response.status(200).json({
            ok: false,
            error: 'server_crash',
            details: err.message || 'Unknown'
        });
    }
}
