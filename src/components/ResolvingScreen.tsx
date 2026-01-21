import { useEffect, useState } from 'react';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

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
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Central Pulse */}
                <div className="absolute inset-0 bg-[#d4a259]/10 blur-2xl rounded-full animate-pulse-slow" />

                {/* LOGO (Center) */}
                <div className="relative z-10 w-24 h-24 flex items-center justify-center p-2 bg-transparent">
                    <img
                        src={logoImg}
                        alt="StrainMath Logo"
                        className="w-full h-full object-contain animate-pulse-slow drop-shadow-[0_0_15px_rgba(212,162,89,0.3)]"
                    />
                </div>

                {/* ROTATING TEXT RING */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full opacity-90">
                        <defs>
                            <path
                                id="textCircle"
                                d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                            />
                        </defs>
                        <text className="text-[14px] font-bold tracking-[0.2em] fill-[#d4a259] uppercase">
                            <textPath href="#textCircle" startOffset="0%">
                                StrainMath™ • StrainMath™ • StrainMath™ •
                            </textPath>
                        </text>
                    </svg>
                </motion.div>
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
