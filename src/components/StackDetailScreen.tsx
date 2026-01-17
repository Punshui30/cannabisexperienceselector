import { motion } from 'motion/react';
import { UIStackRecommendation, assertStack, EngineResult } from '../types/domain';
import logoImg from '../assets/logo.png';

interface StackDetailScreenProps {
    stack: EngineResult;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    // Runtime Guard - Rule 3
    assertStack(stack);

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col font-sans">
            {/* Header */}
            <div className="flex-none flex items-center justify-between mb-12 z-20 relative">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40 group-hover:text-[#00FFD1] transition-colors">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs uppercase tracking-widest text-white/40">Back</span>
                </button>

                <div className="flex items-center gap-3">
                    <img src={logoImg} alt="GO logo" className="w-8 h-auto" />
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-normal text-white serif">Guided Outcomes</span>
                        <span className="text-[10px] text-white/40">Stack Protocol</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full space-y-8 pb-20">
                {/* Title Card */}
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-4xl font-light text-white serif tracking-tight leading-tight">{stack.name}</h1>
                    <p className="text-white/60 max-w-lg mx-auto leading-relaxed">{stack.reasoning}</p>
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10">
                        <span className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
                        <span className="text-[#7C5CFF] text-xs font-bold uppercase tracking-widest">
                            Total Duration: {stack.totalDuration}
                        </span>
                    </div>
                </div>

                {/* Vertical Timeline */}
                <div className="relative space-y-0">
                    {/* Continuous Vertical Line */}
                    <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#7C5CFF] via-[#00FFD1] to-transparent opacity-30 z-0" />

                    {stack.layers.map((layer, idx) => (
                        <div key={idx} className="relative z-10">

                            {/* Connector Label (THEN/AFTER) - Skip for first item */}
                            {idx > 0 && (
                                <div className="flex items-center gap-4 mb-8 ml-[14px]">
                                    <div className="w-8 h-8 rounded-full bg-[#111] border border-white/20 flex items-center justify-center text-[10px] text-white/40 font-bold uppercase tracking-widest z-10">
                                        ↓
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                                        Then, after {stack.layers[idx - 1].durationEstimate || 'transition'}...
                                    </span>
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="pl-16 relative"
                            >
                                {/* Time Node */}
                                <div className="absolute left-[19px] top-0 w-6 h-6 rounded-full bg-[#7C5CFF] border-4 border-black z-20 shadow-[0_0_15px_rgba(124,92,255,0.5)]" />

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                        <div>
                                            <h3 className="text-xl text-white font-medium mb-1">{layer.layerName}</h3>
                                            <div className="flex items-center gap-2 text-xs text-[#00FFD1]">
                                                <span className="uppercase tracking-widest font-bold">Estimated Onset:</span>
                                                <span className="font-mono">{layer.onsetEstimate}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Duration</div>
                                            <div className="font-mono text-sm text-white/80">{layer.durationEstimate}</div>
                                        </div>
                                    </div>

                                    {/* Core Semantics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Phase Outcome</div>
                                            <p className="text-white/90 text-sm leading-relaxed border-l-2 border-[#7C5CFF] pl-3">
                                                {layer.phaseIntent}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Protocol</div>
                                            <p className="text-white/90 text-sm leading-relaxed border-l-2 border-[#00FFD1] pl-3">
                                                {layer.consumptionGuidance}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Why This Phase */}
                                    <div className="mb-6 bg-black/20 rounded-lg p-4 border border-white/5">
                                        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Transition Logic</div>
                                        <p className="text-white/60 text-xs italic leading-relaxed">
                                            "{layer.whyThisPhase}"
                                        </p>
                                    </div>

                                    {/* Cultivar Chip */}
                                    <div className="flex flex-wrap gap-2">
                                        {layer.cultivars.map((c, cIdx) => (
                                            <div key={cIdx} className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 border border-white/5">
                                                <span className="text-white/90 text-sm font-medium">{c.name}</span>
                                                <span className="text-white/40 text-xs">({c.profile})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}

                    {/* End Node */}
                    <div className="flex items-center gap-4 pt-8 ml-[14px]">
                        <div className="w-8 h-8 rounded-full bg-[#111] border border-white/20 flex items-center justify-center text-white/40 z-10">
                            •
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-semibold">
                            Protocol Complete
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
