/**
 * LIBRARY MEMORY STORE
 * 
 * Persistent cache for:
 * 1. Evidence Cards (keyed by claimKey)
 * 2. Strain Enrichment (keyed by strainId)
 * 3. Vision API Hashes (keyed by image SHA-256)
 */

const STORAGE_KEY = 'cas_library_knowledge_cache';

export interface EvidenceCard {
    id: string;
    claimKey: string;
    title: string;
    summaryBullets: string[];
    citations: Array<{ title: string; url: string }>;
    confidence: 'Strong' | 'Mixed' | 'Limited';
    retrievedAt: string;
    sourceDomains: string[];
}

export interface LibraryMemory {
    evidence: Record<string, EvidenceCard>;
    enrichment: Record<string, any>;
    visionCache: Record<string, any>;
}

const DEFAULT_LIBRARY: LibraryMemory = {
    evidence: {},
    enrichment: {},
    visionCache: {}
};

export const LibraryMemoryStore = {
    get(): LibraryMemory {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : DEFAULT_LIBRARY;
        } catch {
            return DEFAULT_LIBRARY;
        }
    },

    save(memory: LibraryMemory) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    },

    getCachedEvidence(claimKey: string): EvidenceCard | null {
        const lib = this.get();
        const hit = lib.evidence[claimKey] || null;
        if (hit) {
            console.log(`[EVIDENCE_CACHE_HIT] { claimKey: "${claimKey}" }`);
        }
        return hit;
    },

    cacheEvidence(evidence: EvidenceCard) {
        const lib = this.get();
        lib.evidence[evidence.claimKey] = evidence;
        this.save(lib);
    },

    getCachedVision(hash: string): any | null {
        const lib = this.get();
        return lib.visionCache[hash] || null;
    },

    cacheVision(hash: string, result: any) {
        const lib = this.get();
        lib.visionCache[hash] = result;
        this.save(lib);
    },

    getCachedEnrichment(strainId: string): any | null {
        const lib = this.get();
        const hit = lib.enrichment[strainId] || null;
        if (hit) {
            console.log(`[EVIDENCE_CACHE_HIT] { strainId: "${strainId}" }`);
        }
        return hit;
    },

    cacheEnrichment(strainId: string, enrichment: any) {
        const lib = this.get();
        lib.enrichment[strainId] = enrichment;
        this.save(lib);
    }
};

/**
 * SHA-256 UTILITY
 * used for image hashing to avoid redundant Vision API calls.
 */
export async function getSHA256(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
