import { LabelScan } from '../ai/providers/visionProvider';
import { STRAIN_LIBRARY, getCultivarIdFromName } from './strainLibrary';
import { INVENTORY } from './inventory';

export interface MatchResult {
    chemotypeId: string;
    chemotypeName: string;
    confidence: number;
    matchType: 'exact' | 'fuzzy_brand' | 'profile' | 'potency';
}

/**
 * Deterministic matching logic for Vision Scans.
 * Prioritizes name accuracy, then profile similarity.
 */
export function matchLabelToLibrary(scan: LabelScan): MatchResult[] {
    const results: MatchResult[] = [];
    const strainName = (scan.strainName || scan.productName || '').toLowerCase().trim();

    // 1. Exact Name Match
    const exactId = getCultivarIdFromName(strainName);
    if (exactId) {
        const strain = STRAIN_LIBRARY.find(s => s.id === exactId);
        if (strain) {
            results.push({ chemotypeId: exactId, chemotypeName: strain.name, confidence: 1.0, matchType: 'exact' });
            return results; // Found exact, done
        }
    }

    // 2. Fuzzy Name Match
    const fuzzyMatch = STRAIN_LIBRARY.find(s =>
        s.name.toLowerCase().includes(strainName) || strainName.includes(s.name.toLowerCase())
    );

    if (fuzzyMatch) {
        results.push({
            chemotypeId: fuzzyMatch.id,
            chemotypeName: fuzzyMatch.name,
            confidence: 0.85,
            matchType: 'fuzzy_brand'
        });
    }

    // 3. Profile Similarity (Terpenes) - Using INVENTORY
    if (results.length === 0 && scan.terpenes && scan.terpenes.length > 0) {
        const scanTerps = new Set(scan.terpenes.map(t => t.name.toLowerCase()));

        let bestProfileMatch: any | null = null;
        let maxOverlap = 0;

        INVENTORY.cultivars.forEach(c => {
            const libTerps = Object.keys(c.terpenes || {}).map(t => t.toLowerCase());
            const overlap = [...scanTerps].filter(t => libTerps.includes(t)).length;
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestProfileMatch = c;
            }
        });

        if (bestProfileMatch && maxOverlap > 1) {
            results.push({
                chemotypeId: bestProfileMatch.id,
                chemotypeName: bestProfileMatch.name,
                confidence: 0.75,
                matchType: 'profile'
            });
        }
    }

    // 4. Potency Match (Fallback) - Using INVENTORY
    if (results.length === 0 && scan.thcPct !== undefined) {
        let closestPotencyMatch: any | null = null;
        let minDiff = Infinity;

        INVENTORY.cultivars.forEach(c => {
            const diff = Math.abs((c.thcPercent || 0) - (scan.thcPct || 0));
            if (diff < minDiff) {
                minDiff = diff;
                closestPotencyMatch = c;
            }
        });

        if (closestPotencyMatch && minDiff < 5) {
            results.push({
                chemotypeId: closestPotencyMatch.id,
                chemotypeName: closestPotencyMatch.name,
                confidence: 0.6,
                matchType: 'potency'
            });
        }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
}
