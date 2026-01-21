import { TavilySearchProvider } from '../src/lib/search/providers/tavily';

/**
 * SERVERLESS FUNCTION HANDLER
 * Path: /api/search
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

    try {
        // Safe Body Access
        const body = request.body || {};
        const { query } = body;

        if (!query) {
            console.warn('Search API: Missing query in request body');
            // Return empty results is safer than error for this app's flow
            return response.status(200).json({
                query: "",
                provider: "system",
                sourcesFound: false,
                evidence: [],
                summary: "No query provided."
            });
        }

        const provider = new TavilySearchProvider();
        const result = await provider.search(query);

        return response.status(200).json(result);

    } catch (error: any) {
        console.error('Search API Critical Failure:', error);
        // STANDARDIZED FAILURE RESPONSE (200 OK)
        // Prevents client-side crashes
        return response.status(200).json({
            query: "unknown",
            provider: "system",
            sourcesFound: false,
            evidence: [],
            error: "Internal Search Error" // Metadata for debugging
        });
    }
}
