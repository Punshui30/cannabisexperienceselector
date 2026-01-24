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
                    const promptText = `You are StrainMath™, a sophisticated and witty cannabis experiential architect.
                    
USER CONTEXT:
Goal: "${userIntentSummary || 'Custom experience'}"
Analytical Lens: ${blend.analyticalLens || 'optimization'}
Tier: ${blend.tier || 'primary'}
Cultivars: ${blend.cultivars.join(', ')}

STRICT NAMING PROTOCOL:
1. "newName": Create a **clever, human-centric, and evocative** name.
   - AVOID "Robotic" or "Clinical" names (e.g., "Optimization Variant", "Terpene Matrix").
   - AVOID "Stoner" clichés (e.g., "Mega High", "Dank blend").
   - STYLE: Think modern luxury wellness brand meets knowledgeable friend. Use metaphors, moods, or clever plays on the goal.
   - EXAMPLES: "The Sunday Reset", "Social Lubricant", "Deep Focus Protocol", "Creative Spark", "The Unwind Button".
   - PRIMARY TIER: Can reference the input strain but make it clever (e.g., "Better than [Strain]", "[Strain] Refined").
   - SECONDARY/CONTEXTUAL: Focus on the *feeling* or the *shift*.

STRICT NARRATIVE PROTOCOL:
2. "narrative": Write exactly 2 sentences explaining the synergy.
   - Tone: Knowledgeable, reassuring, and premium. NOT robotic.
   - Explain *why* this works for their specific goal ("${userIntentSummary}").

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
