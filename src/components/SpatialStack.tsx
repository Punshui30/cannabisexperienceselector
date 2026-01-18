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
                    // If we have a matching theme by index, use it, otherwise fallback
                    const theme = PHASE_THEMES[index % PHASE_THEMES.length];
                    const activeColor = isExpanded ? theme.color : '#ffffff';

                    return (
                        <motion.button
                            key={index}
                            onClick={() => handleTap(index)}
                            // Animation: Ceremonial Scale & Lift
                            animate={{
                                scale: isExpanded ? 1.04 : 1.0,
                                y: isExpanded ? -8 : 0,
                                zIndex: isExpanded ? 20 : 0
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`
                                relative w-full text-left outline-none mb-1
                                ${isExpanded ? 'z-20' : 'z-0'}
                            `}
                        >
                            {/* The Card/Slab */}
                            <div
                                className={`
                                    relative overflow-hidden rounded-2xl border backdrop-blur-xl
                                    transition-colors duration-700 ease-out
                                `}
                                style={{
                                    backgroundColor: isExpanded ? '#0a0a0a' : 'rgba(255,255,255,0.03)',
                                    borderColor: isExpanded ? `${theme.color}60` : 'rgba(255,255,255,0.08)',
                                    // Amplified Glow in Expanded State
                                    boxShadow: isExpanded
                                        ? `0 20px 50px -10px ${theme.color}15, 0 0 15px ${theme.color}30`
                                        : '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}
                            >
                                {/* Active Gradient Background Sweep */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} transition-opacity duration-1000 ${isExpanded ? 'opacity-100' : 'opacity-0'}`} />

                                {/* --- ALWAYS VISIBLE: HEADER --- */}
                                <div className="p-5 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        {/* Phase Number - Activates with Color */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500"
                                            style={{
                                                backgroundColor: isExpanded ? theme.color : 'rgba(255,255,255,0.1)',
                                                color: isExpanded ? '#000' : 'rgba(255,255,255,0.5)'
                                            }}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Text Info */}
                                        <div>
                                            <h4
                                                className="text-lg font-serif leading-tight transition-colors duration-300"
                                                style={{ color: isExpanded ? '#fff' : 'rgba(255,255,255,0.8)' }}
                                            >
                                                {layer.layerName}
                                            </h4>
                                            {!isExpanded && (
                                                <p className="text-xs text-white/40 mt-1 max-w-[220px] truncate font-medium tracking-wide">
                                                    {layer.cultivars.map(c => c.name).join(' + ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Icon - Rotates */}
                                    {!compact && (
                                        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={18} style={{ color: isExpanded ? theme.color : 'rgba(255,255,255,0.3)' }} />
                                        </div>
                                    )}
                                </div>

                                {/* --- EXPANDED DETAILS --- */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // "Premium Easing" (Quint/Expo-ish)
                                            className="relative z-10 overflow-hidden"
                                        >
                                            <div className="px-6 pb-8 pt-0 space-y-6">
                                                {/* Divider */}
                                                <div className="w-full h-px bg-white/10 mb-5" />

                                                {/* Cultivar Breakdown */}
                                                <div className="space-y-4">
                                                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                                        <Layers size={10} /> Active Components
                                                    </div>

                                                    {layer.cultivars.map((c, i) => {
                                                        const cVis = getCultivarVisuals(c.name);
                                                        const ratio = c.ratio || (1 / layer.cultivars.length);

                                                        return (
                                                            <div key={i} className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: cVis.color || '#fff', color: cVis.color || '#fff' }} />
                                                                        <span className="text-[15px] font-medium text-white">{c.name}</span>
                                                                    </div>
                                                                    <span
                                                                        className="text-xs font-mono font-bold"
                                                                        style={{ color: theme.color }}
                                                                    >
                                                                        {Math.round(ratio * 100)}%
                                                                    </span>
                                                                </div>

                                                                {/* Progress Bar with Theme Color */}
                                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${ratio * 100}%` }}
                                                                        transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
                                                                        className="h-full rounded-full"
                                                                        style={{ backgroundColor: cVis.color || '#fff' }}
                                                                    />
                                                                </div>

                                                                {/* Chips */}
                                                                {c.profile && (
                                                                    <div className="mt-3 flex gap-2">
                                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5 uppercase tracking-wider">
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
                                                    <div className="space-y-3 pt-2">
                                                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                                            <Wind size={10} /> Experience
                                                        </div>
                                                        <p className="text-sm text-white/80 leading-relaxed font-serif italic pl-4 border-l-2" style={{ borderColor: theme.color }}>
                                                            "{(layer as any).phaseIntent || (layer as any).description}"
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* High-End Accent Border on Left (Active Only) */}
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="absolute left-0 top-0 w-1.5"
                                        style={{ backgroundColor: theme.color }}
                                    />
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Helper Text (Fades out when active) */}
            <AnimatePresence>
                {expandedIndex === null && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] uppercase tracking-widest text-white/30 mt-2 animate-pulse"
                    >
                        Tap a phase to focus
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
