import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';

interface BlendDetailDrawerProps {
    blend: UIBlendRecommendation;
    isOpen: boolean;
    onClose: () => void;
}

export function BlendDetailDrawer({ blend, isOpen, onClose }: BlendDetailDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0a] rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-serif text-white mb-1">{blend.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-full border border-[#00FFD1]/20">
                                            Match {blend.matchScore}%
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                            Blend
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                            {/* Why This Blend */}
                            {blend.reasoning && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] mb-2">
                                        Why This Blend
                                    </h3>
                                    <p className="text-sm text-white/70 leading-relaxed">
                                        {blend.reasoning}
                                    </p>
                                </div>
                            )}

                            {/* Cultivar Breakdown */}
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                                    Cultivar Composition
                                </h3>
                                <div className="space-y-3">
                                    {blend.cultivars.map((cultivar, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="text-sm font-medium text-white mb-1">{cultivar.name}</div>
                                                    <div className="text-[10px] text-white/40 uppercase tracking-widest">{cultivar.profile}</div>
                                                </div>
                                                <div className="text-lg font-bold text-[#00FFD1]">{Math.round(cultivar.ratio * 100)}%</div>
                                            </div>

                                            {/* Terpenes */}
                                            {cultivar.prominentTerpenes && cultivar.prominentTerpenes.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {cultivar.prominentTerpenes.map(t => (
                                                        <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Characteristics */}
                                            {cultivar.characteristics && cultivar.characteristics.length > 0 && (
                                                <div className="mt-2 text-[10px] text-white/50">
                                                    {cultivar.characteristics.join(' • ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Effects Timeline */}
                            {blend.effects && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                                        Effects Timeline
                                    </h3>
                                    <div className="space-y-2 text-sm text-white/60">
                                        <div><span className="text-white/40">Onset:</span> {blend.effects.onset}</div>
                                        <div><span className="text-white/40">Peak:</span> {blend.effects.peak}</div>
                                        <div><span className="text-white/40">Duration:</span> {blend.effects.duration}</div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
