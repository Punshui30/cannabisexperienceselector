import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnginePhase } from '../types/domain';
import { EngineCore3D } from './EngineCore3D';
import { OutcomeSignature } from './OutcomeSignature';

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

    // Initialize randomized set on mount
    useEffect(() => {
        setShuffledCopy(shuffleArray(INFO_COPY));
    }, []);

    // Info copy rotation with randomized interval
    useEffect(() => {
        if (shuffledCopy.length === 0) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const rotate = () => {
            setIndex((prev) => (prev + 1) % shuffledCopy.length);

            // Random interval between 2.5 and 3.5 seconds
            const nextInterval = 2500 + Math.random() * 1000;
            timeoutId = setTimeout(rotate, nextInterval);
        };

        const initialInterval = 2500 + Math.random() * 1000;
        timeoutId = setTimeout(rotate, initialInterval);

        return () => clearTimeout(timeoutId);
    }, [shuffledCopy]);

    // Fallback display logic
    const currentText = shuffledCopy[index] || INFO_COPY[6];

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white overflow-hidden bg-black/60 backdrop-blur-sm">
            {/* Subtle vignette background */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/40 to-black/80" />

            {/* Ambient brand glow (Reduced for better CinematicBackground visibility) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-[#7C3AED]/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-[#059669]/25 rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            {/* GO / StrainMath ethos */}
            <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-xl">

                {/* HEARTBEAT & SIGNATURE */}
                <div className="w-full h-[320px] flex items-center justify-center mb-6 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <OutcomeSignature />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6"
                >
                    <p className="text-[11px] tracking-[0.35em] uppercase text-white/40">
                        Guided Outcomes
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        className="text-xl sm:text-2xl font-light leading-snug text-white/90 serif min-h-[4em] flex items-center justify-center"
                    >
                        {currentText}
                    </motion.p>
                </AnimatePresence>

                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0.5, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-6 text-xs text-white/50 tracking-[0.25em] uppercase"
                >
                    Powered by StrainMath™
                </motion.p>
            </div>
        </div>
    );
}