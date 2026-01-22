const { GoogleAuth } = require('google-auth-library');

module.exports = async function handler(request, response) {
    try {
        console.log('[STRAINMATH_VERTEX] Request started');

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

        // 1. Validate Environment
        const projectId = process.env.GCP_PROJECT_ID;
        const saKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
        const region = process.env.GCP_REGION || 'us-central1';

        if (!projectId || !saKey) {
            console.error('[STRAINMATH_VERTEX] Missing GCP_PROJECT_ID or GCP_SERVICE_ACCOUNT_KEY');
            return response.status(200).json({ ok: false, error: 'missing_gcp_config' });
        }

        const { tier1Narrative, toneMode, image, promptOverride } = request.body || {};

        // 2. Auth Flow (Get Bearer Token)
        let authClient;
        try {
            const credentials = typeof saKey === 'string' ? JSON.parse(saKey) : saKey;
            const auth = new GoogleAuth({
                credentials,
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            });
            authClient = await auth.getClient();
        } catch (authErr) {
            console.error('[STRAINMATH_VERTEX] Auth Error:', authErr.message);
            return response.status(200).json({ ok: false, error: 'auth_failed', details: authErr.message });
        }

        const accessToken = await authClient.getAccessToken();
        const token = accessToken.token;

        // 3. Prepare Vertex Request
        let contents = [];
        let modelId = 'gemini-1.5-flash';

        if (image) {
            // VISION MODE
            contents = [{
                role: "user",
                parts: [
                    { text: promptOverride || "Extract every technical detail from this cannabis product label. Focus on Strains, Cannabinoids (THC, CBD, CBG), and Terpenes. Return as a clean data object if possible, or a detailed breakdown." },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: image.split(',')[1] || image // Handle data URL or raw base64
                        }
                    }
                ]
            }];
        } else if (tier1Narrative) {
            // NARRATIVE MODE
            const { userIntentSummary, blendSummary } = request.body;

            // Extract cultivar details from blend summary
            const primaryBlend = blendSummary?.[0] || {};
            const cultivarList = primaryBlend.cultivars || [];
            const cultivarCount = cultivarList.length;

            const promptText = `You are StrainMath™, an expert cannabis consultant explaining a custom blend.

USER REQUEST: "${userIntentSummary || 'Custom experience'}"

BLEND COMPOSITION:
${cultivarList.map((c, i) => `${i + 1}. ${c} (${Math.round(100 / cultivarCount)}%)`).join('\n')}

YOUR TASK:
Write a 2-3 sentence explanation that covers:
1. WHY this specific combination was chosen for their request
2. The ROLE each cultivar plays (anchor, complement, modifier)
3. The SYNERGY between cultivars and expected experience

TONE: ${toneMode || 'neutral'}, professional, confident
STYLE: Natural, conversational, avoid marketing fluff
LENGTH: 2-3 sentences maximum

Write the explanation now:`;

            contents = [{ role: "user", parts: [{ text: promptText }] }];
        } else {
            return response.status(200).json({ ok: false, error: 'Missing Input (Narrative or Image)' });
        }

        const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${modelId}:generateContent`;

        const vertexRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!vertexRes.ok) {
            const status = vertexRes.status;
            const errorData = await vertexRes.json().catch(() => ({ error: { message: 'Failed to parse error body' } }));
            const errorMessage = errorData.error?.message || 'Unknown Vertex Error';

            console.error(`[STRAINMATH_VERTEX] API Failed (Status ${status}): ${errorMessage}`);

            // Return failure but with the message included
            return response.status(200).json({
                ok: false,
                error: 'vertex_api_failure',
                details: errorMessage,
                narrative: tier1Narrative?.reasoning,
                mode: 'deterministic_fallback'
            });
        }

        const data = await vertexRes.json();

        // 4. Extract Narrative
        const candidates = data.candidates || [];
        const parts = candidates[0]?.content?.parts || [];
        const resultText = parts.map(p => p.text).join(' ').trim();

        if (!resultText) {
            return response.status(200).json({ ok: false, error: 'no_content_generated', details: JSON.stringify(data) });
        }

        console.log('[STRAINMATH_VERTEX] Success');
        console.log('[STRAINMATH_VERTEX] Generated Narrative:', resultText);
        return response.status(200).json({ ok: true, narrative: resultText, data: resultText });

    } catch (err) {
        console.error('[STRAINMATH_VERTEX] Global Error:', err.message);
        return response.status(200).json({
            ok: false,
            error: 'server_error',
            details: err.message
        });
    }
};
