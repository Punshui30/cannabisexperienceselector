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
            setPhraseIndex(prev => (prev + 1) % PHRASES.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [isClosing]);

    const currentPhrase = isClosing ? "Finalizing details..." : PHRASES[phraseIndex];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-black overflow-hidden font-sans">

            {/* Terpene Field Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Orb 1: Violet (Deep) */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-96 h-96 bg-[#7C5CFF] rounded-full blur-[100px] mix-blend-screen opacity-40"
                    style={{ left: '20%', top: '30%' }}
                />

                {/* Orb 2: Emerald (Fresh) */}
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, -40, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute w-80 h-80 bg-[#10B981] rounded-full blur-[90px] mix-blend-screen opacity-30"
                    style={{ right: '25%', top: '40%' }}
                />

                {/* Orb 3: Gold (Accent) */}
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 30, -30, 0],
                        y: [0, 20, -20, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute w-64 h-64 bg-[#FFD700] rounded-full blur-[80px] mix-blend-screen opacity-20"
                    style={{ bottom: '30%' }}
                />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8 h-32">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={isClosing ? 'closing' : phraseIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-white text-sm md:text-base tracking-widest font-light text-center px-8 relative z-50 text-shadow-lg"
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                    >
                        {currentPhrase}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Subtle Grain Overlay (Optional Polish) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

        </div>
    );
}
