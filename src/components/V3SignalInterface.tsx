import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnginePhase } from '../types/domain';

interface V3SignalInterfaceProps {
    phase: EnginePhase;
    onComplete: () => void;
    inputText?: string;
}

const ETHOS_STATEMENTS = [
    "How it feels depends on the chemistry.",
    "Names don’t tell the full story.",
    "The right mix makes it more stable.",
    "We match the formula to your goal.",
    "Balance matters more than hype.",
    "This isn’t guesswork."
];

// Helper to shuffle but we'll just rotate them sequentially starting from a random index
function getRandomIndex() {
    return Math.floor(Math.random() * ETHOS_STATEMENTS.length);
}

export function V3SignalInterface({ phase, onComplete }: V3SignalInterfaceProps) {
    const [index, setIndex] = useState(getRandomIndex());

    // Rotate statements every 3.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % ETHOS_STATEMENTS.length);
        }, 3500);
        return () => clearInterval(interval);
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

            <div className="relative z-10 flex flex-col items-center px-12 text-center max-w-2xl w-full">

                {/* Minimal Processing UI: 3-dot pulse */}
                <div className="flex gap-2 mb-8">
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

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 1 }}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 mb-12"
                >
                    Analyzing your request...
                </motion.h2>

                <div className="h-24 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.2,
                                ease: "easeInOut"
                            }}
                            className="text-2xl sm:text-3xl font-light leading-snug text-white serif"
                        >
                            {ETHOS_STATEMENTS[index]}
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