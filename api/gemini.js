/**
 * GEMINI VERTEX API PROXY (V9.2 - Vertex AI Transition)
 * 
 * Path: /api/gemini.js
 * Uses Google Vertex AI (Enterprise) instead of AI Studio.
 * Requires: GCP_PROJECT_ID, GCP_SERVICE_ACCOUNT_KEY, GCP_REGION (optional)
 */

const { GoogleAuth } = require('google-auth-library');

module.exports = async function handler(request, response) {
    try {
        console.log('[GEMINI_VERTEX_V9.2] Request started');

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
            console.error('[GEMINI_VERTEX_V9.2] Missing GCP_PROJECT_ID or GCP_SERVICE_ACCOUNT_KEY');
            return response.status(200).json({ ok: false, error: 'missing_gcp_config' });
        }

        const { tier1Narrative, toneMode } = request.body || {};
        if (!tier1Narrative || !tier1Narrative.reasoning) {
            return response.status(200).json({ ok: false, error: 'Missing Input' });
        }

        // 2. Auth Flow (Get Bearer Token)
        let authClient;
        try {
            const auth = new GoogleAuth({
                credentials: JSON.parse(saKey),
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            });
            authClient = await auth.getClient();
        } catch (authErr) {
            console.error('[GEMINI_VERTEX_V9.2] Auth Error:', authErr.message);
            return response.status(200).json({ ok: false, error: 'auth_failed', details: authErr.message });
        }

        const accessToken = await authClient.getAccessToken();
        const token = accessToken.token;

        // 3. Prepare Vertex Request
        const promptText = `You are a premium cannabis experience narrator.
Role: Enhance Tier-1 technical narratives into compelling, natural language.
Rule: No new facts, preserve all cultivars.
Tone: ${toneMode || 'neutral'}
Blend: ${tier1Narrative.name}
Facts: ${tier1Narrative.reasoning}`;

        const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-1.5-flash-001:generateContent`;

        const vertexRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!vertexRes.ok) {
            const status = vertexRes.status;
            const errorText = await vertexRes.text().catch(() => 'Could not read error body');
            console.error(`[GEMINI_VERTEX_V9.2] API Error ${status}:`, errorText);
            return response.status(200).json({
                ok: false,
                error: 'vertex_api_failed',
                status,
                details: errorText.substring(0, 200)
            });
        }

        const data = await vertexRes.json();

        // 4. Extract Narrative
        const candidates = data.candidates || [];
        const parts = candidates[0]?.content?.parts || [];
        const narrative = parts.map(p => p.text).join(' ').trim();

        if (!narrative) {
            return response.status(200).json({ ok: false, error: 'no_narrative_extracted' });
        }

        console.log('[GEMINI_VERTEX_V9.2] Success');
        return response.status(200).json({ ok: true, narrative });

    } catch (err) {
        console.error('[GEMINI_VERTEX_V9.2] Global Error:', err.message);
        return response.status(200).json({
            ok: false,
            error: 'server_error',
            details: err.message
        });
    }
};
