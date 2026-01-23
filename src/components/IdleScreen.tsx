import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../assets/logo.png';

interface IdleScreenProps {
    onInteraction: () => void;
}

const IDLE_COPY_POOL = [
    "Personalized cannabis, guided by intention",
    "Every experience, uniquely composed",
    "Blends designed for how you want to feel",
    "Precision cannabis, not guesswork",
    "Built around your outcome",
    "Layered experiences, designed to unfold",
    "Where intention meets formulation",
    "Crafted blends, guided by StrainMath"
];

export function IdleScreen({ onInteraction }: IdleScreenProps) {
    const [currentCopyIndex, setCurrentCopyIndex] = useState(0);

    // Rotate copy every 12 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCopyIndex((prev) => (prev + 1) % IDLE_COPY_POOL.length);
        }, 12000); // 12 seconds

        return () => clearInterval(interval);
    }, []);

    // Handle any interaction to exit idle state
    const handleInteraction = () => {
        onInteraction();
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black text-white overflow-hidden cursor-pointer"
            onClick={handleInteraction}
            onTouchStart={handleInteraction}
            onMouseMove={handleInteraction}
            onKeyDown={handleInteraction}
        >
            {/* Subtle vignette background */}
            <div className="absolute inset-0 bg-gradient-radial from-black via-black/95 to-black/80" />

            {/* Ambient background glow (reuse existing) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[0%] left-[-20%] w-[100%] h-[70%] bg-[#7C3AED]/20 rounded-full blur-[140px] animate-pulse-slow" />
                <div className="absolute bottom-[0%] right-[-20%] w-[100%] h-[70%] bg-[#059669]/20 rounded-full blur-[140px] animate-pulse-slow delay-700" />
            </div>

            {/* Subtle geometric watermark (GO brand) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <svg width="500" height="500" viewBox="0 0 500 500" className="text-white">
                    <g transform="translate(250, 250)">
                        {/* Central hexagon */}
                        <polygon
                            points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            opacity="0.4"
                        />
                        {/* Outer connected elements */}
                        <circle cx="75" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
                        <circle cx="-75" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
                        <circle cx="37" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
                        <circle cx="-37" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
                        <circle cx="37" cy="-65" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
                        <circle cx="-37" cy="-65" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />

                        {/* Connecting lines */}
                        <line x1="43" y1="-25" x2="75" y2="0" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
                        <line x1="-43" y1="-25" x2="-75" y2="0" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
                        <line x1="43" y1="25" x2="37" y2="65" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
                        <line x1="-43" y1="25" x2="-37" y2="65" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
                    </g>
                </svg>
            </div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
                {/* GO Logo with subtle glow breathing */}
                <motion.div
                    className="mb-16"
                    animate={{
                        filter: [
                            'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
                            'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))',
                            'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))'
                        ]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src={logoImg}
                        alt="GO"
                        className="w-16 h-16 object-contain opacity-80"
                    />
                </motion.div>

                {/* Rotating Copy */}
                <div className="text-center max-w-md mb-12">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentCopyIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-lg font-light text-white/90 leading-relaxed tracking-wide"
                        >
                            {IDLE_COPY_POOL[currentCopyIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Optional StrainMath branding */}
                <motion.div
                    className="mt-auto mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 2, delay: 1 }}
                >
                    <p className="text-xs text-white/40 font-light tracking-wider">
                        Powered by StrainMath™
                    </p>
                </motion.div>
            </div>

            {/* Subtle stack card silhouette (optional secondary visual) */}
            <motion.div
                className="absolute bottom-32 right-8 opacity-35 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 3, delay: 2 }}
            >
                <div className="w-48 h-32 border border-white/20 rounded-xl bg-white/[0.02] backdrop-blur-sm">
                    {/* Subtle stack card outline */}
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-white/10 rounded w-3/4" />
                                <div className="h-2 bg-white/5 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 bg-white/5 rounded w-full" />
                            <div className="h-2 bg-white/5 rounded w-4/5" />
                            <div className="h-2 bg-white/5 rounded w-3/5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}