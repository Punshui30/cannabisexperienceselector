import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Share2, Layers, ChevronDown, Info } from 'lucide-react';
import { UIStackRecommendation } from '../types/domain';
import { SpatialStack } from './SpatialStack';
import { resolveCultivarVisuals } from '../lib/visuals';
import { ExperienceSignature } from './ExperienceSignature';

interface StackDetailScreenProps {
    stack: UIStackRecommendation;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    const [isCalculating, setIsCalculating] = useState(false);
    const [prerollSize, setPrerollSize] = useState<number>(0.7); // Grams - Default to 0.7g (standard cone)
    const [showInstructions, setShowInstructions] = useState(false);
    const [isSigActive, setIsSigActive] = useState(false);

    if (!stack) return null;

    return (
        <div className="w-full h-full flex flex-col bg-black text-white relative overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">

            {/* HEADER */}
            <div className="w-full p-6 max-[360px]:p-4 flex justify-between items-center z-20">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#00FFD1] mb-1">StrainMath<span className="text-[9px] align-top opacity-60">™</span> Stack</h2>
                    <div className="h-0.5 w-8 bg-[#00FFD1]/30 mx-auto rounded-full" />
                </div>
                <div className="w-10 h-10" />
            </div>

            {/* Background - Pure Black */}
            <div className="absolute inset-0 bg-black pointer-events-none" />

            <div className="flex flex-col gap-6 h-full relative z-10 pb-32 px-4">

                {/* EXPERIENCE SIGNATURE - Centered Top */}
                <div className="flex justify-center py-4">
                    <ExperienceSignature
                        data={{
                            id: stack.stackId || stack.id,
                            name: stack.name,
                            matchScore: stack.matchScore,
                            confidence: stack.confidence || 0.9,
                            targetEffects: [], // Stacks might not have these directly, signature will infer
                            effects: stack.effects || { onset: '10m', peak: '45m', duration: stack.totalDuration }
                        }}
                        size={120}
                        active={isSigActive}
                        onClick={() => setIsSigActive(!isSigActive)}
                    />
                </div>

                {/* Stack Header Block */}
                <div className={`shrink-0 pt-4 text-center transition-all duration-500 ${isSigActive ? 'scale-[1.05] translate-y-2' : ''}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Layers size={14} className="text-[#00FFD1]" />
                        <span className="text-[#00FFD1] text-[10px] uppercase tracking-widest font-bold">Protocol</span>
                    </div>
                    <h1 className="text-3xl max-[360px]:text-2xl font-serif text-white mb-2 leading-tight">
                        {stack.name}
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto text-clamp-2-mobile">
                        {stack.description}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 mt-3">
                        <Clock size={10} />
                        <span>{stack.totalDuration} Protocol Duration</span>
                    </div>
                </div>

                {/* How Stacks Work */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-sm mx-auto"
                >
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setShowInstructions(!showInstructions)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Info size={14} className="text-white/40" />
                                <span className="text-sm font-medium text-white/80">How Stacks Work</span>
                            </div>
                            <ChevronDown
                                size={14}
                                className={`text-white/40 transition-transform ${showInstructions ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {showInstructions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 border-t border-white/5">
                                        <div className="space-y-3 text-left">
                                            <div className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-2 flex-shrink-0" />
                                                <p className="text-xs text-white/60 leading-relaxed">
                                                    Stacks are layered sequences designed for different phases of your experience, not single strains.
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-2 flex-shrink-0" />
                                                <p className="text-xs text-white/60 leading-relaxed">
                                                    Each layer supports a different time or phase. Consumption order matters for optimal results.
                                                </p>
                                            </div>
                                            {stack.layers && stack.layers.length > 1 && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-2 flex-shrink-0" />
                                                    <p className="text-xs text-white/60 leading-relaxed">
                                                        Use layers in sequence as described in the protocol for the complete experience.
                                                    </p>
                                                </div>
                                            )}
                                            {stack.layers && stack.layers.length === 1 && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-2 flex-shrink-0" />
                                                    <p className="text-xs text-white/60 leading-relaxed">
                                                        Single-layer stacks can be extended or customized with additional phases as needed.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* VISUALIZATION HERO - SpatialStack */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 flex items-center justify-center w-full max-w-md mx-auto py-8"
                >
                    <div className="relative w-full">
                        <div className="absolute inset-0 bg-[#00FFD1]/5 blur-[80px] rounded-full animate-pulse-slow" />
                        <SpatialStack data={stack} />
                    </div>
                </motion.div>

            </div>

            {/* CALCULATOR BUTTON - Floating Action Style */}
            <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
                <button
                    onClick={() => setIsCalculating(true)}
                    className="shadow-[0_0_20px_rgba(0,255,209,0.3)] bg-[#00FFD1] text-black font-bold uppercase tracking-widest text-[10px] px-6 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                    style={{
                        boxShadow: '0 8px 32px rgba(0, 255, 209, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <Layers size={20} />
                    <span>Calculate Recipe</span>
                </button>
            </div>

            {/* CALCULATOR MODAL */}
            {isCalculating && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-end sm:items-center justify-center p-4 sm:p-6" onClick={() => setIsCalculating(false)}>
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full max-w-sm bg-black border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        style={{ boxShadow: '0 -20px 50px -10px rgba(0,0,0,0.5)' }}
                    >
                        {/* The Hairline Border (Rest of card) */}
                        <div className="absolute inset-0 rounded-[inherit] border border-white/10 pointer-events-none z-10" />

                        {/* The Front-Edge Iridescent Light (Top Highlight) */}
                        <div
                            className="absolute top-0 left-[5%] right-[5%] h-[1px] opacity-100 z-20"
                            style={{
                                background: `linear-gradient(90deg, transparent 0%, #00FFD1 50%, transparent 100%)`,
                                boxShadow: `0 0 10px rgba(0, 255, 209, 0.4)`
                            }}
                        />

                        <div className="flex justify-between items-center mb-6 pt-2">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-serif text-white leading-tight">Stack Recipe</h3>
                                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Guided Outcomes™ Calculator</span>
                            </div>
                            <button onClick={() => setIsCalculating(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white">✕</button>
                        </div>

                        {/* Input Scroller - Stylized */}
                        <div className="mb-8">
                            <label className="block text-[10px] uppercase tracking-widest text-[#00FFD1] mb-3 font-bold">Select Pre-roll Size</label>
                            <div className="flex gap-2">
                                {[0.5, 0.7, 1.0, 1.5].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setPrerollSize(size)}
                                        className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden ${prerollSize === size
                                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {size === 0.7 ? '0.7g' : `${size}g`}
                                        {size === 0.7 && !(prerollSize === size) && <div className="absolute top-0 right-0 p-1"><div className="w-1 h-1 rounded-full bg-[#00FFD1]" /></div>}
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
                                                <motion.div
                                                    key={cIdx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 + cIdx * 0.05 }}
                                                    className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 ml-2 relative overflow-hidden group"
                                                >
                                                    {/* Iridescent hairline rest-of-way hint */}
                                                    <div
                                                        className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity"
                                                        style={{ boxShadow: `inset 0 0 10px ${resolveCultivarVisuals(cultivar.name).primaryColor}20` }}
                                                    />
                                                    <div className="flex items-center gap-2 relative z-10">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: resolveCultivarVisuals(cultivar.name).primaryColor }} />
                                                        <span className="text-sm text-white font-medium">{cultivar.name}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1 relative z-10">
                                                        <span className="text-lg font-mono text-[#00FFD1]">{cultivarGrams}</span>
                                                        <span className="text-xs text-white/40 font-mono">g</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-[10px] text-white/30 italic">Grind layers separately. Pack sequentially.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
