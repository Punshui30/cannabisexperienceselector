import { useState, useRef, useMemo, useEffect } from 'react';
import { resolveCultivarVisuals, resolveTerpeneVisuals } from '../lib/visuals';
import { INVENTORY } from '../lib/inventory';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Droplet, X, Mic, BookOpen, CheckCircle, RefreshCw, Loader2, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { LibraryMemoryStore } from '../lib/memory/libraryMemory';
import { PerplexityEvidenceProvider } from '../ai/providers/evidenceProvider';
import { AI_CONFIG, isMerchantMode } from '../ai/config';
import { ShowEvidencePanel } from './ShowEvidencePanel';
import { SpeakButton } from './SpeakButton';
import { buildStrainSpeakSummary } from '../lib/ttsUtils';

// Session-based counters for Perplexity usage
let sessionEnrichCount = 0;
let sessionRefreshCount = 0;

import { startListening } from '../lib/speech';

export function StrainLibraryScreen({ onBack }: { onBack: () => void }) {
    // 1. HARD MOUNT GUARD (MANDATORY)
    const hasMountedRef = useRef(false);
    useEffect(() => {
        if (hasMountedRef.current) return;
        hasMountedRef.current = true;
        // Read-only setup only, no state mutation or navigation here
    }, []);

    // SOURCE OF TRUTH: Iterate over the real Inventory/JSON data
    const strains = useMemo(() =>
        [...INVENTORY.cultivars].sort((a, b) => a.name.localeCompare(b.name)),
        []);

    // State (Local Only)
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showEvidenceId, setShowEvidenceId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const MotionDiv = motion.div as any;

    const handleMicClick = () => {
        startListening(t => setSearchQuery(t), setIsListening);
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

    // Filtered Strains
    const filteredStrains = strains.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helpers
    const getChemotype = (name: string) => {
        return INVENTORY.cultivars.find(c => c.name.toLowerCase() === name.toLowerCase());
    };

    const selectedChemotype = selectedName ? getChemotype(selectedName) : null;
    // Pure Visuals for Selected Strain
    const selectedVisuals = useMemo(() => {
        if (!selectedName || !selectedChemotype) return null;
        return resolveCultivarVisuals(selectedName, selectedChemotype.type || 'hybrid', { isActive: true });
    }, [selectedName, selectedChemotype]);

    return (
        <div className="fixed inset-0 flex flex-col bg-transparent text-white font-sans overflow-hidden">
            {/* Background Layer to ensure orbs show but don't overwhelm */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
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

            {/* Search Bar - Fixed at top */}
            <div className="flex-shrink-0 px-6 py-4 bg-black/40 border-b border-white/5">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or type..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FFD1]/50 transition-all text-sm"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </div>
                    <button
                        onClick={handleMicClick}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-[#00FFD1]'}`}
                    >
                        <Mic size={18} />
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {filteredStrains.map((strain, idx) => {
                        const isSelected = selectedName === strain.name;

                        // Pure Visuals Resolution
                        const visuals = useMemo(() => resolveCultivarVisuals(strain.name, strain.type || 'hybrid', {
                            isActive: isSelected,
                            isHovered: false
                        }), [strain.name, strain.type, isSelected]);

                        const topTerpenes = useMemo(() => {
                            if (!strain.terpenes) return [];
                            return Object.entries(strain.terpenes)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .slice(0, 3)
                                .map(([k]) => k);
                        }, [strain.terpenes]);

                        return (
                            <MotionDiv
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
                                        {LibraryMemoryStore.getCachedEnrichment(strain.id) && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20">
                                                <BookOpen size={10} className="text-[#00FFD1]" />
                                                <span className="text-[9px] font-bold text-[#00FFD1] uppercase tracking-tighter">Research active</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Terpene Profile</div>
                                        <div className="flex flex-wrap gap-2">
                                            {topTerpenes.map(t => {
                                                // Normalize: Capitalize first letter to match TERPENE_COLORS keys
                                                const normalizedName = t.charAt(0).toUpperCase() + t.slice(1);
                                                const terpInfo = resolveTerpeneVisuals(normalizedName);
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
                            </MotionDiv>
                        )
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedName && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <MotionDiv
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedName(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <MotionDiv
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
                                <div className="relative z-10 flex items-end gap-3">
                                    <h2 className="text-3xl font-serif text-white">{selectedName}</h2>
                                    {selectedChemotype && (
                                        <SpeakButton
                                            text={buildStrainSpeakSummary({
                                                name: selectedChemotype.name,
                                                type: selectedChemotype.type,
                                                thcPercent: selectedChemotype.thcPercent,
                                                cbdPercent: selectedChemotype.cbdPercent,
                                                topTerpenes: selectedChemotype.terpenes
                                                    ? Object.entries(selectedChemotype.terpenes)
                                                        .sort(([, a], [, b]) => (b as number) - (a as number))
                                                        .slice(0, 3)
                                                        .map(([k]) => k)
                                                    : []
                                            })}
                                            summaryMode={false}
                                            className="mb-0.5"
                                        />
                                    )}
                                </div>
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

                                        {/* Research / Evidence Section (Consumer Only) */}
                                        {!isMerchantMode() && AI_CONFIG.features.evidence && (
                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={16} className="text-[#00FFD1]" />
                                                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Sources & Background</h4>
                                                    </div>
                                                    {(() => {
                                                        const cached = LibraryMemoryStore.getCachedEnrichment(selectedChemotype.id);
                                                        if (!cached) return <span className="text-[10px] text-white/20 italic">No sources added yet</span>;
                                                        return (
                                                            <div className="flex items-center gap-1.5">
                                                                <CheckCircle size={12} className="text-[#00FFD1]" />
                                                                <span className="text-[10px] text-[#00FFD1]/60 font-medium">Sources added ✓</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="flex gap-2">
                                                    {(() => {
                                                        const cached = LibraryMemoryStore.getCachedEnrichment(selectedChemotype.id);
                                                        const isProcessingThis = isProcessing === selectedChemotype.id;
                                                        const hasKey = AI_CONFIG.features.hasPerplexityKey;

                                                        if (!hasKey) {
                                                            return (
                                                                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 opacity-60">
                                                                    <ShieldCheck size={14} className="text-red-400" />
                                                                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Sources aren’t available right now.</span>
                                                                </div>
                                                            );
                                                        }

                                                        if (!cached) {
                                                            return (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEnrich(selectedChemotype.id || ''); }}
                                                                    disabled={isProcessingThis}
                                                                    className="flex-1 bg-[#00FFD1]/10 hover:bg-[#00FFD1]/20 border border-[#00FFD1]/20 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                                >
                                                                    {isProcessingThis ? <Loader2 size={14} className="animate-spin text-[#00FFD1]" /> : <Sparkles size={14} className="text-[#00FFD1]" />}
                                                                    <span className="text-[11px] text-[#00FFD1] font-bold uppercase tracking-wider">Add Sources</span>
                                                                </button>
                                                            );
                                                        }

                                                        return (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setShowEvidenceId(selectedChemotype.id || ''); }}
                                                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                                                                >
                                                                    <BookOpen size={14} className="text-white/40" />
                                                                    <span className="text-[11px] text-white/70 font-bold uppercase tracking-wider">Why this match?</span>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleRefresh(selectedChemotype.id || ''); }}
                                                                    disabled={isProcessingThis}
                                                                    className="w-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center transition-colors disabled:opacity-50"
                                                                >
                                                                    {isProcessingThis ? <Loader2 size={14} className="animate-spin text-white/40" /> : <RefreshCw size={14} className="text-white/40" />}
                                                                </button>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                <p className="text-[10px] text-white/40 italic px-1">
                                                    This adds background information about this strain. It doesn’t change your result.
                                                </p>

                                                {LibraryMemoryStore.getCachedEnrichment(selectedChemotype.id) && (
                                                    <div className="flex items-center gap-1.5 opacity-40 px-1">
                                                        <Info size={10} className="text-white" />
                                                        <span className="text-[9px] text-white uppercase tracking-wider">
                                                            Verified grounding active. Last updated: {new Date(LibraryMemoryStore.getCachedEnrichment(selectedChemotype.id).enrichedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                                                                    <MotionDiv
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
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showEvidenceId && (() => {
                    const strain = strains.find(s => s.id === showEvidenceId);
                    const enrichment = LibraryMemoryStore.getCachedEnrichment(showEvidenceId);
                    if (!strain || !enrichment) return null;

                    const receipt = {
                        engineVersion: "8.5",
                        intentSummary: `Clinical grounding for ${strain.name} profile`,
                        topDrivers: enrichment.claimKeys.map((key: string) => ({
                            claimKey: key,
                            note: `${key.split('_')[1] || 'Primary'} Characteristic`
                        })),
                        riskFlags: []
                    };

                    return (
                        <ShowEvidencePanel
                            key="evidence-panel-modal"
                            receipt={receipt as any}
                            onClose={() => setShowEvidenceId(null)}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
