import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, BrainCircuit, Microscope } from 'lucide-react';
import type { UserInput, UIBlendRecommendation } from '../lib/engineAdapter';

interface ResolvingScreenProps {
    input: UserInput;
    recommendation: UIBlendRecommendation;
    onComplete: () => void;
}

export function ResolvingScreen({ input, recommendation, onComplete }: ResolvingScreenProps) {
    const [stage, setStage] = useState(0);

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
        const timelines = [
            { delay: 0, js: () => setStage(1) }, // Initial: "Analyzing..."
            { delay: 1500, js: () => setStage(2) }, // "Finding [Terpenes]..."
            { delay: 5000, js: () => setStage(3) }, // "Calibrating..." or transition
            { delay: 6000, js: () => onComplete() } // Done
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

                    {/* STAGE 1: Analyzing */}
                    {stage === 1 && (
                        <motion.div
                            key="stage1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#FFD700] blur-xl opacity-20 animate-pulse" />
                                <BrainCircuit className="w-16 h-16 text-[#FFD700]" strokeWidth={1.5} />
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
