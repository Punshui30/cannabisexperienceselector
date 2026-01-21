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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6 overflow-y-auto">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Central Pulse (Tighter) */}
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full animate-pulse-slow" />

                {/* LOGO (Center) - Breathing Animation */}
                <motion.div
                    animate={{ scale: [0.85, 1.25, 0.85] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-28 h-28 flex items-center justify-center p-2 bg-transparent"
                >
                    <img
                        src={logoImg}
                        alt="StrainMath Logo"
                        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] grayscale brightness-[10]"
                    />
                </motion.div>

                {/* ROTATING TEXT RING (Tighter) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full opacity-90">
                        <defs>
                            <path
                                id="textCircle"
                                d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                            />
                        </defs>
                        <text className="text-[12px] font-black tracking-[0.25em] fill-white uppercase" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                            <textPath href="#textCircle" startOffset="0%">
                                StrainMath™ • StrainMath™ • StrainMath™ • StrainMath™ •
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
