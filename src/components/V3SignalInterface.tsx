import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnginePhase } from '../types/domain';
import { EngineCore3D } from './EngineCore3D';
// import { SignalAlignmentVisual } from './SignalAlignmentVisual'; // Removed
// import analyzeLoop from '../assets/analyze_loop.mp4'; // REMOVED - Using public path

interface V3SignalInterfaceProps {
    phase: EnginePhase;
    onComplete: () => void;
    inputText?: string;
}

const INFO_COPY = [
    "Compositional stability preserves session intent.",
    "Indica and sativa are placeholders. Ratios are results.",
    "Effects emerge from chemistry, not names.",
    "Consistency requires calculation, not categorization.",
    "Blending stabilizes what single strains cannot.",
    "Engineered outcomes depend on ratios, not labels.",
    "Terpenes interact. Cannabinoids compound.",
    "Inventory-aware resolution for precise results.",
    "Systemic balance over singular emphasis."
];

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function V3SignalInterface({ phase, onComplete }: V3SignalInterfaceProps) {
    const [shuffledCopy, setShuffledCopy] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    // Initialize randomized text on mount (Static per session)
    useEffect(() => {
        setShuffledCopy([INFO_COPY[Math.floor(Math.random() * INFO_COPY.length)]]);
    }, []);

    // Fallback display logic
    const currentText = shuffledCopy[0] || INFO_COPY[0];

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-end text-white overflow-hidden bg-black pb-24">
            {/* FULL SCREEN ANIMATION - UNCONSTRAINED (Top Heavy) */}
            <div className="absolute top-0 inset-x-0 h-[100vh] w-full z-0 pointer-events-none opacity-90">
                <video
                    src="/analyze_loop.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-150 origin-top"
                    style={{
                        filter: 'saturate(2.2) contrast(1.2) brightness(1.1)',
                        maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                    }}
                />
            </div>

            {/* Vignette - Stronger at bottom to maximize text contrast */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

            {/* Content Layer (Bottom Aligned) */}
            <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-xl">

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <p className="text-[11px] tracking-[0.35em] uppercase text-[#00FFD1]/80 drop-shadow-[0_0_15px_rgba(0,255,209,0.3)]">
                        Guided Outcomes
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl sm:text-4xl font-light leading-tight text-white serif min-h-[3em] flex items-center justify-center drop-shadow-2xl"
                    >
                        {currentText}
                    </motion.p>
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-8 flex gap-1"
                >
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0.5, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-6 text-xs text-white/40 tracking-[0.25em] uppercase"
                >
                    Powered by StrainMath™
                </motion.p>
            </div>
        </div>
    );
}