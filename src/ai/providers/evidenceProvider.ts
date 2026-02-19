import { AI_CONFIG, assertFeatureAccess } from '../config';
import { LibraryMemoryStore, EvidenceCard } from '../../lib/memory/libraryMemory';

/**
 * EVIDENCE PROVIDER
 * 
 * Fetches and caches clinical/scientific evidence for claims and strains.
 * Integration: Perplexity AI (Sonar)
 */

export interface EvidenceProvider {
    getEvidenceForClaim(claimKey: string, query: string): Promise<EvidenceCard>;
    refreshEvidence(claimKey: string, query: string): Promise<EvidenceCard>;
}

export const PerplexityEvidenceProvider: EvidenceProvider = {
    async getEvidenceForClaim(claimKey: string, query: string): Promise<EvidenceCard> {
        // 1. Guard check
        assertFeatureAccess('evidence', `Fetch evidence for ${claimKey}`);

        // 2. Check Cache
        const cached = LibraryMemoryStore.getCachedEvidence(claimKey);
        if (cached) {
            console.log(`[EVIDENCE] Cache HIT for ${claimKey}`);
            return cached;
        }

        // 3. Fetch Fresh
        return this.refreshEvidence(claimKey, query);
    },

    async refreshEvidence(claimKey: string, query: string): Promise<EvidenceCard> {
        console.log(`[EVIDENCE] Fetching fresh evidence for: ${query}`);

        try {
            const response = await fetch('/api/evidence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `Provide scientific grounding for the claim: "${query}". Focus on cannabis terpenes or cannabinoids and the entourage effect. Cite authoritative sources.`,
                    claimKey
                })
            });

            if (!response.ok) {
                throw new Error(`Evidence API failed: ${response.status}`);
            }

            const data = await response.json();

            // Map structured response to EvidenceCard
            const card: EvidenceCard = {
                id: `ev_${Date.now()}`,
                claimKey,
                title: data.title || `Research: ${claimKey}`,
                summaryBullets: data.summaryBullets || ["No summary available."],
                citations: data.citations || [],
                confidence: data.confidence || 'Mixed',
                retrievedAt: new Date().toISOString(),
                sourceDomains: data.sourceDomains || []
            };

            // Cache it
            LibraryMemoryStore.cacheEvidence(card);

            return card;

        } catch (error) {
            console.error(`[EVIDENCE] Error fetching evidence:`, error);
            throw error;
        }
    }
};
