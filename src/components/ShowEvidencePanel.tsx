import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Fingerprint, ShieldCheck, Zap, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { DecisionReceipt } from '../types/domain';
import { PerplexityEvidenceProvider } from '../ai/providers/evidenceProvider';
import { EvidenceCard } from '../lib/memory/libraryMemory';
import { isMerchantMode } from '../ai/config';
import { SpeakButton } from './SpeakButton';

const MotionDiv = motion.div as any;

interface ShowEvidencePanelProps {
    receipt: DecisionReceipt;
    onClose: () => void;
}

export function ShowEvidencePanel({ receipt, onClose }: ShowEvidencePanelProps) {
    const [evidence, setEvidence] = useState<Record<string, EvidenceCard>>({});
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

    // Merchant Gate: Block access
    if (isMerchantMode()) {
        return (
            <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <ShieldCheck size={48} className="text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Access Forbidden</h2>
                    <p className="text-white/40 text-sm max-w-xs mx-auto italic">Evidence grounding is disabled in Merchant Mode for data security.</p>
                    <button onClick={onClose} className="text-[#00FFD1] text-xs font-bold uppercase tracking-widest border border-[#00FFD1]/20 px-6 py-2 rounded-full">Close</button>
                </div>
            </div>
        );
    }

    const fetchEvidence = async (claimKey: string, query: string) => {
        setLoadingKeys(prev => new Set(prev).add(claimKey));
        try {
            const card = await PerplexityEvidenceProvider.getEvidenceForClaim(claimKey, query);
            setEvidence(prev => ({ ...prev, [claimKey]: card }));
        } catch (error) {
            console.error("Failed to fetch evidence:", error);
        } finally {
            setLoadingKeys(prev => {
                const updated = new Set(prev);
                updated.delete(claimKey);
                return updated;
            });
        }
    };

    return (
        <MotionDiv
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0D0D0D] z-[110] shadow-2xl border-l border-white/10 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-serif text-white flex items-center gap-2">
                            <BookOpen size={20} className="text-[#BF5AF2]" />
                            Clinical Evidence
                        </h2>
                        <SpeakButton
                            text={receipt.intentSummary}
                            summaryMode={true}
                        />
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Engine Determinism & Grounding</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* DECISION RECEIPT SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#00FFD1] uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint size={12} />
                            Engine Decision Receipt
                        </span>
                        <span className="text-[9px] text-white/20 tabular-nums">v{receipt.engineVersion}</span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-6">
                        {/* Summary */}
                        <p className="text-sm text-white/70 leading-relaxed italic">
                            "{receipt.intentSummary}"
                        </p>

                        {/* Drivers */}
                        <div className="space-y-3">
                            <span className="text-[9px] font-bold text-white/30 uppercase">Primary Drivers</span>
                            {receipt.topDrivers.map((driver, idx) => (
                                <div key={idx} className="group space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/80 font-medium">{driver.note}</span>
                                        <button
                                            onClick={() => fetchEvidence(driver.claimKey, driver.note)}
                                            className="text-[#00FFD1]/60 hover:text-[#00FFD1] transition-colors"
                                        >
                                            {loadingKeys.has(driver.claimKey) ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                        </button>
                                    </div>

                                    {/* Evidence Card (if loaded) */}
                                    <AnimatePresence>
                                        {evidence[driver.claimKey] && (
                                            <MotionDiv
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-[#00FFD1]/5 border border-[#00FFD1]/20 rounded-xl p-3 overflow-hidden"
                                            >
                                                <ul className="space-y-1.5">
                                                    {evidence[driver.claimKey].summaryBullets.map((b, bi) => (
                                                        <li key={bi} className="text-[10px] text-[#00FFD1]/80 flex gap-2">
                                                            <span>•</span> {b}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {evidence[driver.claimKey].citations.slice(0, 2).map((c, ci) => (
                                                        <a
                                                            key={ci}
                                                            href={c.url}
                                                            target="_blank"
                                                            className="text-[9px] text-white/40 hover:text-[#00FFD1] flex items-center gap-1"
                                                        >
                                                            <ExternalLink size={10} /> {c.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </MotionDiv>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Risk Flags */}
                        {receipt.riskFlags.length > 0 && (
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <span className="text-[9px] font-bold text-white/30 uppercase">Guardrail Compliance</span>
                                {receipt.riskFlags.map((flag, idx) => (
                                    <div key={idx} className="flex gap-3 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                                        <ShieldCheck className="text-red-400 shrink-0" size={14} />
                                        <p className="text-[10px] text-red-100/60 leading-tight">
                                            <span className="font-bold text-red-400 capitalize">{flag.level}:</span> {flag.note}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ADVISORY */}
                <div className="bg-[#BF5AF2]/5 border border-[#BF5AF2]/10 p-4 rounded-xl flex gap-3">
                    <Zap size={16} className="text-[#BF5AF2] shrink-0" />
                    <p className="text-[9px] text-[#BF5AF2]/60 uppercase tracking-widest font-bold leading-relaxed">
                        Data grounded in clinical research via Perplexity Sonar. Verification of sources is advised.
                    </p>
                </div>
            </div>
        </MotionDiv>
    );
}
