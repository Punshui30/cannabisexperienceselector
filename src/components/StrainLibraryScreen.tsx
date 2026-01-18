import { CULTIVAR_MAP, getTerpeneColor } from '../lib/cultivarData';
import { motion } from 'motion/react';

export function StrainLibraryScreen({ onBack }: { onBack: () => void }) {
    const strains = Object.entries(CULTIVAR_MAP).sort((a, b) => a[0].localeCompare(b[0]));

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
                <span className="text-sm font-medium serif">Strain Library</span>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {strains.map(([name, data], idx) => (
                        <motion.div
                            key={name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative p-6 rounded-2xl bg-white/5 border border-white/5 overflow-hidden group hover:border-white/20 transition-all"
                        >
                            {/* Color Block Indicator */}
                            <div
                                className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"
                                style={{ backgroundColor: data.color }}
                            />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                                        style={{ backgroundColor: data.color, color: data.color }}
                                    />
                                    <h3 className="text-xl font-light serif text-white">{name}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Terpene Profile</div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.terpenes.map(t => (
                                            <div key={t} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: getTerpeneColor(t) }}
                                                />
                                                <span className="text-[10px] text-white/70">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
