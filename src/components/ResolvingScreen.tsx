import { useEffect, useState } from 'react';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    consultantText?: string;
    onComplete: () => void;
    onRecalculate?: (feedback: string) => void;
}

export function ResolvingScreen({ input, recommendation, onComplete }: ResolvingScreenProps) {
    const [progress, setProgress] = useState(0);

    // Simulate analysis phases
    useEffect(() => {
        const duration = 2500; // 2.5s total "analysis" time
        const interval = 50;
        const step = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return p + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, []);

    // Auto-complete when ready and animation done
    useEffect(() => {
        if (recommendation && progress >= 100) {
            const timeout = setTimeout(() => {
                onComplete();
            }, 500); // Slight pause at 100%
            return () => clearTimeout(timeout);
        }
    }, [recommendation, progress, onComplete]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6">
            <div className="relative">
                {/* Central Pulse */}
                <div className="absolute inset-0 bg-[#00FFD1]/20 blur-xl rounded-full animate-pulse-slow" />

                <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <Brain className="text-[#00FFD1] w-8 h-8 animate-pulse" />
                </div>

                {/* Orbiting Particles */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-12px] border border-[#00FFD1]/30 rounded-full border-t-transparent border-l-transparent"
                />
            </div>

            <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-light font-serif tracking-wide animate-pulse">
                    Synthesizing Experience
                </h2>
                <div className="flex items-center justify-center gap-2 text-xs text-white/40 uppercase tracking-widest">
                    <span>Analyzing Intention</span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Input Echo */}
            <div className="mt-12 max-w-xs text-center">
                <p className="text-sm text-white/60 italic">"{input.text}"</p>
            </div>
        </div>
    );
}
