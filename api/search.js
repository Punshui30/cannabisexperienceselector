/**
 * STRAINMATH SEARCH API
 * Path: /api/search
 * 
 * Uses Tavily for external grounding of unknown strains or consumer brands.
 */

// A) Cold start verification
if (process.env.ENABLE_TAVILY_DEBUG === 'true') {
    console.log('[TAVILY_DEBUG] server_debug_enabled=true');
}

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
        const enableDebug = process.env.ENABLE_TAVILY_DEBUG === 'true';
        const enableRawDump = process.env.ENABLE_TAVILY_RAW_DUMP === 'true';

        if (enableRawDump) {
            // Truncate giant content blobs in logs for safety/readability
            const safeDump = JSON.parse(JSON.stringify(data));
            if (safeDump.results) {
                safeDump.results = safeDump.results.map(r => ({
                    ...r,
                    content: r.content && r.content.length > 500 ? r.content.slice(0, 500) + '... [TRUNCATED]' : r.content
                }));
            }
            console.log("[TAVILY_RAW_RESULT]", JSON.stringify(safeDump, null, 2));
        }

        const evidence = (data.results || []).map((r) => ({
            title: r.title,
            url: r.url,
            snippet: r.content && r.content.length > 500 ? r.content.slice(0, 500) + '... [TRUNCATED]' : r.content,
            publishedDate: r.published_date,
            score: r.score // Catch Tavily confidence score per result
        }));

        const responseData = {
            query,
            provider: 'tavily',
            sourcesFound: evidence.length > 0,
            evidence,
            summary: data.answer || undefined
        };

        // Only return raw data to UI if debug is explicitly ON
        if (enableDebug) {
            responseData.raw = data;
        }

        return response.status(200).json(responseData);

    } catch (err) {
        console.error('[STRAIN_SEARCH] Exception:', err.message);
        return response.status(200).json({
            query,
            provider: 'tavily',
            sourcesFound: false,
            evidence: [],
            tavily_failed: true
        });
    }
}
