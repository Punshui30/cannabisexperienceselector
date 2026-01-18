import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Share2, Layers, Leaf, Info } from 'lucide-react';
import { UIStackRecommendation } from '../types/domain';
import { StackCompositionBar } from './visuals/StackCompositionBar';
import { getCultivarVisuals } from '../lib/cultivarData';

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

            <div className="relative z-10 w-full max-w-lg mx-auto p-6 pb-20 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between sticky top-0 z-50 py-4 -mx-6 px-6 bg-black/80 backdrop-blur-md border-b border-white/5">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#00FFD1] hover:bg-[#00FFD1]/10 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Details</span>
                        <Share2 size={16} className="text-white/40" />
                    </div>
                </div>

                {/* Stack Title Block */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Layers size={14} className="text-[#00FFD1]" />
                        <span className="text-[#00FFD1] text-[10px] uppercase tracking-widest font-bold">Protocol</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-white mb-2 leading-tight">
                        {stack.name}
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed">
                        {stack.description}
                    </p>
                </div>

                {/* VISUALIZATION: THE ONE BAR */}
                <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Leaf size={14} className="text-white/60" />
                        <span className="text-[10px] uppercase tracking-widest text-white/60">Composition</span>
                    </div>
                    {/* 2. GRAPH FIX - Real Data Only */}
                    <StackCompositionBar stack={stack} />

                    <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
                        <Clock size={12} />
                        <span>Total Duration: {stack.totalDuration}</span>
                    </div>
                </div>

                {/* PHASES LIST - Ordered Phase Cards */}
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold pl-2">Sequence</span>

                    {stack.layers.map((layer, index) => (
                        <div
                            key={index}
                            className="w-full rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden relative"
                        >
                            {/* Accent Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FFD1]/30" />

                            <div className="p-5 pl-7">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-white/40">Phase 0{index + 1}</span>
                                    <span className="text-[10px] font-mono text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded">
                                        {layer.timing}
                                    </span>
                                </div>
                                <h3 className="text-xl font-serif text-white mb-1">{layer.layerName}</h3>
                                <p className="text-sm text-white/60 italic mb-4">{layer.phaseIntent}</p>

                                {/* Cultivars in this Phase */}
                                <div className="space-y-3 pt-3 border-t border-white/5">
                                    {layer.cultivars.map((c, i) => {
                                        const visuals = getCultivarVisuals(c.name);
                                        return (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: visuals.color }} />
                                                    <span className="text-sm font-medium text-white">{c.name}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {visuals.terpenes.slice(0, 2).map(t => (
                                                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/5">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                                    <div>
                                        <span className="block text-[9px] uppercase text-white/30 mb-0.5">Focus</span>
                                        <span className="text-xs text-white/80">{layer.whyThisPhase}</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Padding */}
                <div className="h-20" />
            </div>
        </div>
    );
}
