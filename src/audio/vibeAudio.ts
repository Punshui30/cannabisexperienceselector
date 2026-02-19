/**
 * VIBE AUDIO — v1 (Procedural Soundscapes)
 * Generated from terpene + effect vectors using Web Audio API.
 * NO external assets or APIs.
 */

export interface VibeParams {
    terpenes: { name: string; pct?: number }[];
    effects: { energy: number; body: number; mood: number; anxiety: number };
    seed?: string;
}

export interface VibeController {
    start: () => Promise<void>;
    stop: () => void;
    setMix: (params: VibeParams) => void;
}

// ── Scales & Frequencies ──────────────────────────────────────────────────────

const ROOT_FREQS: Record<string, number> = {
    'C': 130.81, // C3
    'D': 146.83, // D3
    'E': 164.81, // E3
    'G': 196.00, // G3
    'A': 220.00, // A3
};

const SCALES = ['C', 'D', 'E', 'G', 'A'];

function getSeedFrequency(seed?: string): number {
    if (!seed) return ROOT_FREQS['C'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % SCALES.length;
    return ROOT_FREQS[SCALES[index]];
}

// ── Audio Implementation ──────────────────────────────────────────────────────

export function createVibeSoundscape(initialParams: VibeParams): VibeController {
    let ctx: AudioContext | null = null;
    let masterGain: GainNode | null = null;

    // Layer A: Pad
    let padOsc1: OscillatorNode | null = null;
    let padOsc2: OscillatorNode | null = null;
    let padFilter: BiquadFilterNode | null = null;
    let padGain: GainNode | null = null;

    // Layer B: Shimmer
    let shimmerNoise: AudioBufferSourceNode | null = null;
    let shimmerFilter: BiquadFilterNode | null = null;
    let shimmerGain: GainNode | null = null;

    // Layer C: Pulse
    let pulseOsc: OscillatorNode | null = null;
    let pulseGain: GainNode | null = null;
    let pulseLFO: OscillatorNode | null = null;
    let pulseLFOGain: GainNode | null = null;

    let isPlaying = false;

    // ── Mapping Helper ────────────────────────────────────────────────────────

    function applyMappings(params: VibeParams) {
        if (!ctx || !masterGain) return;

        const t = params.terpenes.reduce((acc, curr) => {
            acc[curr.name.toLowerCase()] = curr.pct || 1; // weighting if pct is missing
            return acc;
        }, {} as Record<string, number>);

        const calmingWeight = (t.myrcene || 0) + (t.linalool || 0);
        const brightWeight = (t.limonene || 0) + (t.pinene || 0);
        const warmthWeight = (t.caryophyllene || 0) + (t.humulene || 0);
        const dreamyWeight = (t.terpinolene || 0);

        const { energy, body, mood, anxiety } = params.effects;
        const rootFreq = getSeedFrequency(params.seed);

        const now = ctx.currentTime;

        // Pad Mapping
        if (padFilter && padOsc1 && padOsc2 && padGain) {
            const baseCutoff = 400 + (warmthWeight * 200);
            const targetCutoff = baseCutoff + (brightWeight * 800) - (calmingWeight * 300) - (anxiety * 200);
            padFilter.frequency.exponentialRampToValueAtTime(Math.max(40, targetCutoff), now + 1.5);

            const pitchShift = (body * 20) - (calmingWeight * 10);
            padOsc1.frequency.exponentialRampToValueAtTime(rootFreq * 0.5 + pitchShift, now + 2);
            padOsc2.frequency.exponentialRampToValueAtTime(rootFreq * 0.51 + pitchShift, now + 2);

            const targetPadGain = 0.3 + (body * 0.1) - (anxiety * 0.1);
            padGain.gain.linearRampToValueAtTime(Math.max(0.1, targetPadGain), now + 1);
        }

        // Shimmer Mapping
        if (shimmerFilter && shimmerGain) {
            const shimmerFreq = 2000 + (brightWeight * 4000) + (dreamyWeight * 1000);
            shimmerFilter.frequency.exponentialRampToValueAtTime(shimmerFreq, now + 2);

            const targetShimmerGain = Math.min(0.08, (brightWeight * 0.05) + (dreamyWeight * 0.04));
            shimmerGain.gain.linearRampToValueAtTime(targetShimmerGain, now + 1);
        }

        // Pulse Mapping
        if (pulseLFOGain && pulseLFO && pulseGain) {
            const rate = 0.2 + (energy * 0.4); // 0.2Hz to 0.6Hz
            pulseLFO.frequency.linearRampToValueAtTime(rate, now + 2);

            const basePulseGain = (energy * 0.15);
            const targetPulseGain = basePulseGain * (1 - anxiety * 0.6);
            pulseGain.gain.linearRampToValueAtTime(Math.max(0, targetPulseGain), now + 1);
        }
    }

    // ── Setup Functions ───────────────────────────────────────────────────────

    function createNoiseBuffer(audioCtx: AudioContext) {
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    return {
        start: async () => {
            if (isPlaying) return;

            // @ts-ignore
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') await ctx.resume();

            masterGain = ctx.createGain();
            masterGain.gain.value = 0;
            masterGain.connect(ctx.destination);

            // Setup Pad
            padOsc1 = ctx.createOscillator();
            padOsc2 = ctx.createOscillator();
            padOsc1.type = 'sine';
            padOsc2.type = 'triangle';

            padFilter = ctx.createBiquadFilter();
            padFilter.type = 'lowpass';
            padFilter.Q.value = 2;

            padGain = ctx.createGain();

            padOsc1.connect(padFilter);
            padOsc2.connect(padFilter);
            padFilter.connect(padGain);
            padGain.connect(masterGain);

            padOsc1.start();
            padOsc2.start();

            // Setup Shimmer
            shimmerFilter = ctx.createBiquadFilter();
            shimmerFilter.type = 'bandpass';
            shimmerFilter.Q.value = 4;

            shimmerGain = ctx.createGain();

            shimmerNoise = ctx.createBufferSource();
            shimmerNoise.buffer = createNoiseBuffer(ctx);
            shimmerNoise.loop = true;

            shimmerNoise.connect(shimmerFilter);
            shimmerFilter.connect(shimmerGain);
            shimmerGain.connect(masterGain);
            shimmerNoise.start();

            // Setup Pulse
            pulseOsc = ctx.createOscillator();
            pulseOsc.type = 'sine';

            pulseGain = ctx.createGain();
            pulseLFO = ctx.createOscillator();
            pulseLFOGain = ctx.createGain();

            pulseLFOGain.gain.value = 0.5;
            pulseLFO.connect(pulseLFOGain.gain); // Modulate gain of pulse

            pulseOsc.connect(pulseGain);
            pulseGain.connect(masterGain);

            pulseOsc.start();
            pulseLFO.start();

            applyMappings(initialParams);

            masterGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 3);
            isPlaying = true;
        },

        stop: () => {
            if (!isPlaying || !ctx || !masterGain) return;
            const now = ctx.currentTime;
            masterGain.gain.linearRampToValueAtTime(0, now + 2);
            setTimeout(() => {
                if (ctx) {
                    ctx.close();
                    ctx = null;
                }
                isPlaying = false;
            }, 2100);
        },

        setMix: (params: VibeParams) => {
            applyMappings(params);
        }
    };
}
