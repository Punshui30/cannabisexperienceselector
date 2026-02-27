import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Activity, Droplet, Sparkles } from 'lucide-react';
import { STRAIN_LIBRARY, type Strain } from '../lib/strainLibrary';
import { INVENTORY } from '../lib/inventory';
import { ScanButton } from './ScanButton';
import { MatchReviewSheet } from './MatchReviewSheet';
import { LabelScan } from '../ai/providers/visionProvider';
import { LibraryMemoryStore } from '../lib/memory/libraryMemory';
import { PerplexityEvidenceProvider } from '../ai/providers/evidenceProvider';
import { AI_CONFIG, isMerchantMode } from '../ai/config';
import { ShowEvidencePanel } from './ShowEvidencePanel';
import { BookOpen, CheckCircle, RefreshCw, Loader2, Info, ShieldCheck } from 'lucide-react';

// Session-based counters for Perplexity usage
let sessionEnrichCount = 0;
let sessionRefreshCount = 0;

export function StrainLibrary() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeScan, setActiveScan] = useState<LabelScan | null>(null);
    const [showEvidenceId, setShowEvidenceId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null); // track which strain is enriching

    const MotionDiv = motion.div as any;
    const MotionSpan = motion.span as any;

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleEnrich = async (id: string) => {
        if (sessionEnrichCount >= AI_CONFIG.limits.maxEnrichPerSession) {
            alert("Session limit for research enrichment reached.");
            return;
        }
        setIsProcessing(id);
        try {
            await PerplexityEvidenceProvider.refreshEnrichmentForStrain(id);
            sessionEnrichCount++;
        } catch (err) {
            console.error("Enrichment failed:", err);
            alert("Failed to enrich strain data. Check console.");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRefresh = async (id: string) => {
        if (sessionRefreshCount >= AI_CONFIG.limits.maxRefreshPerSession) {
            alert("Session limit for research refresh reached.");
            return;
        }
        setIsProcessing(id);
        try {
            await PerplexityEvidenceProvider.refreshEnrichmentForStrain(id);
            sessionRefreshCount++;
        } catch (err) {
            console.error("Refresh failed:", err);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleMatchConfirm = (id: string) => {
        setActiveScan(null);
        setExpandedId(id);
        // Scroll to the item
        setTimeout(() => {
            const el = document.getElementById(`strain-${id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 300);
    };

    return (
        <div className="w-full space-y-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
                        Strain Library
                    </h3>
                    <ScanButton onScanComplete={setActiveScan} />
                </div>
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
                        <MotionDiv
                            key={strain.id}
                            id={`strain-${strain.id}`}
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
                                        {LibraryMemoryStore.getCachedEnrichment(strain.id) && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#00FFD1]/30 bg-[#00FFD1]/5">
                                                <BookOpen size={8} className="text-[#00FFD1]" />
                                                <span className="text-[8px] font-bold text-[#00FFD1] uppercase tracking-tighter">Research</span>
                                            </div>
                                        )}
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
                                    <MotionDiv
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
                                                                        <MotionSpan
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

                                                {/* Research / Evidence Section (Consumer Only) */}
                                                {!isMerchantMode() && AI_CONFIG.features.evidence && (
                                                    <div className="pt-4 mt-2 border-t border-white/5 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen size={12} className="text-[#00FFD1]" />
                                                                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Research / Evidence</span>
                                                            </div>
                                                            {(() => {
                                                                const cached = LibraryMemoryStore.getCachedEnrichment(strain.id);
                                                                if (!cached) return <span className="text-[9px] text-white/20 italic">Not enriched</span>;
                                                                return (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <CheckCircle size={10} className="text-[#00FFD1]" />
                                                                        <span className="text-[9px] text-[#00FFD1]/60 font-medium">Enriched ✓</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>

                                                        <div className="flex gap-2">
                                                            {(() => {
                                                                const cached = LibraryMemoryStore.getCachedEnrichment(strain.id);
                                                                const isProcessingThis = isProcessing === strain.id;
                                                                const hasKey = AI_CONFIG.features.hasPerplexityKey;

                                                                if (!hasKey) {
                                                                    return (
                                                                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 flex items-center justify-center gap-2">
                                                                            <ShieldCheck size={12} className="text-red-400" />
                                                                            <span className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">Evidence unavailable (missing key)</span>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (!cached) {
                                                                    return (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleEnrich(strain.id); }}
                                                                            disabled={isProcessingThis}
                                                                            className="flex-1 bg-[#00FFD1]/10 hover:bg-[#00FFD1]/20 border border-[#00FFD1]/20 rounded-lg py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                                        >
                                                                            {isProcessingThis ? <Loader2 size={12} className="animate-spin text-[#00FFD1]" /> : <Sparkles size={12} className="text-[#00FFD1]" />}
                                                                            <span className="text-[10px] text-[#00FFD1] font-bold uppercase tracking-wider">Enrich Profile</span>
                                                                        </button>
                                                                    );
                                                                }

                                                                return (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setShowEvidenceId(strain.id); }}
                                                                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
                                                                        >
                                                                            <BookOpen size={12} className="text-white/40" />
                                                                            <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Show Evidence</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleRefresh(strain.id); }}
                                                                            disabled={isProcessingThis}
                                                                            className="w-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 flex items-center justify-center transition-colors disabled:opacity-50"
                                                                            title="Refresh"
                                                                        >
                                                                            {isProcessingThis ? <Loader2 size={12} className="animate-spin text-white/40" /> : <RefreshCw size={12} className="text-white/40" />}
                                                                        </button>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>

                                                        {LibraryMemoryStore.getCachedEnrichment(strain.id) && (
                                                            <div className="flex items-center gap-1 opacity-40">
                                                                <Info size={8} className="text-white" />
                                                                <span className="text-[8px] text-white uppercase tracking-tighter">
                                                                    Last updated: {new Date(LibraryMemoryStore.getCachedEnrichment(strain.id).enrichedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="pt-4 pb-2 text-center">
                                                <span className="text-xs text-white/30 italic">Chemotype data not available</span>
                                            </div>
                                        )}
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </MotionDiv>
                    );
                })}
            </div>

            <MatchReviewSheet
                scanResult={activeScan}
                onClose={() => setActiveScan(null)}
                onMatchConfirm={handleMatchConfirm}
            />

            <AnimatePresence>
                {showEvidenceId && (() => {
                    const strain = STRAIN_LIBRARY.find(s => s.id === showEvidenceId);
                    const enrichment = LibraryMemoryStore.getCachedEnrichment(showEvidenceId);
                    if (!strain || !enrichment) return null;

                    // Construct DecisionReceipt from cached enrichment data
                    const receipt = {
                        engineVersion: "8.5",
                        intentSummary: `Grounding clinical evidence for ${strain.name} profile`,
                        topDrivers: enrichment.claimKeys.map((key: string) => ({
                            claimKey: key,
                            note: `${key.split('_')[1] || 'Primary'} Characteristic`
                        })),
                        riskFlags: []
                    };

                    return (
                        <ShowEvidencePanel
                            key="evidence-panel"
                            receipt={receipt as any}
                            onClose={() => setShowEvidenceId(null)}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
