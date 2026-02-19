/**
 * TTS PROVIDER — Client-side wrapper around /api/tts
 *
 * Features:
 *  - Feature gate via config (throws FeatureGateError, never crashes UI)
 *  - LRU cache keyed by hash(text + voice + speed) to prevent duplicate billing
 *  - "Speak summary" mode: clips text to a stable 1–3 sentence summary
 *  - Exposes simple play/stop API returning an HTMLAudioElement
 */

import { AI_CONFIG, assertFeatureAccess, FeatureGateError } from '../config';

// ─── LRU Cache ────────────────────────────────────────────────────────────────
const CACHE_MAX = 30; // max entries stored in memory
const audioCache = new Map<string, string>(); // hash → blob URL

function evictLRU() {
    if (audioCache.size >= CACHE_MAX) {
        const firstKey = audioCache.keys().next().value;
        const blobUrl = audioCache.get(firstKey!);
        if (blobUrl) URL.revokeObjectURL(blobUrl); // free memory
        audioCache.delete(firstKey!);
    }
}

// Simple djb2 hash (no crypto needed; not security-critical here)
function hashKey(text: string, voice: string, speed: number): string {
    let h = 5381;
    const s = `${text}|${voice}|${speed}`;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
        h = h >>> 0; // keep as uint32
    }
    return h.toString(36);
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

/**
 * Trims text to a crisp 1–3 sentence "speak summary" for cost predictability.
 * Used when callers pass `summaryMode: true`.
 */
function toSpeakSummary(text: string): string {
    const clean = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/[*_~>]+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Split on sentence boundaries, take up to 3
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    return sentences.slice(0, 3).join(' ').slice(0, AI_CONFIG.tts.maxChars);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface TTSOptions {
    voice?: string;
    speed?: number;
    summaryMode?: boolean; // if true, trims to 1–3 sentences before calling API
}

export interface TTSResult {
    audio: HTMLAudioElement;
    blobUrl: string;
    fromCache: boolean;
}

export const TTSProvider = {
    /**
     * Synthesise speech for `text`. Returns a ready-to-play HTMLAudioElement.
     * Throws FeatureGateError if TTS is gated; never throws unexpectedly.
     */
    async speak(rawText: string, opts: TTSOptions = {}): Promise<TTSResult> {
        // ── Gate check ────────────────────────────────────────────────────
        assertFeatureAccess('tts', 'TTSProvider.speak');

        const voice = opts.voice ?? AI_CONFIG.tts.voice;
        const speed = opts.speed ?? AI_CONFIG.tts.speed;
        const text = opts.summaryMode ? toSpeakSummary(rawText) : rawText.slice(0, AI_CONFIG.tts.maxChars);

        if (!text || text.trim().length < 3) {
            throw new FeatureGateError('FEATURE_DISABLED', 'tts'); // repurpose for empty input
        }

        // ── Cache hit ─────────────────────────────────────────────────────
        const key = hashKey(text, voice, speed);
        if (audioCache.has(key)) {
            const blobUrl = audioCache.get(key)!;
            const audio = new Audio(blobUrl);
            return { audio, blobUrl, fromCache: true };
        }

        // ── Fetch from server ─────────────────────────────────────────────
        const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice, speed }),
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            const code = payload?.code || 'TTS_ERROR';
            const msg = payload?.error || `TTS failed (${res.status})`;

            // Surface gate errors as typed FeatureGateError
            if (res.status === 403) {
                throw new FeatureGateError(
                    code === 'MERCHANT_MODE' ? 'MERCHANT_MODE' : 'FEATURE_DISABLED',
                    'tts'
                );
            }
            throw Object.assign(new Error(msg), { code });
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        evictLRU();
        audioCache.set(key, blobUrl);

        const audio = new Audio(blobUrl);
        return { audio, blobUrl, fromCache: false };
    },

    /** Pre-warm the cache for a given text without playing audio. */
    async prefetch(text: string, opts: TTSOptions = {}): Promise<void> {
        try { await TTSProvider.speak(text, { ...opts, summaryMode: true }); }
        catch { /* Prefetch failures are silently ignored */ }
    },

    /** Clear all cached audio and revoke blob URLs. */
    clearCache(): void {
        for (const url of audioCache.values()) URL.revokeObjectURL(url);
        audioCache.clear();
    },
};
