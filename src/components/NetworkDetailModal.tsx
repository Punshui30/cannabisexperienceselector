import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Info } from 'lucide-react';
import { COLORS } from '../lib/colors';

interface NetworkDetailModalProps {
    event: {
        id: string;
        blendName: string;
        outcomeCategory: string;
        componentSkus: string[];
        inputMode: string;
    };
    onClose: () => void;
}

export function NetworkDetailModal({ event, onClose }: NetworkDetailModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-[#00FFD1]/20 to-teal-500/10 flex items-center justify-center">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                        >
                            <X size={16} className="text-white/70" />
                        </button>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/30 flex items-center justify-center">
                        <Activity size={24} className="text-[#00FFD1]" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <span className="text-[10px] text-[#00FFD1] uppercase tracking-[0.2em] font-semibold mb-1 block">
                            {event.outcomeCategory}
                        </span>
                        <h2 className="text-2xl font-light text-white mb-2">{event.blendName}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] text-white/40 border border-white/5 uppercase tracking-wider">
                                {event.inputMode} Input
                            </span>
                        </div>
                    </div>

                    {/* Composition */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={12} className="text-white/30" />
                            <span className="text-[11px] text-white/50 uppercase tracking-widest font-medium">Composition</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {event.componentSkus.map((sku, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-xs text-white/80">{sku}</span>
                                    <span className="text-[10px] text-white/20">Verified COA</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Narrative */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-xs leading-relaxed text-white/60 font-light italic">
                            &ldquo;This {event.blendName.toLowerCase()} configuration was generated to target {event.outcomeCategory.toLowerCase()} while maintaining a clean terpene profile. The synergy between {event.componentSkus[0]} and {event.componentSkus[1]} provides a stable, repeatable experience.&rdquo;
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
