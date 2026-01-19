import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IntentSeed } from '../types/domain';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: any; // Used to trigger completion signal
    onComplete: () => void;
}

const SYSTEM_STEPS = [
    "Interpreting intent signals",
    "Mapping chemotype constraints",
    "Evaluating terpene distributions",
    "Calculating entourage potential",
    "Resolving outcome confidence",
    "Finalizing blend architecture"
];

export function ResolvingScreen({ input, recommendation, onComplete }: ResolvingScreenProps) {
    const [stepIndex, setStepIndex] = useState(0);

    // Cycle through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex(prev => (prev + 1) % SYSTEM_STEPS.length);
        }, 1800); // 1.8s per step (Calm pace)

        return () => clearInterval(interval);
    }, []);

    // Monitor recommendation presence to trigger transition
    useEffect(() => {
        if (recommendation) {
            // Add a small delay to let the user see "Finalizing" before exiting
            const timer = setTimeout(() => {
                onComplete();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [recommendation, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden select-none cursor-wait">

            {/* --- AMBIENT BACKGROUND --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Subtle texture */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

                {/* Very Slow Gradient Drift */}
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#7C3AED]/10 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-[#059669]/10 rounded-full blur-[150px]"
                />
            </div>

            {/* --- CENTRAL ANCHOR (BREATHING CORE) --- */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* The "Brain" / Core */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-24 h-24 flex items-center justify-center"
                >
                    {/* Core Circle */}
                    <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />

                    {/* Inner "Pulse" */}
                    <div className="w-2 h-2 rounded-full bg-white/50 shadow-[0_0_20px_white]" />

                    {/* Subtle Rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-10px] rounded-full border border-dashed border-white/5"
                    />
                </motion.div>

                {/* --- INTELLIGENT COPY --- */}
                <div className="h-12 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={stepIndex}
                            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-sm font-serif tracking-wide text-white/80 text-center min-w-[280px]"
                        >
                            {SYSTEM_STEPS[stepIndex]}...
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* --- INPUT CONTEXT (Subtle grounding) --- */}
                {input.text && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-[-80px] text-[10px] uppercase tracking-widest text-white/20 max-w-xs text-center truncate px-4"
                    >
                        Context: "{input.text}"
                    </motion.p>
                )}
            </div>

        </div>
    );
}
