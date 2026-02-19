/**
 * PERPLEXITY EVIDENCE PROXY
 * 
 * Securely handles research grounding requests using the Perplexity Sonar API.
 */

module.exports = async function handler(request, response) {
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

    try {
        const pplxResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PPLX_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-reasoning', // Using reasoning model for citations
                messages: [
                    {
                        role: 'system',
                        content: 'You are a scientific research assistant specializing in cannabis chemistry. Provide structured research grounding with citations.'
                    },
                    { role: 'user', content: query }
                ],
                max_tokens: 1000,
                temperature: 0.2
            })
        });

        if (!pplxResponse.ok) {
            const err = await pplxResponse.text();
            console.error('PPLX API ERROR:', err);
            return response.status(pplxResponse.status).json({ error: 'Perplexity API failure', details: err });
        }

        const data = await pplxResponse.json();
        const content = data.choices[0].message.content;

        // Note: In a production environment, we would use a structured output parse here.
        // For the demo, we will parse common markdown/bullet patterns.

        const summaryBullets = content.split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(line => line.replace(/^[\s-*]+/, '').trim())
            .slice(0, 5);

        // Simple citation extraction heuristic
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
            raw: content
        });

    } catch (error) {
        console.error('EVIDENCE PROXY ERROR:', error);
        return response.status(500).json({ error: 'Internal Server Error', details: error.toString() });
    }
};
