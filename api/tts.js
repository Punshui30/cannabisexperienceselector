const { OpenAI } = require('openai');

// ─── Rate Limiting (in-memory, per session cookie / IP) ───────────────────────
const rateLimitMap = new Map(); // key → { count, windowStart }
const RATE_LIMIT_MAX = 10;   // max calls per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MIN_CALL_GAP_MS = 2000; // hard minimum gap between calls for same key
const lastCallMap = new Map(); // key → timestamp

function getRateLimitKey(request) {
    // Use session cookie if available, else fall back to IP
    const cookie = request.headers?.cookie?.match(/session_id=([^;]+)/)?.[1];
    return cookie || request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(key) {
    const now = Date.now();

    // Hard gap check
    const last = lastCallMap.get(key) || 0;
    if (now - last < MIN_CALL_GAP_MS) {
        return { allowed: false, reason: 'Too many requests. Please wait a moment.' };
    }
    lastCallMap.set(key, now);

    // Window count check
    const entry = rateLimitMap.get(key) || { count: 0, windowStart: now };
    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
        entry.count = 0;
        entry.windowStart = now;
    }
    entry.count++;
    rateLimitMap.set(key, entry);

    if (entry.count > RATE_LIMIT_MAX) {
        return { allowed: false, reason: 'Rate limit exceeded. Try again in a minute.' };
    }
    return { allowed: true };
}

// ─── Text Sanitisation ────────────────────────────────────────────────────────
const TTS_MAX_CHARS = parseInt(process.env.TTS_MAX_CHARS || '900', 10);
const TTS_MODEL = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
const TTS_VOICE = process.env.TTS_VOICE || 'marin';
const TTS_FALLBACK = 'alloy';
const TTS_SPEED = parseFloat(process.env.TTS_SPEED || '1.0');
const TTS_FORMAT = process.env.TTS_FORMAT || 'mp3';

function sanitiseText(raw) {
    return raw
        .replace(/```[\s\S]*?```/g, '')       // strip code blocks
        .replace(/`[^`]+`/g, '')               // strip inline code
        .replace(/#{1,6}\s/g, '')              // strip markdown headings
        .replace(/[*_~>]+/g, '')               // strip markdown formatting
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links, keep text
        .replace(/[\u{1F300}-\u{1FFFF}]/gu, '') // strip emoji
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, TTS_MAX_CHARS);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') { response.status(200).end(); return; }
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // ── Hard Gate: Merchant Mode ───────────────────────────────────────────
    if (process.env.APP_MODE === 'merchant') {
        return response.status(403).json({ error: 'TTS is disabled in Merchant Mode.', code: 'MERCHANT_MODE' });
    }

    // ── Feature Gate ──────────────────────────────────────────────────────
    if (process.env.ENABLE_TTS === 'false') {
        return response.status(403).json({ error: 'TTS feature is not enabled.', code: 'FEATURE_DISABLED' });
    }

    // ── Rate Limit ────────────────────────────────────────────────────────
    const rlKey = getRateLimitKey(request);
    const rl = checkRateLimit(rlKey);
    if (!rl.allowed) {
        return response.status(429).json({ error: rl.reason, code: 'RATE_LIMITED' });
    }

    // ── Input Validation ──────────────────────────────────────────────────
    const { text, voice, speed } = request.body || {};

    if (!text || typeof text !== 'string' || text.trim().length < 3) {
        return response.status(400).json({ error: 'Text is required and must be at least 3 characters.', code: 'INVALID_INPUT' });
    }

    const API_KEY = process.env.OPENAI_API_KEY;
    if (!API_KEY) {
        console.error('[TTS] Missing OPENAI_API_KEY');
        return response.status(500).json({ error: 'Server configuration error.', code: 'SERVER_ERROR' });
    }

    const cleanText = sanitiseText(text);
    const chosenVoice = (voice && typeof voice === 'string') ? voice : TTS_VOICE;
    const chosenSpeed = (speed && !isNaN(parseFloat(speed))) ? parseFloat(speed) : TTS_SPEED;

    // ── OpenAI TTS Call (with voice fallback) ─────────────────────────────
    const openai = new OpenAI({ apiKey: API_KEY });

    async function callTTS(voiceId) {
        return openai.audio.speech.create({
            model: TTS_MODEL,
            voice: voiceId,
            input: cleanText,
            response_format: TTS_FORMAT,
            speed: chosenSpeed,
        });
    }

    try {
        let mp3Response;

        try {
            mp3Response = await callTTS(chosenVoice);
        } catch (primaryErr) {
            // Voice/model compatibility issue → fall back to alloy
            const isVoiceError = primaryErr?.message?.toLowerCase().includes('voice') ||
                primaryErr?.status === 400;
            if (isVoiceError && chosenVoice !== TTS_FALLBACK) {
                console.warn(`[TTS] Voice '${chosenVoice}' unsupported — falling back to '${TTS_FALLBACK}'. Error: ${primaryErr.message}`);
                mp3Response = await callTTS(TTS_FALLBACK);
            } else {
                throw primaryErr;
            }
        }

        // Stream the binary audio bytes to the client
        const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());

        response.setHeader('Content-Type', `audio/${TTS_FORMAT}`);
        response.setHeader('Content-Length', audioBuffer.length);
        response.setHeader('Cache-Control', 'private, max-age=3600'); // allow browser/CDN caching
        return response.status(200).send(audioBuffer);

    } catch (error) {
        console.error('[TTS] OpenAI error:', error?.message || error);
        const status = error?.status || 500;
        const message = error?.message || 'Text-to-speech generation failed.';
        return response.status(status).json({ error: message, code: 'TTS_ERROR' });
    }
};
