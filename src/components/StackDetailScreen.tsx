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
                import {useState} from 'react';

                // ... 

                export function StackDetailScreen({stack, onBack}: StackDetailScreenProps) {
    // Calculator State
    const [isCalculating, setIsCalculating] = useState(false);
                const [prerollSize, setPrerollSize] = useState<number>(1.0); // Grams

                    // ...

                    {/* TIMELINE SEQUENCE */}
                    {/* ... (Timeline content) ... */}

            </div>

            {/* CALCULATOR BUTTON - Floating Action Style */}
            <div className="flex-shrink-0 pt-4 pb-8 flex justify-center sticky bottom-0 z-40 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
                <button
                    onClick={() => setIsCalculating(true)}
                    className="pointer-events-auto shadow-[0_0_20px_rgba(0,255,209,0.3)] bg-[#00FFD1] text-black font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                >
                    <Layers size={14} /> Calculate Recipe
                </button>
            </div>

            {/* CALCULATOR MODAL */}
            {isCalculating && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsCalculating(false)}>
                    <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif text-white">Stack Recipe</h3>
                            <button onClick={() => setIsCalculating(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>

                        {/* Input Scroller - Stylized */}
                        <div className="mb-8">
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Total Flower (Grams)</label>
                            <div className="flex gap-2">
                                {[0.5, 1.0, 1.5].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setPrerollSize(size)}
                                        className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${prerollSize === size
                                                ? 'bg-[#00FFD1] border-[#00FFD1] text-black'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {size}g
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recipe Output */}
                        <div className="space-y-3">
                            <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Layer Breakdown</span>
                            {stack.layers.map((layer, idx) => {
                                // Logic: Preroll Size / Number of Layers = Grams per Layer (Simplified Equal Split for now based on concept)
                                // Or based on Duration ratios? Assuming equal physical layers for stack building ease.
                                const amount = (prerollSize / stack.layers.length).toFixed(2);

                                return (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5">
                                        <span className="text-sm text-white font-medium">{layer.layerName}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-mono text-[#00FFD1]">{amount}</span>
                                            <span className="text-xs text-white/40 font-mono">g</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-[10px] text-white/30 italic">Grind layers separately. Pack sequentially.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div >
    );
}
