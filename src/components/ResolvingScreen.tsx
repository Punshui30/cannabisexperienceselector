import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { UserInput, UIBlendRecommendation } from '../lib/engineAdapter';

// Import scan assets
import scan1 from '../assets/scan_1.png';
import scan2 from '../assets/scan_2.png';
import scan3 from '../assets/scan_3.png';
import scan4 from '../assets/scan_4.png';
import scan5 from '../assets/scan_5.png';

const SCAN_IMAGES = [scan1, scan2, scan3, scan4, scan5];

interface ResolvingScreenProps {
    input: UserInput;
    recommendation: UIBlendRecommendation;
    onComplete: () => void;
}

export function ResolvingScreen({ input, recommendation, onComplete }: ResolvingScreenProps) {
    const [stage, setStage] = useState(0);
    const [scanIndex, setScanIndex] = useState(0);

    // Scan Animation Loop for Stage 1
    useEffect(() => {
        if (stage === 1) {
            const interval = setInterval(() => {
                setScanIndex(prev => (prev + 1) % SCAN_IMAGES.length);
            }, 150); // Fast cycle
            return () => clearInterval(interval);
        }
    }, [stage]);

    // Extract top terpenes from the recommendation
    // We look at the first cultivar's prominent terpenes or aggregate them
    const terpenes = recommendation.cultivars.flatMap(c => c.prominentTerpenes || [])
        .filter((v, i, a) => a.indexOf(v) === i) // Unique
        // If no prominentTerpenes found (e.g. data missing), fallback
        .slice(0, 3);

    const displayTerpenes = terpenes.length > 0 ? terpenes : ['Myrcene', 'Pinene', 'Caryophyllene'];

    // Determine the "intent phrase" roughly based on input
    // If user typed "I want to get lit", we try to mirror "get lit" or "help you turn up"
    const getIntentPhrase = () => {
        if (input.mode !== 'describe' || !input.text) return "match your preference";

        const text = input.text.toLowerCase();

        // Simple heuristic mapping based on user request examples
        if (text.includes('lit') || text.includes('turn up') || text.includes('party')) return "turn up";
        if (text.includes('sleep') || text.includes('bed') || text.includes('rest')) return "drift off";
        if (text.includes('focus') || text.includes('work') || text.includes('study')) return "lock in";
        if (text.includes('relax') || text.includes('chill')) return "unwind";
        if (text.includes('creative') || text.includes('art')) return "spark creativity";
        if (text.includes('laugh') || text.includes('funny')) return "have a laugh";

        // Fallback: use the last 5 words or so if short, or generic
        if (text.length < 50) return text;
        return "achieve your desired effect";
    };

    const intentPhrase = getIntentPhrase();

    useEffect(() => {
        // Reset stage on mount
        setStage(0);

        const timelines = [
            { delay: 100, js: () => setStage(1) }, // Start Analysis (Scan Anim)
            { delay: 3000, js: () => setStage(2) }, // Finding Terpenes
            { delay: 6500, js: () => setStage(3) }, // Finalizing
            { delay: 8500, js: () => onComplete() } // Done
        ];

        const timers = timelines.map(t => setTimeout(t.js, t.delay));
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-8 text-center bg-black/50 backdrop-blur-sm">

            {/* Background Pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-96 h-96 bg-[#00FFD1]/10 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-md w-full">
                <AnimatePresence mode="wait">

                    {/* STAGE 1: Analyzing (Scan Animation) */}
                    {stage === 1 && (
                        <motion.div
                            key="stage1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#FFD700] blur-xl opacity-20 animate-pulse" />
                                {/* Crossfade or simple frame swap */}
                                <img
                                    src={SCAN_IMAGES[scanIndex]}
                                    alt="Scanning"
                                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                                />
                            </div>
                            <h2 className="text-2xl font-light text-white tracking-wide">
                                Analyzing chemical profile...
                            </h2>
                        </motion.div>
                    )}

                    {/* STAGE 2: Finding Terpenes (The "Listening" Part) */}
                    {stage === 2 && (
                        <motion.div
                            key="stage2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <div className="flex justify-center gap-3 flex-wrap">
                                {displayTerpenes.map((terp, i) => (
                                    <motion.div
                                        key={terp}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.3 }}
                                        className="px-4 py-2 rounded-full border border-[#00FFD1]/30 bg-[#00FFD1]/5 text-[#00FFD1] text-sm font-medium tracking-wider"
                                    >
                                        {terp}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-light text-white leading-tight">
                                    Finding <span className="text-[#00FFD1] font-medium block mt-2">{displayTerpenes.join(', ')}</span>
                                </h2>
                                <p className="text-xl text-white/60 font-light">
                                    to help you <span className="text-[#FFD700] italic serif block mt-2">{intentPhrase}</span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE 3: Finalizing */}
                    {stage === 3 && (
                        <motion.div
                            key="stage3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Sparkles className="w-12 h-12 text-[#FFD700] animate-spin-slow" />
                            <h2 className="text-xl text-white/80 tracking-widest uppercase text-xs">
                                Calculating Optimal Ratios...
                            </h2>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

        </div>
    );
}
