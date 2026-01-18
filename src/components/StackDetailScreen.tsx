import { motion } from 'motion/react';
import { assertStack, EngineResult, UIStackRecommendation } from '../types/domain';
import { cn } from './ui/utils';
import { ACCENTS } from '../lib/accents';
import logoImg from '../assets/logo.png';
import { StackLineGraph } from './visuals/StackLineGraph';
import { TerpeneDisplay } from './visuals/TerpeneDisplay';

interface StackDetailScreenProps {
    stack: EngineResult;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    // Runtime Guard - Rule 3
    assertStack(stack);

    return (
        <div className="h-screen w-screen bg-transparent text-white p-6 flex flex-col font-sans overflow-hidden">
            {/* Header - Minimal height */}
            <div className="flex-none flex items-center justify-between mb-2 z-20 relative">
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
                    <img src={logoImg} alt="GO logo" className="w-5 h-auto" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-normal text-white serif">Guided Outcomes</span>
                        <span className="text-[9px] text-white/40">Physical Protocol</span>
                    </div>
                </div>
            </div>

            {/* Title Section & Visuals */}
            <div className="flex-none text-center space-y-4 mb-4 relative">
                {/* Background Graph Layer */}
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-30 pointer-events-none z-0 translate-y-2">
                    <StackLineGraph stack={stack as UIStackRecommendation} />
                </div>

                <div className="relative z-10">
                    <h1 className="text-2xl font-light text-white serif tracking-tight leading-tight">{stack.name}</h1>
                    <p className="text-white/60 text-xs max-w-lg mx-auto leading-relaxed">{stack.reasoning}</p>

                    <div className="flex justify-center mt-3">
                        <TerpeneDisplay stack={stack as UIStackRecommendation} />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-pulse" />
                        <span className="text-[#7C5CFF] text-[9px] font-bold uppercase tracking-widest">
                            {stack.totalDuration}
                        </span>
                    </div>
                </div>
            </div>

            {/* Horizontal Timeline Container */}
            <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center">
                <div className="flex flex-row items-stretch justify-between gap-4 h-full max-h-[400px]">

                    {stack.layers.map((layer, idx) => {
                        // ROBUST KEY DETECTION
                        const raw = layer.layerName.toLowerCase();
                        let sectionKey: keyof typeof ACCENTS = 'core';

                        if (raw.includes('tip')) sectionKey = 'tip';
                        else if (raw.includes('base') || raw.includes('finish')) sectionKey = 'base';
                        else sectionKey = 'core'; // covers 'core', 'middle', 'center'

                        const accent = ACCENTS[sectionKey];

                        return (
                            <div key={idx} className="flex-1 flex flex-col relative group">

                                {/* Connector Line (Horizontal) */}
                                {idx < stack.layers.length - 1 && (
                                    <div className="absolute top-[20px] right-[-28px] w-10 h-[2px] bg-gradient-to-r from-[#7C5CFF] to-[#00FFD1] opacity-30 z-0 hidden md:block" />
                                )}
                                {/* Connector Arrow */}
                                {idx < stack.layers.length - 1 && (
                                    <div className="absolute top-[8px] right-[-24px] w-6 h-6 rounded-full bg-[#111] border border-white/20 flex items-center justify-center z-10 hidden md:flex">
                                        <span className="text-[8px] text-white/40">→</span>
                                    </div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.15 }}
                                    className={cn(
                                        "h-full bg-white/5 border rounded-2xl p-5 hover:bg-white/[0.07] transition-all flex flex-col",
                                        accent.border,
                                        accent.glow
                                    )}
                                >
                                    {/* Phase Header */}
                                    <div className={cn("flex justify-between items-start mb-4 border-b border-white/5 pb-3", accent.text)}>
                                        <div>
                                            <div className="text-[9px] uppercase tracking-widest opacity-80 font-bold mb-1">{layer.onsetEstimate}</div>
                                            <h3 className="text-lg font-medium text-white">{layer.layerName.split(':')[0]}</h3>
                                            <span className="text-xs text-white/60">{layer.layerName.split(':')[1]}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Burn</div>
                                            <div className="font-mono text-xs text-white/80">~{idx === 0 ? '10' : idx === 1 ? '15' : '10'}m</div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-bold">Physical Position</div>
                                            <p className="text-white/90 text-xs leading-relaxed border-l-2 border-[#7C5CFF] pl-2">
                                                {layer.phaseIntent}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-bold">Transition Logic</div>
                                            <p className="text-white/60 text-[10px] italic leading-relaxed">
                                                "{layer.whyThisPhase}"
                                            </p>
                                        </div>

                                        <div>
                                            <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-bold">Combustion</div>
                                            <p className="text-white/90 text-[10px] leading-relaxed border-l-2 border-[#00FFD1] pl-2">
                                                {layer.consumptionGuidance}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chemicals (Cultivars - Minimal) */}
                                    <div className="mt-4 pt-3 border-t border-white/5">
                                        {layer.cultivars.map((c, cIdx) => (
                                            <div key={cIdx} className="flex items-center justify-between">
                                                <span className="text-white/90 text-xs font-medium">{c.name}</span>
                                                <span className="text-white/40 text-[9px]">{c.profile}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Indicator (Bottom) */}
                <div className="flex items-center justify-center gap-2 mt-8 opacity-30">
                    <span className="text-[9px] uppercase tracking-widest text-white">Start</span>
                    <div className="w-64 h-px bg-gradient-to-r from-white to-transparent" />
                    <span className="text-[9px] uppercase tracking-widest text-white">Finish</span>
                </div>
            </div>
        </div>
    );
}
