import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnginePhase } from '../types/domain';

interface V3SignalInterfaceProps {
    phase: EnginePhase;
    onComplete: () => void;
    inputText?: string;
}

const HEADLINE = "Tune the blend. Not the strain.";

const EXPLAINER = "A single strain is fixed. A blend gives knobs: add, dilute, balance.";

const MICRO_LINES = [
    "Single strain = fixed ratio. Blend = adjustable ratio.",
    "Too edgy? Dilute stimulation + add a calming anchor.",
    "Lock the anchor effect. Tune everything else around it.",
    "Match a target profile — not a strain name.",
    "Each cultivar does one job well. The blend does the whole job.",
    "Blends give knobs. Strains give presets.",
    "Add what's missing. Reduce what's too strong.",
    "Outcome recipes stay consistent even when inventory changes.",
    "A strain can't be \"turned down.\" A blend can.",
    "Balance uplift + calm + clarity in one formula.",
];

const ROTATE_MS = 3200;
const CROSSFADE_MS = 0.22;

export function V3SignalInterface({ phase, onComplete }: V3SignalInterfaceProps) {
    const [tipIndex, setTipIndex] = useState(0);
    const mountedRef = React.useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const interval = setInterval(() => {
            if (mountedRef.current) {
                setTipIndex((prev) => (prev + 1) % MICRO_LINES.length);
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

            <div className="relative z-10 flex flex-col items-center px-6 sm:px-12 text-center w-full max-w-[min(640px,92vw)]">

                {/* Minimal Processing UI: 3-dot pulse */}
                <div className="flex gap-2 mb-8 sm:mb-10">
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

                {/* Headline — single line, premium */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="text-[22px] sm:text-[28px] md:text-[32px] font-light leading-tight text-white serif mb-5 sm:mb-6 max-w-[520px]"
                >
                    {HEADLINE}
                </motion.h2>

                {/* Explainer — one line, subtle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-sm sm:text-base text-white/55 leading-snug mb-8 sm:mb-10 max-w-[90ch]"
                >
                    {EXPLAINER}
                </motion.p>

                {/* Rotating micro-line — subdued, crossfade */}
                <div className="relative h-12 sm:h-14 flex items-center justify-center w-full px-2">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={tipIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.65 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: CROSSFADE_MS,
                                ease: "easeInOut"
                            }}
                            className="text-xs sm:text-sm font-normal tracking-wide text-white/50 absolute left-0 right-0 text-center max-w-[520px]"
                        >
                            {MICRO_LINES[tipIndex]}
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