const { GoogleAuth } = require('google-auth-library');

module.exports = async function handler(request, response) {
    const projectId = process.env.GCP_PROJECT_ID;
    const saKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
    const region = process.env.GCP_REGION || 'us-central1';

    if (!projectId || !saKey) {
        return response.status(200).json({ ok: false, error: 'missing_gcp_config' });
    }

    try {
        const auth = new GoogleAuth({
            credentials: JSON.parse(saKey),
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();
        const token = accessToken.token;

        const url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        return response.status(200).json({ ok: true, data });
    } catch (err) {
        return response.status(200).json({ ok: false, error: err.message });
    }
};
