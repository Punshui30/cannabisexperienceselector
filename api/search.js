/**
 * STRAINMATH SEARCH API
 * Path: /api/search
 * 
 * Uses Tavily for external grounding of unknown strains or consumer brands.
 */

module.exports = async function handler(request, response) {
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
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = request.body || {};

    if (!query) {
        return response.status(200).json({ sourcesFound: false, evidence: [], query: "" });
    }

    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!TAVILY_API_KEY) {
        console.error('[STRAINMATH_SEARCH] Missing TAVILY_API_KEY');
        return response.status(200).json({
            query,
            provider: 'tavily',
            sourcesFound: false,
            evidence: [],
            tavily_failed: true,
            error: "API Key missing"
        });
    }

    try {
        console.log(`[STRAINMATH_SEARCH] Query: "${query}"`);

        const tavilyRes = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5,
                topic: "general"
            })
        });

        if (!tavilyRes.ok) {
            console.error(`[STRAINMATH_SEARCH] Tavily status: ${tavilyRes.status}`);
            return response.status(200).json({
                query,
                provider: 'tavily',
                sourcesFound: false,
                evidence: [],
                tavily_failed: true
            });
        }

        const data = await tavilyRes.json();

        const evidence = (data.results || []).map((r) => ({
            title: r.title,
            url: r.url,
            snippet: r.content,
            publishedDate: r.published_date
        }));

        return response.status(200).json({
            query,
            provider: 'tavily',
            sourcesFound: evidence.length > 0,
            evidence,
            summary: data.answer || undefined
        });

    } catch (err) {
        console.error('[STRAINMATH_SEARCH] Exception:', err.message);
        return response.status(200).json({
            query,
            provider: 'tavily',
            sourcesFound: false,
            evidence: [],
            tavily_failed: true
        });
    }
}
