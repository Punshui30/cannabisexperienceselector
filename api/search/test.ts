import { TavilySearchProvider } from '../../src/lib/search/providers/tavily';

/**
 * TAVILY CONNECTIVITY TEST ENDPOINT
 * Path: /api/search/test
 * 
 * Simple smoke test for Tavily integration.
 * No orchestration, no engine, no LLM.
 * Returns raw connectivity status.
 */
export default async function handler(request: any, response: any) {
    // CORS Header Setup
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log('[SEARCH_TEST] Connectivity test initiated');

    // Check API key presence
    const apiKeyPresent = !!process.env.TAVILY_API_KEY;

    if (!apiKeyPresent) {
        console.error('[SEARCH_TEST] TAVILY_API_KEY missing');
        return response.status(200).json({
            ok: false,
            error: 'TAVILY_API_KEY not configured'
        });
    }

    try {
        const provider = new TavilySearchProvider();
        const result = await provider.search('White Gummy cannabis strain');

        console.log(`[SEARCH_TEST] Success: ${result.evidence.length} results`);

        return response.status(200).json({
            ok: true,
            resultsCount: result.evidence.length,
            source: 'tavily',
            sourcesFound: result.sourcesFound
        });

    } catch (error: any) {
        console.error('[SEARCH_TEST] Tavily request failed:', error);

        return response.status(200).json({
            ok: false,
            error: error.message || 'Tavily connectivity failed'
        });
    }
}
