
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Activity, Droplet } from 'lucide-react';
import { STRAIN_LIBRARY, type Strain } from '../lib/strainLibrary';
import { INVENTORY } from '../lib/inventory';

export function StrainLibrary() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="w-full space-y-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
                    Strain Library
                </h3>
                <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded-full">
                    {STRAIN_LIBRARY.length} Vetted Inputs
                </span>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 w-[calc(100%+2rem)]">
                {STRAIN_LIBRARY.map((strain) => {
                    const inventoryItem = INVENTORY.cultivars.find(c => c.id === strain.id);
                    const isExpanded = expandedId === strain.id;

                    return (
                        <motion.div
                            key={strain.id}
                            layout
                            initial={{ opacity: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1.01 }}
                            onClick={(e) => {
                                toggleExpand(strain.id);
                                setTimeout(() => {
                                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                }, 300);
                            }}
                            className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group flex-shrink-0 snap-center ${isExpanded
                                ? 'bg-white/10 border-white/20 shadow-xl z-10 w-[280px]'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 w-[260px]'
                                }`}
                        >
                            {/* Collapsed State (Always Visible Header) */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-medium text-white group-hover:text-[#00FFD1] transition-colors font-sans truncate">
                                            {strain.name}
                                        </span>
                                        {/* Type Badge */}
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${strain.cultivarType === 'sativa' ? 'text-amber-400 border-amber-400/30' :
                                            strain.cultivarType === 'indica' ? 'text-purple-400 border-purple-400/30' :
                                                'text-emerald-400 border-emerald-400/30'
                                            }`}>
                                            {strain.cultivarType}
                                        </span>
                                    </div>
                                    {/* Vibe Tags Row */}
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {strain.vibeTags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] text-white/40">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-white/20">
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4 border-t border-white/5"
                                    >
                                        {inventoryItem ? (
                                            <div className="pt-4 space-y-4">
                                                {/* Cannabinoids */}
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                                                        <Activity size={14} className="text-[#00FFD1]" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-white/40 uppercase">THC</span>
                                                            <span className="text-xs font-bold text-white">{inventoryItem.thcPercent}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                                                        <Activity size={14} className="text-white/40" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-white/40 uppercase">CBD</span>
                                                            <span className="text-xs font-bold text-white">{inventoryItem.cbdPercent}%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Terpenes */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Droplet size={12} className="text-[#BF5AF2]" />
                                                        <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Terpene Profile</span>
                                                    </div>
                                                    {inventoryItem.terpenes && Object.entries(inventoryItem.terpenes)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 5) // Limit to top 5 to keep height somewhat constrained
                                                        .map(([name, val], idx) => (
                                                            <div key={name} className="flex items-center justify-between">
                                                                <span className="text-xs text-white/70 capitalize">{name}</span>
                                                                <div className="flex items-center gap-2 w-32">
                                                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${val * 50}%` }} // Scale factor for visuals
                                                                            className="h-full bg-[#BF5AF2]"
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] text-white/40 tabular-nums w-8 text-right">{val}%</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-4 pb-2 text-center">
                                                <span className="text-xs text-white/30 italic">Chemotype data not available</span>
                                            </div>
                                        )}
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
