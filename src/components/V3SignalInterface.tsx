import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnginePhase } from '../types/domain';

interface V3SignalInterfaceProps {
    phase: EnginePhase;
    onComplete: () => void;
    inputText?: string;
}

const HEADLINE = "We can't tune a single strain. We can tune the blend.";

const SUBTEXT = "Your outcome comes from proportions.\nA single strain is one fixed profile.\nA blend gives us knobs: add, dilute, and balance until it matches your goal.";

const MECHANISM_LINES = [
    "Single strain = fixed ratio. Blend = adjustable ratio.",
    "We lock the anchor effect, then tune everything else around it.",
    "Too edgy? We dilute stimulation and add a calming anchor.",
    "More clarity without more anxiety: split the job across cultivars.",
    "We're matching a target profile, not chasing a strain name.",
    "Each cultivar does one job well. The blend does the whole job.",
    "Weighted mix → controllable direction. One strain → one preset.",
    "We can add what's missing and reduce what's too strong.",
    "Outcome recipes stay consistent even when inventory changes.",
    "This is why blends are repeatable: proportions are tunable.",
    "We tune mood, clarity, body feel, and time-context—together.",
    "A strain can't be \"turned down.\" A blend can.",
    "The goal is balance: uplift + calm + clarity in one formula.",
    "We optimize candidates, then balance ratios for your result.",
    "Blends give knobs. Strains give presets.",
    "One profile can't fit everyone. A blend can be tuned to you.",
];

const ROTATE_MS = 3000;
const CROSSFADE_MS = 0.2;

export function V3SignalInterface({ phase, onComplete }: V3SignalInterfaceProps) {
    const [tipIndex, setTipIndex] = useState(0);
    const mountedRef = React.useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const interval = setInterval(() => {
            if (mountedRef.current) {
                setTipIndex((prev) => (prev + 1) % MECHANISM_LINES.length);
            }
        }, ROTATE_MS);
        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden bg-[#050505]">
            {/* Subtle radial gradient for depth */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(circle at center, #00FFD110 0%, transparent 70%)'
                }}
            />

            <div className="relative z-10 flex flex-col items-center px-6 sm:px-12 text-center max-w-2xl w-full">

                {/* Minimal Processing UI: 3-dot pulse */}
                <div className="flex gap-2 mb-6 sm:mb-8">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                            className="w-2 h-2 rounded-full bg-[#00FFD1] shadow-[0_0_10px_rgba(0,255,209,0.3)]"
                        />
                    ))}
                </div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-xl sm:text-2xl font-light leading-snug text-white serif mb-4 max-w-lg"
                >
                    {HEADLINE}
                </motion.h2>

                {/* Subtext: 2–3 lines */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.75 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-sm sm:text-base text-white/60 leading-relaxed mb-8 max-w-md whitespace-pre-line"
                >
                    {SUBTEXT}
                </motion.p>

                {/* Rotating mechanism line (crossfade) */}
                <div className="relative h-20 sm:h-24 flex items-center justify-center min-h-[5rem] w-full px-2">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={tipIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: CROSSFADE_MS,
                                ease: "easeInOut"
                            }}
                            className="text-lg sm:text-2xl font-light leading-snug text-white/90 serif absolute left-0 right-0 text-center"
                        >
                            {MECHANISM_LINES[tipIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Background noise/grain for premium texture (optional but adds to "not just a loading screen") */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>
        </div>
    );
}