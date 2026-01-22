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

        const { tier1Narrative, toneMode, image, promptOverride, userIntentSummary, blendSummary } = request.body || {};

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
        const GCP_SERVICE_ACCOUNT_KEY = process.env.GCP_SERVICE_ACCOUNT_KEY;
        const region = process.env.GCP_REGION || 'us-central1';

        // CASE 1: VISION MODE (Vertex AI)
        if (image) {
            if (!GCP_PROJECT_ID || !GCP_SERVICE_ACCOUNT_KEY) {
                return response.status(200).json({ ok: false, error: 'missing_gcp_config' });
            }

            const credentials = typeof GCP_SERVICE_ACCOUNT_KEY === 'string' ? JSON.parse(GCP_SERVICE_ACCOUNT_KEY) : GCP_SERVICE_ACCOUNT_KEY;
            const auth = new GoogleAuth({
                credentials,
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            });
            const authClient = await auth.getClient();
            const accessToken = await authClient.getAccessToken();
            const token = accessToken.token;

            const modelId = 'gemini-1.5-flash';
            const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${region}/publishers/google/models/${modelId}:generateContent`;

            const contents = [{
                role: "user",
                parts: [
                    { text: promptOverride || "Extract every technical detail from this cannabis product label. Focus on Strains, Cannabinoids (THC, CBD, CBG), and Terpenes." },
                    { inlineData: { mimeType: "image/jpeg", data: image.split(',')[1] || image } }
                ]
            }];

            const vertexRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ contents, generationConfig: { temperature: 0.1, maxOutputTokens: 1024 } })
            });

            if (!vertexRes.ok) throw new Error(`Vertex Vision Failed: ${await vertexRes.text()}`);
            const data = await vertexRes.json();
            return response.status(200).json({ ok: true, data: data.candidates?.[0]?.content?.parts?.[0]?.text });
        }

        // CASE 2: NARRATIVE MODE (OpenAI)
        if (tier1Narrative) {
            if (!OPENAI_API_KEY) return response.status(200).json({ ok: false, error: 'missing_openai_key' });

            const primaryBlend = blendSummary?.[0] || {};
            const cultivarList = primaryBlend.cultivars || [];

            const promptText = `You are StrainMath™, an expert cannabis consultant.
USER REQUEST: "${userIntentSummary || 'Custom experience'}"
BLEND: ${cultivarList.join(', ')}
Write a 2-sentence explanation of why this blend works for them. Tone: ${toneMode || 'neutral'}.`;

            const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: promptText }],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            if (!openaiRes.ok) throw new Error(`OpenAI Narrative Failed: ${await openaiRes.text()}`);
            const data = await openaiRes.json();
            const resultText = data.choices?.[0]?.message?.content?.trim();

            return response.status(200).json({ ok: true, narrative: resultText, data: resultText });
        }

        return response.status(200).json({ ok: false, error: 'Invalid Request' });

    } catch (err) {
        console.error('[STRAINMATH_GLOBAL_ERROR]', err.message);
        return response.status(500).json({ ok: false, error: 'server_error', details: err.message });
    }
};
