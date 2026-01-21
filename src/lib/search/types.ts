
export interface SearchResult {
    query: string;
    provider: "tavily" | "bing" | "serpapi";
    sourcesFound: boolean;
    evidence: Array<{
        title: string;
        url: string;
        snippet: string;
        publishedDate?: string;
    }>;
    summary?: string; // Automatically generated summary if provider supports it
}

export interface SearchProvider {
    search(query: string): Promise<SearchResult>;
}

export interface SearchPayload {
    query: string;
    includeRefinement?: boolean;
}
