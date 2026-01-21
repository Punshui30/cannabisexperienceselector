import { TavilySearchProvider } from '../src/lib/search/providers/tavily';

/**
 * SERVERLESS FUNCTION HANDLER
 * Path: /api/search
 * 
 * HARDENED IMPLEMENTATION:
 * - Strict TAVILY_API_KEY validation
 * - Safe JSON body parsing
 * - Graceful degradation with tavily_failed flag
 * - Never returns 500
 */
export default async function handler(request: any, response: any) {
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

    // STRICT: Validate TAVILY_API_KEY presence
    const apiKeyPresent = !!process.env.TAVILY_API_KEY;
    console.log(`[SEARCH_API] API Key Present: ${apiKeyPresent}`);

    if (!apiKeyPresent) {
        console.error('[SEARCH_API] TAVILY_API_KEY missing from environment');
        return response.status(200).json({
            query: "",
            provider: "tavily",
            sourcesFound: false,
            evidence: [],
            tavily_failed: true,
            error: "Search configuration error: Missing API key"
        });
    }

    try {
        // SAFE: Parse request body with fallback
        let body: any = {};
        try {
            body = request.body || {};
        } catch (parseError) {
            console.warn('[SEARCH_API] Failed to parse request body, using empty object');
        }

        const { query } = body;

        if (!query || typeof query !== 'string') {
            console.warn('[SEARCH_API] Missing or invalid query in request body');
            return response.status(200).json({
                query: "",
                provider: "system",
                sourcesFound: false,
                evidence: [],
                summary: "No query provided."
            });
        }

        console.log(`[SEARCH_API] Request received for query: "${query}"`);
        console.log('[SEARCH_API] Tavily request start');

        const provider = new TavilySearchProvider();
        const result = await provider.search(query);

        console.log(`[SEARCH_API] Tavily response status: ${result.sourcesFound ? 'success' : 'no results'}`);
        console.log(`[SEARCH_API] Success: Found ${result.evidence.length} sources`);

        return response.status(200).json(result);

    } catch (error: any) {
        console.error(`[SEARCH_API] Critical Failure:`, error);

        // GRACEFUL DEGRADATION: Return 200 with tavily_failed flag
        return response.status(200).json({
            query: request.body?.query || "unknown",
            provider: "tavily",
            sourcesFound: false,
            evidence: [],
            tavily_failed: true,
            error: "Tavily search failed"
        });
    }
}
