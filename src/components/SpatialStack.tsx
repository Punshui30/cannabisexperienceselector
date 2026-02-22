import { motion } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { resolveCultivarVisuals, resolvePhaseVisuals } from '../lib/visuals';
import { normalizeStackWeights } from '../lib/normalizeStackWeights';

const MotionDiv = motion.div as any;

interface SpatialStackProps {
    data: UIStackRecommendation;
    compact?: boolean;
    active?: boolean;
    onOpenCultivars?: () => void;
}

export function SpatialStack({ data, compact = false, active = false, onOpenCultivars }: SpatialStackProps) {
    if (!data) return null;
    const layers = data.layers || [];

    // PRE-CALCULATE NORMALIZED PERCENTAGES FOR ENTIRE STACK
    const allCultivars = layers.flatMap(l => l.cultivars.map(c => ({ ...c, layerId: l.layerName })));
    const normalizedCompo = normalizeStackWeights(allCultivars as any);

    return (
        <div className={`w-full flex flex-col items-center ${compact ? 'py-2' : 'py-6'} gap-5`}>
            {/* List items */}
            <div className="w-full max-w-md flex flex-col gap-4 pl-1 pr-1 group/stack">
                {layers.map((layer, index) => {
                    // Get normalized items for this specific layer
                    const layerNormalized = normalizedCompo.filter(nc => (nc.original as any).layerId === layer.layerName);

                    return (
                        <MotionDiv
                            key={index}
                            onClick={() => !compact && onOpenCultivars?.()}
                            className={`
                                relative w-full overflow-hidden rounded-xl border border-white/5 
                                bg-white/5 p-3
                                transition-all duration-300 ${!compact ? 'cursor-pointer' : ''}
                            `}
                            whileHover={!compact ? {
                                scale: 1.01,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderColor: 'rgba(0, 255, 209, 0.2)'
                            } : {}}
                            animate={{
                                borderColor: active ? 'rgba(0, 255, 209, 0.4)' : 'rgba(255,255,255,0.05)'
                            }}
                        >
                            {/* Drawer Handle Trigger (Only for non-compact) */}
                            {!compact && onOpenCultivars && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCultivars();
                                    }}
                                    className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-16 w-6 flex items-center justify-center group/handle transition-all z-30"
                                    aria-label="View cultivars"
                                >
                                    <div className="h-6 w-[2px] bg-[#00FFD1]/40 group-hover/handle:bg-[#00FFD1] group-hover/handle:h-10 group-hover/handle:w-[3px] rounded-full transition-all shadow-[0_0_8px_#00FFD140]" />
                                </button>
                            )}

                            {/* Header Row */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <MotionDiv
                                        className="w-2 h-8 rounded-full"
                                        animate={{
                                            backgroundColor: active ? '#00FFD1' : '#ffffff',
                                            boxShadow: active ? '0 0 12px rgba(0, 255, 209, 0.6)' : '0 0 0px rgba(255, 255, 255, 0)'
                                        }}
                                        whileHover={{
                                            backgroundColor: '#00FFD1',
                                            boxShadow: '0 0 15px rgba(0, 255, 209, 0.8)'
                                        }}
                                    />
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-white/50">{layer.layerName}</div>
                                        <div className="text-sm font-medium text-white">{layer.phaseIntent || layer.purpose || 'Cultivar Mix'}</div>
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
                                                    animate={{ width: `${item.percent}%` }}
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
                        </MotionDiv>
                    );
                })}
            </div>
        </div>
    );
}
