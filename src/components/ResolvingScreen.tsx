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
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-transparent overflow-hidden font-sans">

            {/* Content Overlay - Centered and confident */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8 h-32">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={isClosing ? 'closing' : phraseIndex}
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-white/90 text-lg md:text-xl tracking-widest font-light text-center px-8 relative z-50 serif"
                        style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}
                    >
                        {currentPhrase}
                    </motion.p>
                </AnimatePresence>

                {/* Subtle loading indicator compatible with minimal theme */}
                <div className="h-0.5 w-24 bg-white/10 overflow-hidden rounded-full">
                    <motion.div
                        className="h-full bg-[#00FFD1]"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>

        </div>
    );
}
