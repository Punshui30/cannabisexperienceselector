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
                    const promptText = `You are StrainMath™, a knowledgeable friend who knows cannabis perfectly.
                    
USER CONTEXT:
Goal: "${userIntentSummary || 'Custom experience'}"
Analytical Lens: ${blend.analyticalLens || 'optimization'}
Tier: ${blend.tier || 'primary'}
Cultivars: ${blend.cultivars.join(', ')}

STRICT NAMING PROTOCOL:
1. "newName": Create a **natural, colloquial, and grounded** name.
   - TONE: Conversational, confident, plain English. Like a good budtender talking to a friend.
   - AVOID CLINICAL: No "Protocol", "System", "Matrix", "Optimization", "Architecture".
   - AVOID POETIC: No "Elysian", "Aether", "Serenity", "Journey", "Whisper".
   - AVOID MARKETING: No "Super", "Mega", "Ultimate", "Premium".
   - EXAMPLES: "Easygoing Focus", "Chill but Clear", "Social, Not Spaced", "Relaxed with a Backbone", "Calm, Still Alert".
   - LENGTH: 2-4 words max. Title Case.

   **CRITICAL CONTEXT RULE:**
   - IF the user mentions a specific strain (e.g., "Bubba Kush") OR a specific problem (e.g., "not hitting"):
     - You MUST name it as a **custom reinterpretation**.
     - FORMAT: "[Strain] Dialed In", "[Strain] (Reliable)", "Better [Strain]", "The [Strain] Fix".
     - IGNORE generic examples. Use the USER'S CONTEXT.

STRICT NARRATIVE PROTOCOL:
2. "narrative": Write exactly 2 sentences in plain, human language.
   - Tone: Grounded, clear, and reassuring.
   - Explain *how it feels*, not the science behind it.
   - Avoid "synergy", "mechanisms", "modulates". Say "mixes", "feels like", "helps you".

   **CRITICAL CONTEXT RULE:**
   - IF the user mentions a specific strain or issue:
     - You MUST explicitly reference it.
     - Example: "This is built to keep what you like about Bubba Kush, but smooth out the times it doesn’t quite hit the same."
     - DO NOT write generic lifestyle copy if specific context exists.

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
