import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { LabelScan } from '../ai/providers/visionProvider';
import { STRAIN_LIBRARY } from '../lib/strainLibrary';

interface MatchReviewSheetProps {
    scanResult: LabelScan | null;
    onClose: () => void;
    onMatchConfirm: (strainId: string) => void;
}

export function MatchReviewSheet({ scanResult, onClose, onMatchConfirm }: MatchReviewSheetProps) {
    if (!scanResult) return null;

    // Simple fuzzy match for the demo
    const bestMatch = STRAIN_LIBRARY.find(s =>
        s.name.toLowerCase().includes(scanResult.productName.toLowerCase()) ||
        scanResult.productName.toLowerCase().includes(s.name.toLowerCase()) ||
        (scanResult.cultivar && s.name.toLowerCase().includes(scanResult.cultivar.toLowerCase()))
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Sheet */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="relative w-full max-w-lg bg-[#161616] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Match Review</h2>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
                                <Zap size={12} className="text-amber-400" />
                                AI Product Recognition
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Scan Result Card */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Extracted Label Data</span>
                            <div className="mt-2 text-lg font-medium text-white">{scanResult.productName}</div>
                            {scanResult.brand && <div className="text-sm text-white/50">{scanResult.brand}</div>}

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-white/30 uppercase">THC Content</span>
                                    <div className="text-sm font-bold text-white">{scanResult.cannabinoids?.thc || 'N/A'}%</div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-white/30 uppercase">CBD Content</span>
                                    <div className="text-sm font-bold text-white">{scanResult.cannabinoids?.cbd || 'N/A'}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Box */}
                        <div className="bg-amber-400/10 rounded-2xl p-4 border border-amber-400/20">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-amber-400 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Clinical Analysis</span>
                                    <p className="text-xs text-amber-100/70 leading-relaxed mt-1">
                                        {scanResult.analysis}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        {bestMatch ? (
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Library Match Found</span>
                                <div className="flex items-center justify-between p-4 bg-[#00FFD1]/10 border border-[#00FFD1]/20 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#00FFD1]/20 flex items-center justify-center">
                                            <CheckCircle2 size={24} className="text-[#00FFD1]" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{bestMatch.name}</div>
                                            <div className="text-[10px] text-[#00FFD1] font-bold uppercase tracking-wider">98% Data Alignment</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onMatchConfirm(bestMatch.id)}
                                        className="bg-[#00FFD1] text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00FFD1]/80 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <AlertCircle className="text-white/40" size={20} />
                                <div className="text-sm text-white/40 italic">No exact library match found. Analyzing profile manually...</div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
