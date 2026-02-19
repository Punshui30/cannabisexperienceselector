/**
 * AI CONFIGURATION - BEAST MODE
 *
 * Centralized governance for application mode, model routing, and feature gates.
 */

export type AppMode = 'consumer' | 'merchant';
export type FeatureGateCode = 'FEATURE_DISABLED' | 'MERCHANT_MODE';

/**
 * Typed error thrown by providers when a feature gate blocks access.
 * Never use raw Error('403 ...') strings — use this instead.
 */
export class FeatureGateError extends Error {
    readonly code: FeatureGateCode;
    readonly feature: string;
    constructor(code: FeatureGateCode, feature: string) {
        const msg = code === 'MERCHANT_MODE'
            ? `'${feature}' is disabled in Merchant Mode.`
            : `'${feature}' feature is not enabled.`;
        super(msg);
        this.name = 'FeatureGateError';
        this.code = code;
        this.feature = feature;
    }
}

export interface AIConfig {
    appMode: AppMode;
    features: {
        vision: boolean;
        evidence: boolean;
        memory: boolean;
        tts: boolean;
        uiSfx: boolean;
        tavilyDebug: boolean;
        tavilyRawDump: boolean;
        hasPerplexityKey: boolean;
        demoMode: boolean;
    };
    models: {
        reasoning: string;
        writing: string;
        vision: string;
        tts: string;
        fallback: string;
    };
    tts: {
        voice: string;           // default: 'marin'
        fallbackVoice: string;   // default: 'alloy'
        format: 'mp3' | 'opus' | 'aac' | 'flac';
        speed: number;           // 0.25–4.0
        maxChars: number;        // hard char cap (server also enforces)
    };
    limits: {
        maxImageBytes: number;
        maxTokensVision: number;
        maxTokensEvidence: number;
        maxEvidenceRefreshPerSession: number;
        maxEnrichPerSession: number;
        maxRefreshPerSession: number;
    };
    idleHelper: {
        delayMs: number;
    };
}

// -----------------------------------------------------------------------------
// DEFAULTS & ENVIRONMENT MAPPING
// -----------------------------------------------------------------------------

export const AI_CONFIG: AIConfig = {
    appMode: (import.meta.env.VITE_APP_MODE as AppMode) || 'consumer',

    features: {
        vision: import.meta.env.VITE_VISION_ENABLED === 'true' ||
            import.meta.env.VITE_ENABLE_VISION === 'true' ||
            import.meta.env.NEXT_PUBLIC_ENABLE_VISION === 'true',
        evidence: import.meta.env.VITE_EVIDENCE_ENABLED !== 'false',
        tts: import.meta.env.VITE_ENABLE_TTS !== 'false',
        uiSfx: import.meta.env.VITE_ENABLE_UI_SFX !== 'false',
        tavilyDebug: import.meta.env.VITE_ENABLE_TAVILY_DEBUG === 'true',
        tavilyRawDump: import.meta.env.VITE_ENABLE_TAVILY_RAW_DUMP === 'true',
        hasPerplexityKey: import.meta.env.VITE_HAS_PERPLEXITY_KEY !== 'false', // default to true unless explicitly false
        demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
        memory: true,
    },

    models: {
        reasoning: import.meta.env.VITE_REASONING_MODEL || 'o3-mini',
        writing: import.meta.env.VITE_WRITING_MODEL || 'gpt-4o',
        vision: import.meta.env.VITE_VISION_MODEL || 'gpt-4o',
        tts: import.meta.env.VITE_TTS_MODEL || 'gpt-4o-mini-tts',
        fallback: import.meta.env.VITE_FALLBACK_MODEL || 'gpt-4-turbo',
    },

    tts: {
        voice: import.meta.env.VITE_TTS_VOICE || 'marin',
        fallbackVoice: 'alloy',
        format: (import.meta.env.VITE_TTS_FORMAT || 'mp3') as 'mp3',
        speed: parseFloat(import.meta.env.VITE_TTS_SPEED || '1.0'),
        maxChars: parseInt(import.meta.env.VITE_TTS_MAX_CHARS || '900', 10),
    },

    limits: {
        maxImageBytes: 4 * 1024 * 1024,
        maxTokensVision: 1000,
        maxTokensEvidence: 2000,
        maxEvidenceRefreshPerSession: 5,
        maxEnrichPerSession: 10,
        maxRefreshPerSession: 5,
    },
    idleHelper: {
        delayMs: parseInt(import.meta.env.VITE_IDLE_HELPER_DELAY_MS || '15000', 10),
    },
};

/**
 * FEATURE GATING HELPER
 * Throws a typed FeatureGateError if a feature is inaccessible.
 * Never throws raw Error strings — callers catch FeatureGateError specifically.
 */
export function assertFeatureAccess(feature: keyof AIConfig['features'], context: string): void {
    const merchantBlocked: Array<keyof AIConfig['features']> = ['vision', 'evidence', 'tts'];
    if (AI_CONFIG.appMode === 'merchant' && merchantBlocked.includes(feature)) {
        throw new FeatureGateError('MERCHANT_MODE', feature);
    }
    if (!AI_CONFIG.features[feature]) {
        throw new FeatureGateError('FEATURE_DISABLED', feature);
    }
    console.debug(`[GATE_PASSED] ${feature} → ${context}`);
}

export function isConsumerMode(): boolean {
    return AI_CONFIG.appMode === 'consumer';
}

export function isMerchantMode(): boolean {
    return AI_CONFIG.appMode === 'merchant';
}

// -----------------------------------------------------------------------------
// STARTUP VERIFICATION LOGS
// -----------------------------------------------------------------------------
if (AI_CONFIG.features.tavilyDebug) {
    const buildVersion = import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || 'dev-local';
    console.log(`[TAVILY_DEBUG] client_debug_enabled=true build=${buildVersion}`);
}
