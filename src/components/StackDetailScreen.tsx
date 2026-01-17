import { motion } from 'motion/react';
import { assertStack, EngineResult } from '../types/domain';
import logoImg from '../assets/logo.png';

interface StackDetailScreenProps {
    stack: EngineResult;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    // Runtime Guard - Rule 3
    assertStack(stack);

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col font-sans">
            {/* Header - Compact */}
            <div className="flex-none flex items-center justify-between mb-6 z-20 relative">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/40 group-hover:text-[#00FFD1] transition-colors">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Back</span>
                </button>

                <div className="flex items-center gap-2">
                    <img src={logoImg} alt="GO logo" className="w-6 h-auto" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-normal text-white serif">Guided Outcomes</span>
                        <span className="text-[9px] text-white/40">Stack Protocol</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-auto w-full space-y-6 pb-10">
                {/* Title Card - Compact */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-2xl font-light text-white serif tracking-tight leading-tight">{stack.name}</h1>
                    <p className="text-white/60 text-xs max-w-lg mx-auto leading-relaxed">{stack.reasoning}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-pulse" />
                        <span className="text-[#7C5CFF] text-[10px] font-bold uppercase tracking-widest">
                            {stack.totalDuration}
                        </span>
                    </div>
                </div>

                {/* Vertical Timeline - Tight */}
                <div className="relative space-y-0">
                    {/* Continuous Vertical Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-[#7C5CFF] via-[#00FFD1] to-transparent opacity-30 z-0" />

                    {stack.layers.map((layer, idx) => (
                        <div key={idx} className="relative z-10">

                            {/* Connector Label - Compact */}
                            {idx > 0 && (
                                <div className="flex items-center gap-3 mb-4 ml-[7px]">
                                    <div className="w-6 h-6 rounded-full bg-[#111] border border-white/20 flex items-center justify-center text-[8px] text-white/40 font-bold uppercase tracking-widest z-10">
                                        ↓
                                    </div>
                                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                                        {stack.layers[idx - 1].durationEstimate ? `After ${stack.layers[idx - 1].durationEstimate}` : 'Next'}
                                    </span>
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="pl-10 relative"
                            >
                                {/* Time Node - Compact */}
                                <div className="absolute left-[13px] top-0 w-3.5 h-3.5 rounded-full bg-[#7C5CFF] border-2 border-black z-20 shadow-[0_0_10px_rgba(124,92,255,0.5)]" />

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                                    {/* Header - Compact */}
                                    <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                                        <div>
                                            <h3 className="text-sm text-white font-medium mb-0.5">{layer.layerName}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-[#00FFD1]">
                                                <span className="uppercase tracking-widest font-bold">Onset:</span>
                                                <span className="font-mono opacity-80">{layer.onsetEstimate}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Duration</div>
                                            <div className="font-mono text-xs text-white/80">{layer.durationEstimate}</div>
                                        </div>
                                    </div>

                                    {/* Core Semantics - Compact Grid */}
                                    <div className="grid grid-cols-1 gap-3 mb-3">
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <div className="text-[9px] uppercase tracking-widest text-[#7C5CFF] font-bold">Outcome</div>
                                                <p className="text-white/90 text-xs leading-snug">
                                                    {layer.phaseIntent}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <div className="text-[9px] uppercase tracking-widest text-[#00FFD1] font-bold">Protocol</div>
                                                <p className="text-white/90 text-xs leading-snug">
                                                    {layer.consumptionGuidance}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Why This Phase - Compact */}
                                    <div className="mb-3 bg-black/20 rounded-md p-2.5 border border-white/5">
                                        <p className="text-white/50 text-[10px] italic leading-relaxed">
                                            "{layer.whyThisPhase}"
                                        </p>
                                    </div>

                                    {/* Cultivar Chip - Compact */}
                                    <div className="flex flex-wrap gap-2">
                                        {layer.cultivars.map((c, cIdx) => (
                                            <div key={cIdx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 border border-white/5">
                                                <span className="text-white/90 text-[10px] font-medium">{c.name}</span>
                                                <span className="text-white/40 text-[9px]">({c.profile})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}

                    {/* End Node */}
                    <div className="flex items-center gap-3 pt-4 ml-[7px]">
                        <div className="w-6 h-6 rounded-full bg-[#111] border border-white/20 flex items-center justify-center text-white/40 z-10 text-[8px]">
                            •
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-semibold">
                            Complete
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
