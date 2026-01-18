import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { EngineResult, IntentSeed } from '../types/domain';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: EngineResult | null;
    onComplete: () => void;
}

const PHRASES = [
    // Primary rotation (core analysis)
    "Interpreting your desired outcome…",
    "Mapping effects to real chemistry…",
    "Analyzing terpene interactions…",
    "Balancing clarity, focus, and comfort…",
    "Translating intent into measurable targets…",
    "Resolving optimal ratios from available inventory…",

    // Blend-specific / StrainMath-specific
    "Evaluating how cultivars behave together…",
    "Designing a blend, not guessing a strain…",
    "Accounting for batch-level variation…",
    "Optimizing ratios for repeatable effects…",
    "Composing effects that don't exist in a single plant…",

    // COA / precision credibility cues
    "Referencing lab-verified COA data…",
    "Aligning chemistry with in-store inventory…",
    "Filtering candidates by measurable outcomes…",
    "Validating effect stability across components…",

    // Personalized reassurance
    "Specific to how you want to feel…",
    "Avoiding effects you said you don't want…",
    "Prioritizing smoothness over intensity…",
    "Reducing edge, preserving clarity…"
];

const CLOSING_PHRASES = [
    "Finalizing your custom blend…",
    "Preparing your recommendations…",
    "Results ready."
];

export function ResolvingScreen({ onComplete, recommendation }: ResolvingScreenProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    // Timer to handle transition - Implementation Detail, not UI
    // Reactive Bridge: complete immediately when results are ready
    useEffect(() => {
        if (recommendation) {
            setIsClosing(true);
            // Quick closing sequence then complete
            const timer = setTimeout(() => {
                onComplete();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [recommendation, onComplete]);

    // Cycling Timer
    useEffect(() => {
        if (isClosing) return;

        const interval = setInterval(() => {
            setPhraseIndex(i => i + 1);
        }, 2200);
        return () => clearInterval(interval);
    }, [isClosing]);

    const currentPhrase = isClosing ? CLOSING_PHRASES[CLOSING_PHRASES.length - 1] : PHRASES[phraseIndex % PHRASES.length];

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden bg-black z-50">
            {/* --- PREMIUM BACKGROUND --- */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-900 to-black">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#7C3AED]/40 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#059669]/40 rounded-full blur-[100px] animate-pulse delay-700" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            {/* --- CENTRAL ORBITAL VISUAL --- */}
            <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                {/* Core Nucleus */}
                <motion.div
                    className="absolute w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    animate={{ scale: [1, 1.1, 1], borderColor: ['rgba(255,255,255,0.1)', 'rgba(0,255,209,0.3)', 'rgba(255,255,255,0.1)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                        <span className="text-[#00FFD1] text-2xl">⚡</span>
                    </div>
                </motion.div>

                {/* Orbital Rings */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute border border-white/5 rounded-full"
                        style={{
                            width: `${140 + i * 60}px`,
                            height: `${140 + i * 60}px`,
                            borderWidth: '1px',
                            borderColor: i === 1 ? 'rgba(0, 255, 209, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                    >
                        {/* Particle on Orbit */}
                        <motion.div
                            className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[#00FFD1] shadow-[0_0_10px_#00FFD1]"
                            style={{ marginLeft: '-1px', marginTop: '-1px' }}
                        />
                    </motion.div>
                ))}
            </div>


            {/* --- TEXT CONTENT --- */}
            <div className="relative z-10 text-center max-w-md px-6 h-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <h2 className="text-2xl md:text-3xl font-serif font-light text-white tracking-wide leading-tight">
                            {currentPhrase}
                        </h2>
                        <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-[#00FFD1] to-transparent opacity-50" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* --- FOOTER PROGRESS --- */}
            <div className="absolute bottom-12 w-full flex justify-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 animate-pulse">
                    StrainMath Engine v2.1
                </p>
            </div>
        </div>
    );
}
