/**
 * PERPLEXITY EVIDENCE PROXY
 * 
 * Securely handles research grounding requests using the Perplexity Sonar API.
 */

module.exports = async function handler(request, response) {
    // Enable CORS for cross-environment safety
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query, claimKey } = request.body;

    // Hard Gate: Backend Enforcement
    if (process.env.APP_MODE === 'merchant') {
        return response.status(403).json({ error: 'Evidence fetching is strictly prohibited in Merchant Mode.' });
    }

    if (!query) {
        return response.status(400).json({ error: 'Missing query' });
    }

    const PPLX_KEY = process.env.PERPLEXITY_API_KEY;

    if (!PPLX_KEY) {
        console.error('[EVIDENCE] PERPLEXITY_API_KEY is not set in environment variables.');
        return response.status(500).json({
            error: 'Configuration Error',
            details: 'Perplexity API key is missing on the server backend.'
        });
    }

    try {
        console.log(`[EVIDENCE] Requesting Perplexity for: "${query}"`);

        const isStrainSummary = typeof claimKey === 'string' && claimKey.startsWith('__strain_summary_');

        const systemPrompt = isStrainSummary
            ? 'You are a cannabis strain information assistant. Return ONLY valid JSON matching the schema the user provides. No markdown code fences, no prose, no commentary. Strict JSON only.'
            : 'You are a scientific research assistant specializing in cannabis chemistry. Provide structured research grounding with citations.';

        const pplxResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PPLX_KEY.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                max_tokens: isStrainSummary ? 800 : 1000,
                temperature: isStrainSummary ? 0.1 : 0.2
            })
        });

        if (!pplxResponse.ok) {
            const errText = await pplxResponse.text();
            console.error(`[EVIDENCE] Perplexity API Error (${pplxResponse.status}):`, errText);

            let jsonErr;
            try { jsonErr = JSON.parse(errText); } catch (e) { jsonErr = null; }

            return response.status(pplxResponse.status).json({
                error: 'Perplexity API failure',
                details: jsonErr?.error?.message || errText,
                code: pplxResponse.status
            });
        }

        const data = await pplxResponse.json();
        const content = data.choices[0].message.content;

        // Simple markdown parsing for bullets
        const summaryBullets = content.split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(line => line.replace(/^[\s-*]+/, '').trim())
            .slice(0, 5);

        const citations = (data.citations || []).map((url, i) => ({
            title: `Source ${i + 1}`,
            url
        }));

        const sourceDomains = Array.from(new Set(citations.map(c => {
            try { return new URL(c.url).hostname; } catch { return 'research-node'; }
        })));

        return response.status(200).json({
            title: `Evidence: ${claimKey}`,
            summaryBullets: summaryBullets.length > 0 ? summaryBullets : [content.slice(0, 200) + '...'],
            citations,
            sourceDomains,
            confidence: 'Strong',
            raw: content,
            rawText: content  // alias: used by StrainSummaryProvider JSON extraction
        });

    } catch (error) {
        console.error('EVIDENCE PROXY UNCAUGHT ERROR:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            details: error.message || 'An unknown error occurred during evidence fetching.'
        });
    }
};
