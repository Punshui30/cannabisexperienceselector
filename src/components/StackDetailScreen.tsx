import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Share2, Layers } from 'lucide-react';
import { UIStackRecommendation } from '../types/domain';
import { cn } from '../lib/utils';
// import { UIPhase } - Removed, use derived type or inline params in map

interface StackDetailScreenProps {
    stack: UIStackRecommendation;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {

    return (
        <div className="w-full h-full flex flex-col items-center p-4 relative overflow-y-auto">
            {/* Background */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 w-full max-w-md flex justify-between items-center mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#00FFD1] hover:bg-[#00FFD1]/10 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                        <Clock size={12} />
                        <span>{stack.totalDuration}</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Title Block */}
            <div className="relative z-10 w-full max-w-md mb-8">
                <div className="flex items-center gap-2 mb-2 text-[#00FFD1] text-xs uppercase tracking-widest font-medium">
                    <Layers size={14} />
                    <span>Stacked Protocol</span>
                </div>

                <h1 className="text-4xl font-serif text-white mb-3 leading-tight">
                    {stack.name}
                </h1>
                <p className="text-white/60 leading-relaxed text-sm max-w-sm">
                    {stack.description}
                </p>
            </div>

            {/* Stack Timeline (Vertical Cards) */}
            <div className="relative z-10 w-full max-w-md space-y-4 pb-20">

                {stack.layers.map((layer, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-[#00FFD1]/30 transition-colors"
                    >
                        {/* Phase Badge */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                                Phase 0{index + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[#00FFD1] text-[10px] font-bold">
                                {layer.timing}
                            </span>
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-serif text-white mb-1 group-hover:text-[#00FFD1] transition-colors">
                            {layer.layerName}
                        </h3>
                        <p className="text-sm text-white/70 italic mb-4">
                            {layer.phaseIntent}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="block text-[10px] text-white/30 uppercase tracking-widest mb-1">Effect</span>
                                <span className="text-xs text-white/80">{layer.whyThisPhase}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-white/30 uppercase tracking-widest mb-1">Guidance</span>
                                <span className="text-xs text-white/80">{layer.consumptionGuidance}</span>
                            </div>
                        </div>

                        {/* Cultivars */}
                        <div className="bg-black/20 -mx-6 -mb-6 p-4 mt-2 border-t border-white/5">
                            <span className="block text-[9px] text-white/30 uppercase tracking-widest mb-2 pl-2">Required Inputs</span>
                            <div className="space-y-2">
                                {layer.cultivars.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between px-2 py-1 rounded hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1]" />
                                            <span className="text-xs text-white font-medium">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-white/40">{c.profile}</span>
                                            <span className="text-xs text-[#00FFD1] font-mono">{(c.ratio * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                ))}

            </div>

        </div>
    );
}
