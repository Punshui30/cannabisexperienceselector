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

    const { query } = request.body;

    if (!query) {
        return response.status(400).json({ error: 'Missing query' });
    }

    try {
        const provider = new TavilySearchProvider();
        const result = await provider.search(query);

        return response.status(200).json(result);

    } catch (error: any) {
        console.error('Search API Error:', error);
        return response.status(500).json({ error: 'Internal Search Error' });
    }
}
