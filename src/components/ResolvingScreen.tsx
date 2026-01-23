import { useEffect } from 'react';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation, EnginePhase } from '../types/domain';
import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { EngineCore3D } from './EngineCore3D';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    consultantText?: string;
    onComplete: () => void;
    onRecalculate?: (feedback: string) => void;
    progress?: number; // Controlled progress from parent
    phase?: EnginePhase;
}

export function ResolvingScreen({ input, recommendation, consultantText, onComplete, onRecalculate, progress = 0, phase = 'idle' }: ResolvingScreenProps) {
    // Auto-complete when progress reaches 100%
    useEffect(() => {
        if (progress >= 100) {
            console.log('[ResolvingScreen_V8.4] Progress 100% detected, transitioning...');
            const timeout = setTimeout(() => {
                onComplete();
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [progress, onComplete]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full h-80 flex items-center justify-center">
                <EngineCore3D phase={phase} />
            </div>

            <div className="mt-20 text-center space-y-12 relative z-50">
                <div className="space-y-4 px-6 max-w-full">
                    <h2 className="text-xl font-extralight font-serif tracking-[0.25em] text-white/90 uppercase text-center break-keep">
                        Synthesizing
                    </h2>
                    <div className="h-[0.5px] w-12 bg-white/30 mx-auto" />
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-xs text-white/50 uppercase tracking-[0.3em] font-sans font-light">
                        {progress < 30 ? "Analyzing Intention" :
                            progress < 60 ? "Matching Cultivars" :
                                progress < 90 ? "Calibrating Ratios" :
                                    "Finalizing Blend"}
                    </div>
                    <div className="text-xs text-white/50 uppercase tracking-[0.3em] font-sans font-light">
                        {Math.round(progress || 0)}%
                    </div>
                </div>
            </div>

            {/* Input Echo */}
            <div className="mt-12 max-w-xs text-center">
                <p className="text-sm text-white/60 italic">"{input.text}"</p>
            </div>
        </div>
    );
}
