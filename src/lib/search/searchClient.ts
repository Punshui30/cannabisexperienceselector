import { SearchPayload, SearchResult } from './types';

/**
 * CLIENT-SIDE SEARCH WRAPPER
 * 
 * Calls the /api/search endpoint (Server Function) which handles the actual provider logic.
 * Securely separates Client from API Keys.
 */

const SEARCH_ENDPOINT = '/api/search';

export async function performSearch(query: string): Promise<SearchResult | null> {
    try {
        const payload: SearchPayload = { query };

        const response = await fetch(SEARCH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.warn(`Search API call failed: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data as SearchResult;

    } catch (e) {
        console.warn('Search Client Exception:', e);
        return null;
    }
}
