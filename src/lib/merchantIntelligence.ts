/**
 * MERCHANT INTELLIGENCE LAYER
 * 
 * Captures and effectively manages blend resolution events to derive meaningful business insights.
 * Strict privacy: No user PII. Merchant-scoped analytics only.
 */

export interface BlendResolutionEvent {
    id: string; // Unique event ID
    merchantId: string; // "default-merchant" for demo
    timestamp: number;

    // Context
    inputMode: 'preset' | 'freeform' | 'assisted';
    inputText?: string; // Anonymized (just length/keywords in real app, keeping full for demo analytics)

    // Outcome
    blendId: string;
    blendName: string;
    confidenceScore: number;

    // Components
    components: { name: string, ratio: number }[]; // Structured data with ratios

    // Abstracted Outcome Vector (Simplified for V1)
    outcomeCategory: 'Focus' | 'Relax' | 'Social' | 'Sleep' | 'Relief' | 'Other';

    // LLM-Generated Insight (Mandatory for Live Feed)
    commentary: string;
}

const STORAGE_KEY = 'strainmath_merchant_intelligence_v1';

class MerchantIntelligenceService {
    private events: BlendResolutionEvent[] = [];

    constructor() {
        this.load();
    }

    private load() {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.events = Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            console.error('Failed to load merchant intelligence', e);
        }
    }

    private save() {
        if (typeof window === 'undefined') return;
        try {
            // Cap at last 1000 events for demo performance
            const toSave = this.events.slice(-1000);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to save merchant intelligence', e);
        }
    }

    private listeners: (() => void)[] = [];

    /**
     * Core Emitter: Call this from Engine when a blend is resolved.
     */
    public logResolution(event: Omit<BlendResolutionEvent, 'id' | 'timestamp' | 'merchantId'>) {
        const fullEvent: BlendResolutionEvent = {
            ...event,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            merchantId: 'demo-merchant-01'
        };

        this.events.push(fullEvent);
        this.save();
        this.notifyListeners();
        console.log('[Merchant Intelligence] Event Logged', fullEvent);
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

    /**
     * ANALYTICS: "Efficiency"
     */
    public getAverageConfidence() {
        if (this.events.length === 0) return 0;
        const total = this.events.reduce((sum, e) => sum + e.confidenceScore, 0);
        return (total / this.events.length) * 100;
    }

    /**
     * ANALYTICS: Activity Stream (Last 20)
     */
    public getRecentActivity() {
        return [...this.events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    }

    /**
     * ANALYTICS: Time Series (Last 7 Days)
     */
    public getDailyVolume() {
        const days: Record<string, number> = {};
        const now = new Date();

        // Init last 7 days
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
