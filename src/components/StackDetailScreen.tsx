import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Share2, Layers, Leaf, Info } from 'lucide-react';
import { UIStackRecommendation } from '../types/domain';
import { StackCompositionBar } from './visuals/StackCompositionBar';
import { getCultivarVisuals } from '../lib/cultivarData';
import { getGlassCardStyles } from '../lib/glassStyles';

interface StackDetailScreenProps {
    stack: UIStackRecommendation;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    // 3. STACK DETAIL LAYOUT — FIX THE DISASTER
    // ONE vertical scroll container. ONE card per stack. NO columns.

    if (!stack) return null;

    return (
        <div className="w-full h-full bg-black text-white overflow-y-auto overflow-x-hidden font-sans relative">
            {/* Background - Minimal */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black pointer-events-none" />

            {/* Header - Compact */}
            <div className="flex items-center justify-between sticky top-0 z-50 py-2 -mx-4 px-4 bg-black/80 backdrop-blur-md border-b border-white/5">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#00FFD1] hover:bg-[#00FFD1]/10 transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-white/40">Details</span>
                    <Share2 size={14} className="text-white/40" />
                </div>
            </div>

            <div className="flex flex-col gap-4 h-full">

                {/* Stack Header Block */}
                <div className="shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Layers size={12} className="text-[#00FFD1]" />
                        <span className="text-[#00FFD1] text-[9px] uppercase tracking-widest font-bold">Protocol</span>
                    </div>
                    <h1 className="text-2xl font-serif text-white mb-1 leading-tight">
                        {stack.name}
                    </h1>
                    <p className="text-white/60 text-xs leading-normal line-clamp-2">
                        {stack.description}
                    </p>
                </div>

                {/* VISUALIZATION - Compact */}
                <div className="w-full bg-white/5 rounded-xl p-3 border border-white/10 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Leaf size={12} className="text-white/60 shrink-0" />
                            <span className="text-[9px] uppercase tracking-widest text-white/60 truncate">Composition</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-white/40 shrink-0">
                            <Clock size={10} />
                            <span>{stack.totalDuration}</span>
                        </div>
                    </div>
                    <StackCompositionBar stack={stack} />
                </div>

                {/* TIMELINE SEQUENCE - The "One Card" Solution */}
                <div className="flex flex-col flex-1 min-h-0 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Sequence</span>
                    </div>

                    <div className="overflow-y-auto p-3 flex flex-col gap-4">
                        {stack.layers.map((layer, index) => (
                            <div key={index} className="relative pl-4 border-l border-white/10 last:border-0">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#00FFD1] shadow-[0_0_8px_rgba(0,255,209,0.3)] ring-4 ring-black" />

                                {/* Header Row */}
                                <div className="flex items-baseline justify-between mb-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[#00FFD1] font-mono text-xs font-bold">{layer.timing}</span>
                                        <h3 className="text-sm font-serif text-white">{layer.layerName}</h3>
                                    </div>
                                    <span className="text-[9px] uppercase text-white/40 tracking-wider hidden sm:block">Phase 0{index + 1}</span>
                                </div>

                                {/* Intent */}
                                <p className="text-[10px] text-white/60 italic mb-2">{layer.phaseIntent}</p>

                                {/* Cultivar List - Minimal */}
                                <div className="space-y-1.5">
                                    {layer.cultivars.map((c, i) => {
                                        const visuals = getCultivarVisuals(c.name);
                                        return (
                                            <div key={i} className="flex items-center gap-2 bg-white/5 rounded p-1.5 border border-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: visuals.color }} />
                                                <span className="text-[10px] font-medium text-white truncate flex-1">{c.name}</span>
                                                {/* Tiny Terp Tags */}
                                                <div className="flex gap-1 shrink-0">
                                                    {visuals.terpenes.slice(0, 1).map(t => (
                                                        <span key={t} className="text-[8px] opacity-40 uppercase">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
