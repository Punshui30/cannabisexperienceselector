/**
 * STRAIN SUMMARY PROVIDER
 *
 * Replaces the old claimKey/evidence-card pattern for the Strain Library.
 * Fetches a clean, human-friendly summary from Perplexity (via /api/evidence)
 * and stores it under a new `strainSummary` namespace in libraryMemory.
 *
 * Data shape: StrainSummary
 * Cache key: `summary_${strainId}` in libraryMemory.enrichment
 */

import { LibraryMemoryStore } from '../../lib/memory/libraryMemory';
import { AI_CONFIG, assertFeatureAccess } from '../config';

export interface StrainSummarySource {
    title: string;
    url: string;
    domain?: string;
}

export interface StrainSummary {
    strainId: string;
    strainName: string;
    generatedAt: string;
    typicalEffects: string[];   // 3 bullet points
    bestFor: string[];          // 2 bullet points
    watchOuts: string[];        // 2 bullet points
    consistency: {
        level: 'high' | 'medium' | 'low';
        note: string;
    };
    sources: StrainSummarySource[];
}

const CACHE_NAMESPACE = 'summary_'; // prefix in enrichment map

export const StrainSummaryProvider = {
    getCached(strainId: string): StrainSummary | null {
        const raw = LibraryMemoryStore.getCachedEnrichment(CACHE_NAMESPACE + strainId);
        if (!raw || !raw.typicalEffects) return null;
        return raw as StrainSummary;
    },

    async fetchSummary(strainId: string, strainName: string): Promise<StrainSummary> {
        assertFeatureAccess('evidence', `StrainSummaryProvider.fetchSummary(${strainName})`);

        const prompt = [
            `Give a plain-language summary of the cannabis cultivar "${strainName}".`,
            `Return ONLY valid JSON matching this schema, no markdown, no prose:`,
            `{`,
            `  "typicalEffects": ["<effect 1>", "<effect 2>", "<effect 3>"],`,
            `  "bestFor": ["<use 1>", "<use 2>"],`,
            `  "watchOuts": ["<caution 1>", "<caution 2>"],`,
            `  "consistency": { "level": "high|medium|low", "note": "<one sentence>" },`,
            `  "sources": [{ "title": "<title>", "url": "<url>", "domain": "<domain>" }]`,
            `}`,
            `Keep all strings under 80 characters. No medical claims. 2–5 sources.`
        ].join('\n');

        const res = await fetch('/api/evidence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: prompt,
                claimKey: `__strain_summary_${strainId}`
            })
        });

        if (!res.ok) throw new Error(`StrainSummary fetch failed: ${res.status}`);

        const data = await res.json();

        // The evidence endpoint returns { summaryBullets, citations, ... }
        // but we sent a structured JSON prompt so try to parse the first bullet
        // as the full JSON blob (some Perplexity responses put it there).
        let parsed: Partial<StrainSummary> = {};

        // Try to extract JSON from raw response text
        const rawText: string = data.rawText || data.summaryBullets?.join('\n') || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch { /* ignore */ }
        }

        // Fallback: build from whatever we got
        const summary: StrainSummary = {
            strainId,
            strainName,
            generatedAt: new Date().toISOString(),
            typicalEffects: parsed.typicalEffects?.slice(0, 3) || [
                'Effects vary by batch and individual tolerance.',
                'May produce relaxation or mild euphoria.',
                'Onset typically 5–15 min when inhaled.'
            ],
            bestFor: parsed.bestFor?.slice(0, 2) || ['Evening use', 'Unwinding after activity'],
            watchOuts: parsed.watchOuts?.slice(0, 2) || [
                'Start low if sensitive to THC.',
                'Effects can vary by batch.'
            ],
            consistency: parsed.consistency || { level: 'medium', note: 'Batch variation is common across growers.' },
            sources: (parsed.sources || (data.citations || []).slice(0, 5).map((c: any) => ({
                title: c.title || 'Source',
                url: c.url || '#',
                domain: c.sourceDomain || new URL(c.url || 'https://unknown').hostname
            }))).slice(0, 5)
        };

        // Cache under namespaced key
        LibraryMemoryStore.cacheEnrichment(CACHE_NAMESPACE + strainId, summary);
        return summary;
    },

    async refreshSummary(strainId: string, strainName: string): Promise<StrainSummary> {
        return this.fetchSummary(strainId, strainName);
    }
};
