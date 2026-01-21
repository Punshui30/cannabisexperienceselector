import { SearchProvider, SearchResult } from '../types';

/**
 * TAVILY SEARCH PROVIDER
 * SERVER-SIDE ONLY
 * 
 * This module should ONLY be imported by Server Functions (api/*).
 * Do NOT import this into Client components.
 */

const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

export class TavilySearchProvider implements SearchProvider {
    private apiKey: string;

    constructor() {
        // TAVILY_API_KEY must be in .env.local / Vercel Environment Variables
        this.apiKey = process.env.TAVILY_API_KEY || '';
        if (!this.apiKey && process.env.NODE_ENV !== 'production') {
            console.warn('TAVILY_API_KEY is missing in environment variables.');
        }
    }

    async search(query: string): Promise<SearchResult> {
        if (!this.apiKey) {
            console.error('Tavily Search Failed: No API Key');
            return {
                query,
                provider: 'tavily',
                sourcesFound: false,
                evidence: [],
                summary: 'Search configuration error: Missing API Key.'
            };
        }

        try {
            const response = await fetch(TAVILY_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    query: query,
                    search_depth: "advanced",
                    include_answer: true,
                    include_raw_content: false,
                    max_results: 5,
                    // Focus on factual cannabis data if possible, though Tavily is general
                    topic: "general"
                })
            });

            if (!response.ok) {
                console.warn(`Tavily API returned ${response.status}`);
                throw new Error(`Tavily API error: ${response.status}`);
            }

            const data = await response.json();

            // Transform to normalized Evidence shape
            const evidence = (data.results || []).map((r: any) => ({
                title: r.title,
                url: r.url,
                snippet: r.content,
                publishedDate: r.published_date
            }));

            return {
                query,
                provider: 'tavily',
                sourcesFound: evidence.length > 0,
                evidence,
                summary: data.answer || undefined
            };

        } catch (error: any) {
            console.error('Tavily Search Exception:', error);
            return {
                query,
                provider: 'tavily',
                sourcesFound: false,
                evidence: []
            };
        }
    }
}
