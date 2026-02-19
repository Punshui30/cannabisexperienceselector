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
    refreshEnrichmentForStrain(strainId: string): Promise<void>;
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
    },

    async refreshEnrichmentForStrain(strainId: string): Promise<void> {
        // Guard check
        assertFeatureAccess('evidence', `Enrich strain ${strainId}`);

        // Get strain data
        const { INVENTORY } = await import('../../lib/inventory');
        const cultivar = INVENTORY.cultivars.find(c => c.id === strainId);
        if (!cultivar) throw new Error('Strain not found in inventory');

        const topTerpenes = Object.entries(cultivar.terpenes || {})
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([name]) => name.toLowerCase());

        const claimKeys = topTerpenes.map(t => mapTerpeneToClaimKey(t));

        console.log(`[EVIDENCE_CALL] { strainId: "${strainId}", claimKeys: ${JSON.stringify(claimKeys)}, reason: "enrich" }`);

        // Fetch each evidence sequentially (or parallel if desired, but seq is safer for rate limits)
        for (const key of claimKeys) {
            await this.refreshEvidence(key, `${cultivar.name} ${key.split('_')[1] || 'profile'}`);
        }

        // Store enrichment metadata
        LibraryMemoryStore.cacheEnrichment(strainId, {
            enrichedAt: new Date().toISOString(),
            claimKeys
        });
    }
};

/**
 * HELPER: Map terpene names to canonical claim keys
 */
function mapTerpeneToClaimKey(terpene: string): string {
    const map: Record<string, string> = {
        limonene: 'TERPENE_LIMONENE_ALERTNESS_ANXIETY_RISK',
        linalool: 'TERPENE_LINALOOL_CALMING',
        myrcene: 'MYRCENE_SEDATION',
        caryophyllene: 'TERPENE_CARYOPHYLLENE_INFLAMMATION',
        pinene: 'TERPENE_PINENE_FOCUS',
        humulene: 'TERPENE_HUMULENE_APPETITE',
        terpinolene: 'TERPENE_TERPINOLENE_UPLIFTING',
        ocimene: 'TERPENE_OCIMENE_ANTIVIRAL'
    };
    return map[terpene] || `TERPENE_${terpene.toUpperCase()}_EFFECTS`;
}
