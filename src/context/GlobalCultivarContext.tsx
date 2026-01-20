import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, Droplet } from 'lucide-react';
import { INVENTORY } from '../lib/inventory';
import { resolveCultivarVisuals, resolveTerpeneVisuals } from '../lib/visuals';

interface CultivarContextType {
    selectedCultivarName: string | null;
    openCultivar: (name: string) => void;
    closeCultivar: () => void;
}

const GlobalCultivarContext = createContext<CultivarContextType | undefined>(undefined);

export function useGlobalCultivar() {
    const context = useContext(GlobalCultivarContext);
    if (!context) {
        throw new Error('useGlobalCultivar must be used within GlobalCultivarProvider');
    }
    return context;
}

interface GlobalCultivarProviderProps {
    children: ReactNode;
}

export function GlobalCultivarProvider({ children }: GlobalCultivarProviderProps) {
    const [selectedCultivarName, setSelectedCultivarName] = useState<string | null>(null);

    const openCultivar = (name: string) => {
        setSelectedCultivarName(name);
    };

    const closeCultivar = () => {
        setSelectedCultivarName(null);
    };

    // Get chemotype data for selected cultivar
    const selectedChemotype = selectedCultivarName
        ? INVENTORY.cultivars.find(c => c.name.toLowerCase() === selectedCultivarName.toLowerCase())
        : null;

    const selectedVisuals = selectedCultivarName && selectedChemotype
        ? resolveCultivarVisuals(selectedCultivarName, selectedChemotype.type || 'hybrid', { isActive: true })
        : null;

    return (
        <GlobalCultivarContext.Provider value={{ selectedCultivarName, openCultivar, closeCultivar }}>
            {children}

            {/* GLOBAL COA MODAL */}
            <AnimatePresence>
                {selectedCultivarName && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCultivar}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
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
                                    onClick={closeCultivar}
                                    className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white/50 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                                <h2 className="text-3xl font-serif text-white relative z-10">{selectedCultivarName}</h2>
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
                                                        const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                                                        const tVis = resolveTerpeneVisuals(normalizedName);
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
        </GlobalCultivarContext.Provider>
    );
}
