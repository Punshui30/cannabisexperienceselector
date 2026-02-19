import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, History, LayoutGrid, Zap, Moon, Users, HeartPulse, Palette, Smile } from 'lucide-react';
import { IntentSeed as UserInput } from '../types/domain';
import { SessionMemoryStore } from '../lib/memory/sessionMemory';

const MotionDiv = motion.div as any;

interface WizardProps {
    onClose: () => void;
    onComplete: (intent: UserInput) => void;
}

type StepIdx = 0 | 1 | 2;

export function GuidedOutcomeWizard({ onClose, onComplete }: WizardProps) {
    const [step, setStep] = useState<StepIdx>(0);
    const memory = useMemo(() => SessionMemoryStore.get(), []);

    // Selection State
    const [context, setContext] = useState<string>('');
    const [vibe, setVibe] = useState<string>('');
    const [tradeoff, setTradeoff] = useState<number>(50); // 0 = Calm/Body, 100 = Energy/Head

    const contexts = ['Work / Study', 'Socializing', 'Fitness / Outdoors', 'Creative Work', 'Relaxing / TV', 'Nighttime / Bed'];
    const vibes = [
        { id: 'Focus', icon: Zap, color: '#00FFD1' },
        { id: 'Relax', icon: HeartPulse, color: '#A855F7' },
        { id: 'Sleep', icon: Moon, color: '#6366F1' },
        { id: 'Social', icon: Users, color: '#EAB308' },
        { id: 'Relief', icon: HeartPulse, color: '#34D399' },
        { id: 'Energy', icon: Zap, color: '#FFD700' },
        { id: 'Creativity', icon: Palette, color: '#FF6B6B' },
        { id: 'Euphoria', icon: Smile, color: '#FF00FF' },
    ];

    const handleSubmit = () => {
        const intent: UserInput = {
            kind: 'blend',
            text: `Guided Outcome: ${vibe} for ${context}. Focus on ${tradeoff > 50 ? 'mental energy' : 'physical relaxation'}.`,
            mode: 'engine'
        };
        onComplete(intent);
    };

    const handleUseLastMemory = () => {
        if (!memory.lastIntentSpec) return;
        // Map memory lastIntentSpec back to a seed
        const lastSeed: UserInput = {
            kind: 'blend',
            text: memory.lastIntentSummary || memory.lastIntentSpec.originalInput,
            mode: 'engine'
        };
        onComplete(lastSeed);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl">
            <MotionDiv
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px]"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={16} className="text-[#00FFD1]" />
                            <h2 className="text-xl font-serif text-white">Guided Outcome Wizard</h2>
                        </div>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">3 Steps to your perfect blend</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-8 pt-6">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <MotionDiv
                            className="h-full bg-[#00FFD1]"
                            animate={{ width: `${((step + 1) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <MotionDiv
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg text-white mb-2">What's the context?</h3>
                                    <p className="text-sm text-white/40 font-light italic">Help us understand the setting for this experience.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {contexts.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setContext(c)}
                                            className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left ${context === c ? 'bg-[#00FFD1]/10 border-[#00FFD1] text-[#00FFD1]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>

                                {memory.lastIntentSummary && (
                                    <button
                                        onClick={handleUseLastMemory}
                                        className="w-full mt-4 p-4 rounded-2xl bg-[#BF5AF2]/10 border border-[#BF5AF2]/30 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <History size={18} className="text-[#BF5AF2]" />
                                            <div className="text-left">
                                                <div className="text-[10px] uppercase font-bold text-[#BF5AF2] tracking-widest mb-1">Use Last Session</div>
                                                <div className="text-xs text-white/60 line-clamp-1 italic">"{memory.lastIntentSummary}"</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-[#BF5AF2] opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )}
                            </MotionDiv>
                        )}

                        {step === 1 && (
                            <MotionDiv
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg text-white mb-2">Desired Vibe</h3>
                                    <p className="text-sm text-white/40 font-light italic">Select the primary effect or mood you're looking for.</p>
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                    {vibes.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setVibe(v.id)}
                                            className={`flex flex-col items-center gap-3 p-3 rounded-2xl border transition-all ${vibe === v.id ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/5 hover:bg-white/8'}`}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${v.color}${vibe === v.id ? '30' : '10'}`, color: v.color }}
                                            >
                                                <v.icon size={20} />
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${vibe === v.id ? 'text-white' : 'text-white/40'}`}>{v.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </MotionDiv>
                        )}

                        {step === 2 && (
                            <MotionDiv
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h3 className="text-lg text-white mb-2">Final Adjustment</h3>
                                    <p className="text-sm text-white/40 font-light italic">Slide to balance between physical and mental focus.</p>
                                </div>

                                <div className="space-y-6 px-4">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.2em]">
                                        <span className={tradeoff < 50 ? 'text-[#BF5AF2]' : 'text-white/20'}>Body / Calm</span>
                                        <span className={tradeoff > 50 ? 'text-[#00FFD1]' : 'text-white/20'}>Head / Energy</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={tradeoff}
                                        onChange={(e) => setTradeoff(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FFD1]"
                                    />
                                    <div className="text-center text-[11px] text-white/40 italic">
                                        {tradeoff < 40 && "Heavy physical relaxation and sedation."}
                                        {tradeoff >= 40 && tradeoff <= 60 && "Balanced synergy of mind and body."}
                                        {tradeoff > 60 && "Uplifting cerebral stimulation and clarity."}
                                    </div>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-4 flex gap-3 border-t border-white/5">
                    {step > 0 && (
                        <button
                            onClick={() => setStep((s) => (s - 1) as StepIdx)}
                            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    {step < 2 ? (
                        <button
                            onClick={() => setStep((s) => (s + 1) as StepIdx)}
                            disabled={(step === 0 && !context) || (step === 1 && !vibe)}
                            className="flex-1 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            Continue
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-[#00FFD1] text-black rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all shadow-[0_0_20px_rgba(0,255,191,0.2)]"
                        >
                            Generate My Blend
                            <Sparkles size={18} />
                        </button>
                    )}
                </div>
            </MotionDiv>
        </div>
    );
}
