import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { getCultivarVisuals } from '../lib/cultivarData';
import { ChevronDown, Layers, Wind } from 'lucide-react';

interface SpatialStackProps {
    data: UIStackRecommendation;
    compact?: boolean;
}

// Phase-Specific Identity Colors (Only used when expanded)
const PHASE_THEMES = [
    { name: "Ignition", color: "#bef264", gradient: "from-lime-400/20 to-yellow-400/5" }, // Lime/Yellow
    { name: "Cruise", color: "#22d3ee", gradient: "from-cyan-400/20 to-blue-500/5" },   // Cyan/Blue
    { name: "Landing", color: "#a78bfa", gradient: "from-violet-400/20 to-slate-400/5" }  // Violet
];

export function SpatialStack({ data, compact = false }: SpatialStackProps) {
    if (!data) return null; // CRASH FIX: Return nothing if data is missing
    const layers = data.layers || [];
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
                    const theme = PHASE_THEMES[index % PHASE_THEMES.length];
                    const activeColor = isExpanded ? theme.color : '#ffffff';

                    return (
                        <motion.div
                            key={index}
                            onClick={() => handleTap(index)}
                            animate={{ scale: isExpanded ? 1.02 : 1 }}
                            className={`
                                relative w-full overflow-hidden rounded-xl border border-white/5 
                                ${isExpanded ? 'bg-white/10 p-4' : 'bg-white/5 p-3'}
                                transition-all duration-300 cursor-pointer
                            `}
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
                                        <div className="text-sm font-medium text-white">{isExpanded ? 'Detailed Breakdown' : 'Cultivar Mix'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-[#00FFD1]">{layer.cultivars.length} Strains</span>
                                </div>
                            </div>

                            {/* Rich Visual Bars (The "Visual Reward") */}
                            <div className="space-y-2 mt-2">
                                {layer.cultivars.map((cultivar, cIdx) => (
                                    <div key={cIdx} className="relative">
                                        {/* Label Row */}
                                        <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/70 mb-1">
                                            <span>{cultivar.name}</span>
                                            <span>{Math.round(cultivar.ratio * 100)}%</span>
                                        </div>
                                        {/* Bar Background */}
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            {/* Bar Fill */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cultivar.ratio * 100}%` }}
                                                transition={{ duration: 1, delay: cIdx * 0.1 }}
                                                className="h-full rounded-full shadow-[0_0_8px_currentColor]"
                                                style={{ backgroundColor: getCultivarVisuals(cultivar.name).color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
