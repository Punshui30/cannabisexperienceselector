import { useState } from 'react';
import { resolveCultivarVisuals, resolveTerpeneVisuals } from '../lib/visuals';
import { INVENTORY } from '../lib/inventory';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Droplet, X } from 'lucide-react';

export function StrainLibraryScreen({ onBack }: { onBack: () => void }) {
    // SOURCE OF TRUTH: Iterate over the real Inventory/JSON data
    const strains = INVENTORY.cultivars.sort((a, b) => a.name.localeCompare(b.name));

    // State
    const [selectedName, setSelectedName] = useState<string | null>(null);

    // Helpers
    const getChemotype = (name: string) => {
        return INVENTORY.cultivars.find(c => c.name.toLowerCase() === name.toLowerCase());
    };

    const selectedChemotype = selectedName ? getChemotype(selectedName) : null;
    const selectedVisuals = selectedName && selectedChemotype
        ? resolveCultivarVisuals(selectedName, selectedChemotype.type || 'hybrid', { isActive: true })
        : null;

    return (
        <div className="fixed inset-0 flex flex-col bg-black text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6 flex items-center justify-between z-20 bg-black/80 backdrop-blur-md border-b border-white/5">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/40 group-hover:text-[#00FFD1] transition-colors">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Back</span>
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium serif">Strain Library</span>
                    <span className="text-[10px] text-white/40">Real Inventory: {strains.length} Strains</span>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {strains.map((strain, idx) => {
                        const isSelected = selectedName === strain.name;
                        const visuals = resolveCultivarVisuals(strain.name, strain.type || 'hybrid', {
                            isActive: isSelected,
                            isHovered: false // We rely on CSS hover state typically, but we can pass it if we track hover
                        });

                        // Convert dict to array for terpenes if needed or use from record
                        const topTerpenes = strain.terpenes ? Object.entries(strain.terpenes)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .slice(0, 3)
                            .map(([k]) => k) : [];

                        return (
                            <motion.div
                                key={strain.id}
                                onClick={() => setSelectedName(strain.name)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`
                                    relative p-6 rounded-2xl bg-white/5 overflow-hidden group hover:bg-white/10 transition-all cursor-pointer
                                `}
                                style={{
                                    border: visuals.borderStyle,
                                    boxShadow: visuals.glowStyle
                                }}
                            >
                                {/* Color Block Indicator */}
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"
                                    style={{ backgroundColor: visuals.primaryColor }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                                            style={{ backgroundColor: visuals.primaryColor, color: visuals.primaryColor }}
                                        />
                                        <h3 className="text-xl font-light serif text-white group-hover:text-[#00FFD1] transition-colors">{strain.name}</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Terpene Profile</div>
                                        <div className="flex flex-wrap gap-2">
                                            {topTerpenes.map(t => {
                                                const terpInfo = resolveTerpeneVisuals(t);
                                                return (
                                                    <div
                                                        key={t}
                                                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5"
                                                    >
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: terpInfo.color }}
                                                        />
                                                        <span className="text-[10px] text-white/70">{t}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedName && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedName(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={selectedName}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50"
                            style={{
                                borderColor: selectedVisuals?.primaryColor + '40'
                            }}
                        >
                            {/* Modal Header */}
                            <div className="relative h-32 bg-gradient-to-b from-white/10 to-transparent p-6 flex flex-col justify-end">
                                <div
                                    className="absolute inset-0 opacity-30 blur-[80px]"
                                    style={{ backgroundColor: selectedVisuals?.primaryColor }}
                                />
                                <button
                                    onClick={() => setSelectedName(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white/50 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                                <h2 className="text-3xl font-serif text-white relative z-10">{selectedName}</h2>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {selectedChemotype ? (
                                    <>
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4">
                                                <div className="p-2 bg-[#00FFD1]/10 rounded-lg text-[#00FFD1]">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase text-white/40">THC Content</div>
                                                    <div className="text-xl font-bold text-white">{selectedChemotype.thcPercent}%</div>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase text-white/40">CBD Content</div>
                                                    <div className="text-xl font-bold text-white">{selectedChemotype.cbdPercent}%</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Terpene Breakdown */}
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Droplet size={16} className="text-[#FFD700]" />
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFD700]">Detailed Terpene Analysis</h4>
                                            </div>

                                            <div className="space-y-3">
                                                {selectedChemotype.terpenes && Object.entries(selectedChemotype.terpenes)
                                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                                    .map(([name, val]) => {
                                                        const tVis = resolveTerpeneVisuals(name);
                                                        return (
                                                            <div key={name} className="space-y-1">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="capitalize text-white/80">{name}</span>
                                                                    <span className="font-mono text-white/50">{val}%</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${(val as number) * 50}%` }}
                                                                        className="h-full rounded-full"
                                                                        style={{ backgroundColor: tVis.color }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-10 text-center text-white/30 italic">
                                        Quantitative data record not linked.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
