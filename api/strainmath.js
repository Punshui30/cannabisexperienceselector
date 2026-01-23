const { GoogleAuth } = require('google-auth-library');

module.exports = async function handler(request, response) {
    try {
        console.log('[STRAINMATH_GATEWAY] Request started');

        // CORS Headers
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

        const { tier1Narrative, toneMode, image, userIntentSummary, blendSummary } = request.body || {};

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        // CASE 1: VISION MODE (Quarantined)
        if (image) {
            console.log('[STRAINMATH_GATEWAY] Vision request received but feature is QUARANTINED.');
            return response.status(200).json({ ok: false, error: 'feature_quarantined', data: 'Camera recognition is temporarily disabled.' });
        }

        // CASE 2: NARRATIVE MODE (OpenAI - for ALL blends)
        if (tier1Narrative && blendSummary) {
            if (!OPENAI_API_KEY) return response.status(200).json({ ok: false, error: 'missing_openai_key' });

            try {
                const results = await Promise.all(blendSummary.map(async (blend) => {
                    const promptText = `You are StrainMath™, a luxury cannabis branding expert and consultant.
USER GOAL: "${userIntentSummary || 'Custom experience'}"
CULTIVARS: ${blend.cultivars.join(', ')}

YOUR TASK:
1. "newName": Create an ultra-premium, evocative name for this blend. Avoid using cultivar names in the title. Focus on the outcome! (Examples: "The Creative Engine", "Coastal Calm", "Neural Reboot").
2. "narrative": Write 2 sentences on the specific metabolic synergy between these cultivars for this user's goal.

TONE: ${toneMode || 'neutral'}, sophisticated, professional.
FORMAT: JSON { "newName": "...", "narrative": "..." }`;

                    const res = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [{ role: 'user', content: promptText }],
                            temperature: 0.9,
                            response_format: { type: "json_object" }
                        })
                    });
                    const d = await res.json();
                    const parsed = JSON.parse(d.choices?.[0]?.message?.content || '{}');
                    console.log(`[STRAINMATH_NAMING] Created Name: ${parsed.newName}`);
                    return parsed;
                }));

                return response.status(200).json({ ok: true, narratives: results });

            } catch (err) {
                console.error('[STRAINMATH_NARRATIVE] OpenAI Error:', err.message);
                return response.status(200).json({ ok: false, error: 'narrative_failed' });
            }
        }

        return response.status(200).json({ ok: false, error: 'Invalid Request' });

    } catch (err) {
        console.error('[STRAINMATH_GLOBAL_ERROR]', err.message);
        return response.status(500).json({ ok: false, error: 'server_error', details: err.message });
    }
};
