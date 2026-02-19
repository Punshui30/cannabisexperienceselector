import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { resolveCultivarVisuals, resolvePhaseVisuals } from '../lib/visuals';
import { ChevronDown, Layers, Wind } from 'lucide-react';
import { MusicVibeButton } from './MusicVibeButton';
import { INVENTORY } from '../lib/inventory';
import { normalizeStackWeights } from '../lib/normalizeStackWeights';

const MotionDiv = motion.div as any;

interface SpatialStackProps {
    data: UIStackRecommendation;
    compact?: boolean;
}

export function SpatialStack({ data, compact = false }: SpatialStackProps) {
    if (!data) return null; // CRASH FIX: Return nothing if data is missing
    const layers = data.layers || [];
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // PRE-CALCULATE NORMALIZED PERCENTAGES FOR ENTIRE STACK
    const allCultivars = layers.flatMap(l => l.cultivars.map(c => ({ ...c, layerId: l.layerName })));
    const normalizedCompo = normalizeStackWeights(allCultivars as any);

    const handleTap = (index: number) => {
        if (compact) return;
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className={`w-full flex flex-col items-center ${compact ? 'py-2' : 'py-6'} gap-5`}>
            {/* List items */}
            <div className="w-full max-w-md flex flex-col gap-4 pl-1 pr-1">
                {layers.map((layer, index) => {
                    const isExpanded = expandedIndex === index;

                    // Determine Theme
                    const phaseVisuals = resolvePhaseVisuals(index);
                    const activeColor = isExpanded ? phaseVisuals.color : '#ffffff';

                    // Get normalized items for this specific layer
                    const layerNormalized = normalizedCompo.filter(nc => (nc.original as any).layerId === layer.layerName);

                    return (
                        <MotionDiv
                            key={index}
                            onClick={() => handleTap(index)}
                            className={`
                                relative w-full overflow-hidden rounded-xl border border-white/5 
                                ${isExpanded ? 'bg-white/10 p-4' : 'bg-white/5 p-3'}
                                transition-all duration-300 cursor-pointer
                            `}
                            initial={{ borderColor: 'rgba(255,255,255,0.05)' }}
                            animate={{
                                scale: isExpanded ? 1.02 : 1,
                                borderColor: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']
                            }}
                            transition={{
                                scale: { duration: 0.3 },
                                borderColor: { duration: 0.6, delay: 0.5 + index * 0.15, times: [0, 0.5, 1] }
                            }}
                        >
                            {/* Header Row */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-8 rounded-full shadow-[0_0_10px_currentColor]"
                                        style={{ backgroundColor: activeColor }}
                                    />
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-white/50">{layer.layerName}</div>
                                        <div className="text-sm font-medium text-white">{isExpanded ? 'Detailed Breakdown' : (layer.phaseIntent || layer.purpose || 'Cultivar Mix')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-[#00FFD1]">{layer.cultivars.map(c => c.name).join(' + ')}</span>
                                </div>
                            </div>

                            {/* Rich Visual Bars (The "Visual Reward") */}
                            <div className="space-y-2 mt-2">
                                {layerNormalized.map((item, cIdx) => {
                                    const cultivar = item.original as any;
                                    const visuals = resolveCultivarVisuals(cultivar.name, cultivar.profile);
                                    return (
                                        <div key={cIdx} className="relative">
                                            {/* Label Row */}
                                            <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/70 mb-1 px-1">
                                                <span className="line-clamp-1 max-w-[80%]">{cultivar.name}</span>
                                                <span>{item.percent}%</span>
                                            </div>
                                            {/* Bar Background */}
                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                {/* Bar Fill */}
                                                <MotionDiv
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.percent}% ` }}
                                                    transition={{ duration: 1, delay: cIdx * 0.1 }}
                                                    className="h-full rounded-full"
                                                    style={{
                                                        backgroundColor: visuals.primaryColor,
                                                        boxShadow: visuals.glowStyle
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <MotionDiv
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-4 mt-4 border-t border-white/10 text-xs text-white/60 leading-relaxed overflow-hidden"
                                    >
                                        <p>{layer.whyThisPhase}</p>
                                        <div className="mt-2 flex gap-4">
                                            <div>
                                                <span className="text-white/30 block text-[9px] uppercase">Onset</span>
                                                <span className="text-white">{layer.onsetEstimate}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/30 block text-[9px] uppercase">Duration</span>
                                                <span className="text-white">{layer.durationEstimate}</span>
                                            </div>
                                        </div>

                                        {/* AI Vibe Music for this layer */}
                                        <MusicVibeButton
                                            className="mt-4"
                                            terpenes={layer.cultivars.flatMap(cultivar => {
                                                const c = INVENTORY.cultivars.find(cv => cv.name === cultivar.name);
                                                if (!c?.terpenes) return [];
                                                return Object.entries(c.terpenes).map(([name, pct]) => ({
                                                    name,
                                                    percent: (pct as number) * cultivar.ratio
                                                }));
                                            })}
                                        />
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </MotionDiv>
                    );
                })}
            </div>
        </div>
    );
}
