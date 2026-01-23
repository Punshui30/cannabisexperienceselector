import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnginePhase } from '../types/domain';

interface V3SignalInterfaceProps {
    phase: EnginePhase;
    onComplete: () => void;
    inputText?: string;
}

const ETHOS_LINES = [
    "Strain names aren't stable. Experiences are.",
    "Consistency is engineered, not guessed.",
    "You're not choosing a strain. You're choosing an outcome.",
    "Real inputs. Real chemistry. Real repeatability.",
    "Guided Outcomes, not trial and error.",
    "The math is doing the work."
];

export function V3SignalInterface({ phase, onComplete }: V3SignalInterfaceProps) {
    const [index, setIndex] = useState(0);

    // Ethos copy rotation
    useEffect(() => {
        const id = setInterval(() => {
            setIndex((prev) => (prev + 1) % ETHOS_LINES.length);
        }, 8000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden">
            {/* Subtle vignette background */}
            <div className="absolute inset-0 bg-gradient-radial from-black via-black/95 to-black/80" />

            {/* Ambient brand glow (reusing existing gradients) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-[#7C3AED]/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-[#059669]/25 rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            {/* GO / StrainMath ethos */}
            <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-xl">
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
                        className="text-xl sm:text-2xl font-light leading-snug text-white/90 serif"
                    >
                        {ETHOS_LINES[index]}
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