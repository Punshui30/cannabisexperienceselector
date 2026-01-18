import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { getCultivarVisuals } from '../lib/cultivarData';
import { ChevronDown, ChevronUp, Layers, Wind, Clock } from 'lucide-react';

interface SpatialStackProps {
    data: UIStackRecommendation;
    compact?: boolean;
}

export function SpatialStack({ data, compact = false }: SpatialStackProps) {
    const layers = data.layers || [];
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const handleTap = (index: number) => {
        if (compact) return; // Disable interaction in compact mode (cards)
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className={`w-full flex flex-col items-center ${compact ? 'py-2' : 'py-4'} gap-4`}>
            {/* 3D Stack Container / List items */}
            <div className="w-full max-w-md flex flex-col gap-3">
                {layers.map((layer, index) => {
                    const isExpanded = expandedIndex === index;

                    // Visuals
                    const mainCultivar = layer.cultivars?.[0];
                    const visuals = mainCultivar ? getCultivarVisuals(mainCultivar.name) : { color: '#ffffff' };
                    const color = visuals.color || '#ffffff';

                    return (
                        <motion.button
                            key={index}
                            onClick={() => handleTap(index)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative w-full text-left outline-none
                                transition-all duration-500 ease-out
                                ${isExpanded ? 'scale-[1.02] z-20 my-2' : 'scale-100 z-10 hover:bg-white/5'}
                            `}
                        >
                            {/* The Card/Slab */}
                            <div
                                className={`
                                    relative overflow-hidden rounded-xl border backdrop-blur-md
                                    transition-all duration-300
                                `}
                                style={{
                                    backgroundColor: isExpanded ? `${color}10` : 'rgba(255,255,255,0.03)',
                                    borderColor: isExpanded ? `${color}40` : 'rgba(255,255,255,0.08)',
                                    boxShadow: isExpanded ? `0 10px 40px -10px ${color}20` : 'none'
                                }}
                            >
                                {/* --- ALWAYS VISIBLE: HEADER (Compact State) --- */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Phase Number/Indicator */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{
                                                backgroundColor: isExpanded ? color : 'rgba(255,255,255,0.1)',
                                                color: isExpanded ? '#000' : 'rgba(255,255,255,0.5)'
                                            }}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Text Info */}
                                        <div>
                                            <h4 className={`text-base font-serif leading-tight ${isExpanded ? 'text-white' : 'text-white/80'}`}>
                                                {layer.layerName}
                                            </h4>
                                            {!isExpanded && (
                                                <p className="text-xs text-white/40 mt-0.5 max-w-[200px] truncate">
                                                    {layer.cultivars.map(c => c.name).join(' + ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Icon */}
                                    {!compact && (
                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={16} className="text-white/30" />
                                        </div>
                                    )}
                                </div>

                                {/* --- EXPANDED DETAILS (Tap-to-Focus) --- */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-6 pt-0 space-y-6">
                                                {/* Divider */}
                                                <div className="w-full h-px bg-white/5 mb-4" />

                                                {/* Cultivar Breakdown */}
                                                <div className="space-y-3">
                                                    <div className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                                                        <Layers size={10} /> Composition
                                                    </div>

                                                    {layer.cultivars.map((c, i) => {
                                                        const cVis = getCultivarVisuals(c.name);
                                                        const ratio = c.ratio || (1 / layer.cultivars.length);

                                                        return (
                                                            <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cVis.color || '#fff' }} />
                                                                        <span className="text-sm font-medium text-white">{c.name}</span>
                                                                    </div>
                                                                    <span className="text-xs font-mono text-[#00FFD1]">{Math.round(ratio * 100)}%</span>
                                                                </div>

                                                                {/* Progress Bar */}
                                                                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${ratio * 100}%` }}
                                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                                        className="h-full rounded-full"
                                                                        style={{ backgroundColor: cVis.color || '#fff' }}
                                                                    />
                                                                </div>

                                                                {/* Terpene/Profile tags if available */}
                                                                {c.profile && (
                                                                    <div className="mt-2 flex gap-1.5 flex-wrap">
                                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
                                                                            {c.profile}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Intent / Description */}
                                                {((layer as any).description || (layer as any).phaseIntent) && (
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                                                            <Wind size={10} /> Intent
                                                        </div>
                                                        <p className="text-sm text-white/70 leading-relaxed italic">
                                                            "{(layer as any).phaseIntent || (layer as any).description}"
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Side Accent */}
                                {isExpanded && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
            {/* Total Duration Footnote */}
            {!compact && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2">
                        Total Protocol: {data.totalDuration}
                    </span>
                </div>
            )}
        </div>
    );
}
