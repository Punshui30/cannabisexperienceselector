/**
 * MERCHANT INTELLIGENCE LAYER (Supabase Backed)
 * 
 * Captures and effectively manages blend resolution events to derive meaningful business insights.
 * Strict privacy: No user PII. Merchant-scoped analytics only.
 */

import { DEMO_STORE_ID } from './supabase/demoStore';

export interface BlendResolutionEvent {
    id: string; // Unique event ID
    store_id: string;
    timestamp: number;

    // Context
    inputMode: 'preset' | 'freeform' | 'assisted';
    inputText?: string;

    // Outcome
    blendId: string;
    blendName: string;
    confidenceScore: number;

    // Components
    components: { name: string, ratio: number }[];

    // Abstracted Outcome Vector
    outcomeCategory: 'Focus' | 'Relax' | 'Social' | 'Sleep' | 'Relief' | 'Other';

    // LLM-Generated Insight
    commentary: string;

    broadcasted?: boolean;
}

class MerchantIntelligenceService {
    private events: BlendResolutionEvent[] = [];
    private listeners: (() => void)[] = [];

    constructor() {
        this.load();
    }

    private async load() {
        if (typeof window === 'undefined') return;
        try {
            const res = await fetch('/api/events');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Map Supabase 'payload' back to BlendResolutionEvent shape
            this.events = data.map((row: any) => ({
                id: row.id,
                store_id: row.store_id,
                timestamp: new Date(row.created_at).getTime(),
                ...row.payload
            }));

            this.notifyListeners();
        } catch (e) {
            console.error('[Merchant Intelligence] Failed to load remote events', e);
        }
    }

    /**
     * Core Emitter: Call this from Engine when a blend is resolved.
     */
    public async logResolution(event: Omit<BlendResolutionEvent, 'id' | 'timestamp' | 'store_id' | 'broadcasted'>) {
        // Optimistic UI update
        const optimisticEvent: BlendResolutionEvent = {
            ...event,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            store_id: DEMO_STORE_ID,
            broadcasted: false
        };

        this.events.unshift(optimisticEvent); // Put latest at top
        this.notifyListeners();
        console.log('[Merchant Intelligence] Event Logged (Optimistic)', optimisticEvent);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Resolution: ${event.blendName}`,
                    kind: 'blend',
                    payload: event // Store the entire object in JSONB
                })
            });

            if (!res.ok) throw new Error(`Failed to save event: ${res.statusText}`);
            console.log('[Merchant Intelligence] Event Persisted Successfully');
        } catch (err) {
            console.error('[Merchant Intelligence] Error persisting event', err);
        }
    }

    public subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    /**
     * ANALYTICS: "What's Working"
     */
    public getTopBlends(limit = 5) {
        const counts: Record<string, number> = {};
        this.events.forEach(e => {
            counts[e.blendName] = (counts[e.blendName] || 0) + 1;
        });

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));
    }

    public getTopOutcomes() {
        const counts: Record<string, number> = {};
        this.events.forEach(e => {
            counts[e.outcomeCategory] = (counts[e.outcomeCategory] || 0) + 1;
        });
        return Object.entries(counts).sort(([, a], [, b]) => b - a);
    }

    public getAverageConfidence() {
        if (this.events.length === 0) return 0;
        const total = this.events.reduce((sum, e) => sum + e.confidenceScore, 0);
        return (total / this.events.length) * 100;
    }

    public getRecentActivity() {
        return [...this.events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    }

    public getDailyVolume() {
        const days: Record<string, number> = {};
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            days[d.toLocaleDateString()] = 0;
        }

        this.events.forEach(e => {
            const d = new Date(e.timestamp).toLocaleDateString();
            if (days[d] !== undefined) days[d]++;
        });

        return Object.entries(days).map(([date, count]) => ({ date, count }));
    }
}

export const Intelligence = new MerchantIntelligenceService();
