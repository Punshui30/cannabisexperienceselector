const { GoogleAuth } = require('google-auth-library');

module.exports = async function handler(request, response) {
    try {
        console.log('[TEST_VERTEX] Starting diagnostic check...');
        const projectId = process.env.GCP_PROJECT_ID;
        const saKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
        const region = process.env.GCP_REGION || 'us-central1';

        // 1. CHECK VARIABLES
        const varsCheck = {
            hasProjectId: !!projectId,
            projectIdLength: projectId ? projectId.length : 0,
            hasKey: !!saKey,
            keyLength: saKey ? saKey.length : 0,
            keyStartsWithBracket: saKey ? saKey.trim().startsWith('{') : false,
            region: region
        };

        if (!projectId || !saKey) {
            return response.status(200).json({
                ok: false,
                step: 'environment_check',
                error: 'Missing Variables',
                details: varsCheck
            });
        }

        // 2. CHECK KEY PARSING
        let credentials;
        try {
            credentials = typeof saKey === 'string' ? JSON.parse(saKey) : saKey;
        } catch (e) {
            return response.status(200).json({
                ok: false,
                step: 'key_parsing',
                error: 'JSON Parse Failed',
                details: { error: e.message, firstChars: saKey.substring(0, 5) }
            });
        }

        // 3. ATTEMPT AUTH
        const auth = new GoogleAuth({
            credentials,
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        if (!accessToken.token) {
            return response.status(200).json({
                ok: false,
                step: 'auth_token',
                error: 'No access token received'
            });
        }

        // 4. ATTEMPT SIMPLE GENERATION
        const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-1.5-flash-001:generateContent`;

        const vertexRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken.token}`
            },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: "Hello, are you online?" }] }],
                generationConfig: { maxOutputTokens: 10 }
            })
        });

        if (!vertexRes.ok) {
            const errorText = await vertexRes.text();
            return response.status(200).json({
                ok: false,
                step: 'api_call',
                status: vertexRes.status,
                error: errorText
            });
        }

        const data = await vertexRes.json();

        return response.status(200).json({
            ok: true,
            message: 'Vertex API is fully operational!',
            generated: data.candidates?.[0]?.content?.parts?.[0]?.text
        });

    } catch (err) {
        return response.status(200).json({
            ok: false,
            step: 'global_catch',
            error: err.message,
            stack: err.stack
        });
    }
};
