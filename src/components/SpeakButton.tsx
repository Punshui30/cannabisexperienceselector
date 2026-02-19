import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { TTSProvider, TTSOptions } from '../ai/providers/ttsProvider';
import { FeatureGateError, AI_CONFIG, isMerchantMode } from '../ai/config';

// ─── Optional UI SFX (tap sound) ─────────────────────────────────────────────
// Gated by VITE_ENABLE_UI_SFX=true. Missing asset never causes an error.
let tapAudio: HTMLAudioElement | null = null;
if (typeof window !== 'undefined' && AI_CONFIG.features.uiSfx) {
    try {
        tapAudio = new Audio('/sounds/tap.mp3'); // must exist in /public/sounds/
        tapAudio.volume = 0.08;
    } catch { /* non-blocking */ }
}

function playTapSfx() {
    if (!tapAudio) return;
    tapAudio.currentTime = 0;
    tapAudio.play().catch(() => {/* blocked by browser autoplay policy — ignore */ });
}

// ─── Animated Waveform ────────────────────────────────────────────────────────
function Waveform() {
    const bars = [0.4, 0.8, 1.0, 0.7, 0.5];
    const MotionSpan = motion.span as any;
    return (
        <span className="flex items-center gap-[2px] h-3">
            {bars.map((h, i) => (
                <MotionSpan
                    key={i}
                    className="w-[2px] rounded-full bg-current"
                    animate={{ scaleY: [h, 1, h * 0.6, 1, h] }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.12,
                        ease: 'easeInOut',
                    }}
                    style={{ height: '12px', transformOrigin: 'center' }}
                />
            ))}
        </span>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export type SpeakState = 'idle' | 'loading' | 'playing' | 'error';

export interface SpeakButtonProps {
    /** Text to speak. Pass the full text; the provider handles trimming/summary internally. */
    text: string;
    /** If true, trims text to a 1–3 sentence summary before synthesising (recommended for blends). */
    summaryMode?: boolean;
    /** Optional voice override. Defaults to config TTS_VOICE. */
    voice?: string;
    /** Additional container className. Keep this minimal — button must never shift layout. */
    className?: string;
    /** Called when a FeatureGateError is caught, so parent can optionally surface a tooltip. */
    onGated?: (code: string) => void;
}

/**
 * SpeakButton
 *
 * A layout-safe, self-contained TTS trigger. Never shifts surrounding layout.
 * The button occupies a fixed inline space (w-7 h-7) at all times.
 *
 * Gates:
 * - Hidden entirely in Merchant mode.
 * - Hidden if ENABLE_TTS is false.
 */
export function SpeakButton({ text, summaryMode = true, voice, className = '', onGated }: SpeakButtonProps) {
    const [state, setState] = useState<SpeakState>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const abortRef = useRef(false);

    // Hard gate: completely unmount in Merchant mode or when TTS is off
    if (isMerchantMode() || !AI_CONFIG.features.tts) return null;

    const stop = useCallback(() => {
        abortRef.current = true;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setState('idle');
    }, []);

    // Stop when unmounted
    useEffect(() => () => { stop(); }, [stop]);

    const handleClick = useCallback(async () => {
        if (state === 'playing' || state === 'loading') {
            stop();
            return;
        }

        playTapSfx();
        setState('loading');
        abortRef.current = false;

        try {
            const opts: TTSOptions = { summaryMode, ...(voice ? { voice } : {}) };
            const result = await TTSProvider.speak(text, opts);

            if (abortRef.current) {
                // User pressed stop while we were loading
                result.audio.pause();
                return;
            }

            audioRef.current = result.audio;
            setState('playing');

            result.audio.play();
            result.audio.onended = () => { audioRef.current = null; setState('idle'); };
            result.audio.onerror = () => { audioRef.current = null; setState('error'); };

        } catch (err: unknown) {
            if (err instanceof FeatureGateError) {
                onGated?.(err.code);
                setState('idle');
            } else {
                console.warn('[SpeakButton] TTS error:', err);
                setState('error');
                setTimeout(() => setState('idle'), 2500); // auto-recover
            }
        }
    }, [state, text, summaryMode, voice, stop, onGated]);

    // ── Render ────────────────────────────────────────────────────────────
    const label = state === 'playing'
        ? 'Stop speaking'
        : state === 'loading'
            ? 'Generating speech…'
            : 'Read aloud';

    const MotionButton = motion.button as any;
    const MotionSpan = motion.span as any;

    return (
        <MotionButton
            aria-label={label}
            title={label}
            onClick={handleClick}
            whileHover={{ scale: state === 'idle' ? 1.1 : 1 }}
            whileTap={{ scale: 0.92 }}
            className={[
                // Fixed size so surrounding layout is never affected
                'relative inline-flex items-center justify-center',
                'w-7 h-7 rounded-full shrink-0',
                'border transition-all duration-200',
                state === 'playing'
                    ? 'bg-[#BF5AF2]/20 border-[#BF5AF2]/40 text-[#BF5AF2]'
                    : state === 'loading'
                        ? 'bg-white/5 border-white/10 text-white/40'
                        : state === 'error'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70',
                className,
            ].join(' ')}
        >
            <AnimatePresence mode="wait">
                {state === 'loading' && (
                    <MotionSpan key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Loader2 size={12} className="animate-spin" />
                    </MotionSpan>
                )}
                {state === 'playing' && (
                    <MotionSpan key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Waveform />
                    </MotionSpan>
                )}
                {state === 'error' && (
                    <MotionSpan key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <VolumeX size={12} />
                    </MotionSpan>
                )}
                {state === 'idle' && (
                    <MotionSpan key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Volume2 size={12} />
                    </MotionSpan>
                )}
            </AnimatePresence>
        </MotionButton>
    );
}
