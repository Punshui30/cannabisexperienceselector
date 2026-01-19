import React, { useState } from 'react';
import { ArrowLeft, Clock, Share2, Layers } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { SpatialStack } from './SpatialStack';
import { resolveCultivarVisuals } from '../lib/visuals';

interface StackDetailScreenProps {
    stack: UIStackRecommendation;
    onBack: () => void;
    onOpenConsultant: () => void;
}

export function StackDetailScreen({ stack, onBack, onOpenConsultant }: StackDetailScreenProps) {
    const [isCalculating, setIsCalculating] = useState(false);
    const [prerollSize, setPrerollSize] = useState<number>(1.0); // Grams

    if (!stack) return null;

    return (
        <div className="w-full h-full flex flex-col bg-black text-white relative overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">

            {/* HEADER */}
            <div className="w-full p-6 flex justify-between items-center z-20">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#00FFD1] mb-1">Guided Outcomes<span className="text-[9px] align-top opacity-60">™</span> Stack</h2>
                    <div className="h-0.5 w-8 bg-[#00FFD1]/30 mx-auto rounded-full" />
                </div>
                <button
                    onClick={onOpenConsultant}
                    className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors px-3 py-2"
                >
                    Live Assistant
                </button>
            </div>

            {/* Background - Minimal */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black pointer-events-none" />

            <div className="flex flex-col gap-6 h-full relative z-10 pb-32 px-4">

                {/* Stack Header Block */}
                <div className="shrink-0 pt-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Layers size={14} className="text-[#00FFD1]" />
                        <span className="text-[#00FFD1] text-[10px] uppercase tracking-widest font-bold">Protocol</span>
                    </div>
                    <h1 className="text-3xl font-serif text-white mb-2 leading-tight">
                        {stack.name}
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                        {stack.description}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 mt-3">
                        <Clock size={10} />
                        <span>{stack.totalDuration} Protocol Duration</span>
                    </div>
                </div>

                {/* VISUALIZATION HERO - SpatialStack */}
                <div className="flex-1 flex items-center justify-center w-full max-w-md mx-auto py-8">
                    <SpatialStack data={stack} />
                </div>

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

                        {/* Recipe Output - CORRECTED LOGIC */}
                        <div className="space-y-4">
                            <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Assembly Instructions</span>
                            {stack.layers.map((layer, idx) => {
                                // Logic refinement: 
                                // Total Preroll / Num Layers = Grams per Layer
                                // Grams per Layer / Num Cultivars in Layer = Grams per Cultivar (Assuming equal ratio for now unless defined)
                                const layerGrams = prerollSize / stack.layers.length;

                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider">
                                            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px]">{idx + 1}</span>
                                            {layer.layerName}
                                            {layer.type === 'blend' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00FFD1]/10 text-[#00FFD1] ml-2">BLEND</span>}
                                        </div>

                                        {layer.cultivars.map((cultivar, cIdx) => {
                                            // Handle blended phases
                                            const cultivarGrams = (layerGrams * (cultivar.ratio || (1 / layer.cultivars.length))).toFixed(2);

                                            return (
                                                <div key={cIdx} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 ml-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: resolveCultivarVisuals(cultivar.name).primaryColor }} />
                                                        <span className="text-sm text-white font-medium">{cultivar.name}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-mono text-[#00FFD1]">{cultivarGrams}</span>
                                                        <span className="text-xs text-white/40 font-mono">g</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
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

            {/* Live Assistant Triggered Globally */}
        </div>
    );
}
