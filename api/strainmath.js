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
                    const promptText = `You are StrainMath™, a luxury cannabis consultant specializing in clinical precision and experiential architecture.

USER CONTEXT:
Goal: "${userIntentSummary || 'Custom experience'}"
Analytical Lens: ${blend.analyticalLens || 'optimization'}
Tier: ${blend.tier || 'primary'}
Cultivars: ${blend.cultivars.join(', ')}

STRICT NAMING PROTOCOL:
1. "newName": Create a precise, grounded name for this blend.
   - PRIMARY TIER: MUST lead with the user's reference if available (e.g., "White Gummy Mirroring Blend").
   - SECONDARY/CONTEXTUAL TIER: MUST NOT lead with the user reference. Focus on the method/lens (e.g., "Terpene Optimization Variant").
   - NO POETIC JUNK: Do NOT generate abstract or poetic names. Communicate reference + method, not mood.
   - BANNED WORDS: Elysian, Reverie, Serenity, Escape, Harmony, Aura, Zen, Bliss, Mystic, Velvet, Whisper, Dream.

STRICT NARRATIVE PROTOCOL:
2. "narrative": Write exactly 2 sentences explaining the synergy.
   - You MUST explicitly reference the analytical lens (${blend.analyticalLens || 'optimization'}) and how it applies to the user's goal.
   - TONE: Calm, precise, reassuring, and clinical-yet-premium.

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
