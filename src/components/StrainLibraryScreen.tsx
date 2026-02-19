import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { resolveCultivarVisuals, resolveTerpeneVisuals } from '../lib/visuals';
import { INVENTORY } from '../lib/inventory';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, Mic, ChevronDown, RefreshCw, Loader2, Sparkles,
    Eye, ShieldAlert, Clock, BarChart3, ExternalLink,
    Plus, Trash2, Zap, Activity, Droplet, Check
} from 'lucide-react';
import { LibraryMemoryStore } from '../lib/memory/libraryMemory';
import { StrainSummaryProvider, StrainSummary } from '../ai/providers/strainSummaryProvider';
import { computeComboPreview, generateNarrative, ComboPreviewResult } from '../lib/comboPreviewEngine';
import { VibeButton } from './VibeButton';
import { AI_CONFIG, isMerchantMode } from '../ai/config';
import { SpeakButton } from './SpeakButton';
import { buildStrainSpeakSummary } from '../lib/ttsUtils';
import { startListening } from '../lib/speech';

// Session-based rate limit
let sessionSummaryCount = 0;
const MAX_SUMMARIES_PER_SESSION = 8;

const MotionDiv = motion.div as any;

// ── Sub-component: What to Expect panel ───────────────────────────────────────

interface WhatToExpectProps {
    strainId: string;
    strainName: string;
}

function WhatToExpect({ strainId, strainName }: WhatToExpectProps) {
    const [summary, setSummary] = useState<StrainSummary | null>(
        () => StrainSummaryProvider.getCached(strainId)
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showSources, setShowSources] = useState(false);

    const toggleCard = (key: string) =>
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const fetchSummary = async (forceRefresh = false) => {
        if (!AI_CONFIG.features.evidence || !AI_CONFIG.features.hasPerplexityKey) {
            setError('Background info not available right now.');
            return;
        }
        if (sessionSummaryCount >= MAX_SUMMARIES_PER_SESSION) {
            setError('You\'ve reached the session limit for new summaries.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = forceRefresh
                ? await StrainSummaryProvider.refreshSummary(strainId, strainName)
                : await StrainSummaryProvider.fetchSummary(strainId, strainName);
            sessionSummaryCount++;
            setSummary(result);
        } catch (e: any) {
            setError('Couldn\'t load background info. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const consistencyColor = summary?.consistency.level === 'high'
        ? '#00FFD1' : summary?.consistency.level === 'medium'
            ? '#EAB308' : '#F87171';

    return (
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">What to Expect</h4>
                    <p className="text-[10px] text-white/30 mt-0.5">Pulled from public sources. Effects can vary by batch.</p>
                </div>
                {summary && (
                    <button
                        onClick={() => fetchSummary(true)}
                        disabled={isLoading}
                        title="Update"
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                    >
                        {isLoading
                            ? <Loader2 size={12} className="animate-spin" />
                            : <RefreshCw size={12} />
                        }
                    </button>
                )}
            </div>

            {error && (
                <p className="text-[11px] text-red-400/70 italic">{error}</p>
            )}

            {!summary && !isLoading && !error && (
                <div className="space-y-3">
                    <button
                        onClick={() => fetchSummary(false)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[#00FFD1] text-xs font-bold uppercase tracking-widest hover:bg-[#00FFD1]/20 transition-all"
                    >
                        <Sparkles size={13} />
                        Get quick summary
                    </button>
                    <p className="text-[10px] text-white/25 text-center italic">
                        Adds background info about this strain. Doesn't change your results.
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center gap-3 py-4">
                    <Loader2 size={16} className="animate-spin text-[#00FFD1]/60" />
                    <span className="text-xs text-white/40 italic">Looking up background info…</span>
                </div>
            )}

            {summary && !isLoading && (() => {
                const cards: Array<{
                    key: string;
                    icon: React.ReactNode;
                    label: string;
                    content: React.ReactNode;
                }> = [
                        {
                            key: 'effects',
                            icon: <Eye size={12} />,
                            label: 'Typical effects',
                            content: (
                                <ul className="space-y-1.5 pt-1">
                                    {summary.typicalEffects.map((e, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[#00FFD1] shrink-0" />
                                            {e}
                                        </li>
                                    ))}
                                </ul>
                            )
                        },
                        {
                            key: 'bestfor',
                            icon: <Clock size={12} />,
                            label: 'Best for',
                            content: (
                                <ul className="space-y-1.5 pt-1">
                                    {summary.bestFor.map((b, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            )
                        },
                        {
                            key: 'watchouts',
                            icon: <ShieldAlert size={12} />,
                            label: 'Watch outs',
                            content: (
                                <ul className="space-y-1.5 pt-1">
                                    {summary.watchOuts.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            )
                        },
                        {
                            key: 'consistency',
                            icon: <BarChart3 size={12} />,
                            label: 'Consistency',
                            content: (
                                <div className="pt-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                            style={{ color: consistencyColor, backgroundColor: consistencyColor + '20', border: `1px solid ${consistencyColor}40` }}
                                        >
                                            {summary.consistency.level}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed">{summary.consistency.note}</p>
                                </div>
                            )
                        }
                    ];

                return (
                    <div className="space-y-2">
                        {cards.map(card => (
                            <div key={card.key} className="border border-white/5 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleCard(card.key)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-white/60">
                                        {card.icon}
                                        <span className="text-xs font-medium">{card.label}</span>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={`text-white/30 transition-transform ${expanded[card.key] ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {expanded[card.key] && (
                                        <MotionDiv
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden px-4 pb-3"
                                        >
                                            {card.content}
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {/* Sources link */}
                        {summary.sources.length > 0 && (
                            <div className="pt-1">
                                <button
                                    onClick={() => setShowSources(s => !s)}
                                    className="text-[10px] text-white/30 hover:text-[#00FFD1] transition-colors flex items-center gap-1 underline-offset-2 hover:underline"
                                >
                                    <ExternalLink size={10} />
                                    Sources ({summary.sources.length})
                                </button>
                                <AnimatePresence>
                                    {showSources && (
                                        <MotionDiv
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <ul className="mt-2 space-y-1">
                                                {summary.sources.map((s, i) => (
                                                    <li key={i}>
                                                        <a
                                                            href={s.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-[#00FFD1]/70 hover:text-[#00FFD1] flex items-center gap-1 truncate"
                                                        >
                                                            <ExternalLink size={9} className="shrink-0" />
                                                            {s.title || s.domain || s.url}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
}

// ── Sub-component: Combo Dock ─────────────────────────────────────────────────

// ── Sub-component: ComboDock (ratio sliders + live vector bars + X to remove) ────

interface ComboDockProps {
    strains: typeof INVENTORY.cultivars;
    selectedForCombo: string[];
    ratios: number[];                               // 0–100 integers, sum == 100
    onRemove: (strainId: string) => void;
    onRatioChange: (idx: number, val: number) => void;
    onClearCombo: () => void;
    onPreviewCombo: () => void;
    isLoading: boolean;
    liveVector: { energy: number; body: number; mood: number; focus: number } | null;
}

function ComboDock({
    strains, selectedForCombo, ratios, onRemove, onRatioChange,
    onClearCombo, onPreviewCombo, isLoading, liveVector,
}: ComboDockProps) {
    const [isOpen, setIsOpen] = useState(false);
    const MAX = 3;
    const isFull = selectedForCombo.length >= MAX;

    const cultivars = selectedForCombo.map(id => strains.find(s => s.id === id)).filter(Boolean) as typeof INVENTORY.cultivars;

    // Adjust one slider while keeping total at 100
    const handleSlider = (idx: number, newVal: number) => {
        if (selectedForCombo.length < 2) return;
        const clamped = Math.min(100, Math.max(0, newVal));
        onRatioChange(idx, clamped);
    };

    const vectorBarData = [
        { label: 'Energy', val: liveVector ? liveVector.energy : 0, color: '#00FFD1' },
        { label: 'Body', val: liveVector ? liveVector.body : 0, color: '#A78BFA' },
        { label: 'Mood', val: liveVector ? liveVector.mood : 0, color: '#FBBF24' },
        { label: 'Focus', val: liveVector ? liveVector.focus : 0, color: '#60A5FA' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40">
            {/* Collapsed tab */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className={`w-full flex items-center justify-between px-6 py-3 bg-black/90 border-t transition-all
                    ${selectedForCombo.length > 0 ? 'border-[#00FFD1]/30' : 'border-white/10'}`}
            >
                <div className="flex items-center gap-3">
                    <Zap size={14} className={selectedForCombo.length > 0 ? 'text-[#00FFD1]' : 'text-white/30'} />
                    <div className="text-left">
                        <div className={`text-xs font-bold uppercase tracking-widest ${selectedForCombo.length > 0 ? 'text-white/80' : 'text-white/30'}`}>
                            Custom Blend Preview
                        </div>
                        <div className="text-[9px] text-white/25">
                            {selectedForCombo.length === 0
                                ? 'Add 3 cultivars to predict your blend.'
                                : selectedForCombo.length < MAX
                                    ? `${selectedForCombo.length} / ${MAX} — add ${MAX - selectedForCombo.length} more`
                                    : 'Adjust ratios to shape your experience'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {Array.from({ length: MAX }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < selectedForCombo.length ? 'bg-[#00FFD1]' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <ChevronDown size={14} className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden bg-black/95 border-t border-white/5"
                    >
                        <div className="px-6 py-4 space-y-4">
                            {/* 3 slots with X buttons */}
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: MAX }).map((_, i) => {
                                    const cultivar = cultivars[i];
                                    return (
                                        <div
                                            key={i}
                                            className={`relative rounded-xl border-2 text-center transition-all
                                                ${cultivar
                                                    ? 'border-[#00FFD1]/40 bg-[#00FFD1]/5 pt-2 pb-3 px-2'
                                                    : 'border-dashed border-white/10 bg-white/3 h-16 flex items-center justify-center'}`}
                                        >
                                            {cultivar ? (
                                                <>
                                                    {/* X to remove */}
                                                    <button
                                                        onClick={() => onRemove(cultivar.id)}
                                                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-all"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                    <p className="text-[10px] font-bold text-[#00FFD1] truncate leading-tight">{cultivar.name}</p>
                                                    <p className="text-[9px] text-white/30 capitalize mb-1">{cultivar.type}</p>
                                                    {/* Ratio slider */}
                                                    {isFull && (
                                                        <>
                                                            <div className="text-[9px] font-mono text-[#00FFD1]/80 mb-0.5">{ratios[i]}%</div>
                                                            <input
                                                                type="range"
                                                                min={0}
                                                                max={100}
                                                                value={ratios[i]}
                                                                onChange={e => handleSlider(i, parseInt(e.target.value))}
                                                                className="w-full accent-[#00FFD1] h-1"
                                                            />
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <Plus size={16} className="text-white/20" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Live vector bars — only when full */}
                            {isFull && liveVector && (
                                <div className="space-y-1.5">
                                    {vectorBarData.map(({ label, val, color }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <span className="text-[8px] w-10 text-white/30 uppercase tracking-widest shrink-0">{label}</span>
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <MotionDiv
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: color }}
                                                    key={val}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(0, ((val + 1) / 2) * 100)}%` }}
                                                    transition={{ duration: 0.35 }}
                                                />
                                            </div>
                                            <span className="text-[8px] font-mono text-white/25 w-8 text-right">{val > 0 ? '+' : ''}{val.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isFull && (
                                <p className="text-[9px] text-white/20 text-center">
                                    Ratios must sum to 100% · adjust sliders above
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                {selectedForCombo.length > 0 && (
                                    <button
                                        onClick={onClearCombo}
                                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Trash2 size={12} />
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={onPreviewCombo}
                                    disabled={!isFull || isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00FFD1] text-black text-xs font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00FFD1]/90 transition-all shadow-[0_0_20px_rgba(0,255,209,0.2)]"
                                >
                                    {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                                    {isLoading ? 'Computing...' : 'Preview combo'}
                                </button>
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Sub-component: Combo Preview Sheet ────────────────────────────────────────

interface ComboSheetProps {
    result: ComboPreviewResult;
    onClose: () => void;
    isLoadingNarrative: boolean;
}

function ComboSheet({ result, onClose, isLoadingNarrative }: ComboSheetProps) {
    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={onClose}
        >
            <MotionDiv
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0D0D0D] border border-[#00FFD1]/20 rounded-t-[2rem] overflow-hidden shadow-2xl"
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="px-6 pb-8 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between pt-2">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#00FFD1]/60 mb-1">Custom Blend Preview</p>
                            <div className="flex flex-wrap gap-2">
                                {result.outcomeLabels.map((label, i) => (
                                    <span key={i} className="text-xl font-serif font-light text-white">
                                        {label}{i < result.outcomeLabels.length - 1 && <span className="text-white/30 mx-1">+</span>}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/30 mt-1">
                                {result.cultivarNames.map((name, i) => `${name} (${Math.round(result.ratios[i] * 100)}%)`).join(' · ')}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white/50 hover:text-white mt-1">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Summary — Dynamic LLM Narrative */}
                    <div className="text-sm text-white/70 leading-relaxed min-h-[4em]">
                        {isLoadingNarrative && !result.summary ? (
                            <div className="flex items-center gap-2 text-[#00FFD1]/50 italic animate-pulse">
                                <Loader2 size={14} className="animate-spin" />
                                Synchronizing synergy patterns...
                            </div>
                        ) : (
                            result.summary || "Formulating experience narrative..."
                        )}
                    </div>

                    {/* Vibe Audio Button */}
                    <VibeButton
                        params={{
                            terpenes: result.cultivarNames.flatMap((name, i) => {
                                const c = INVENTORY.cultivars.find(cv => cv.name === name);
                                if (!c?.terpenes) return [];
                                return Object.entries(c.terpenes).map(([k, v]) => ({ name: k, pct: (v as number) * result.ratios[i] }));
                            }),
                            effects: {
                                energy: result._vector.energy,
                                body: result._vector.body,
                                mood: result._vector.mood,
                                anxiety: result._vector.anxiety
                            },
                            seed: result.cultivarIds.join('-')
                        }}
                    />

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Weighted THC', value: result.avgTHC !== null ? `${result.avgTHC}%` : 'Unknown' },
                            { label: 'Weighted CBD', value: result.avgCBD !== null ? `${result.avgCBD}%` : 'Unknown' },
                            {
                                label: 'Peak Time',
                                value: result.bestTime === 'day' ? '☀️ Day'
                                    : result.bestTime === 'afternoon' ? '🌤 Afternoon'
                                        : result.bestTime === 'evening' ? '🌆 Evening'
                                            : result.bestTime === 'night' ? '🌙 Night'
                                                : '— Unknown',
                            },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                                <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-sm font-semibold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Top effects — strict: "—" if vector produced nothing */}
                    <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Predicted Target Effects</p>
                        {result.topEffects.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {result.topEffects.map((e, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[#00FFD1] text-[10px] font-medium">
                                        {e}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-white/25">—</p>
                        )}
                    </div>

                    {/* Watch-outs — strict: "—" if no risk flags triggered */}
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                        <p className="text-[9px] text-amber-400/60 uppercase tracking-widest mb-2">Usage Considerations</p>
                        {result.watchOuts.length > 0 ? (
                            <div className="space-y-1.5">
                                {result.watchOuts.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-amber-200/60">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                        {w}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-white/25">—</p>
                        )}
                    </div>

                    {/* ENGINE v3 debug badge — proves output is computed, not generic */}
                    <div className="rounded-lg border border-[#00FFD1]/10 bg-[#00FFD1]/5 px-3 py-2 text-[9px] font-mono text-[#00FFD1]/50 leading-relaxed">
                        <span className="text-[#00FFD1]/80 font-bold">ENGINE v3 (Dynamic)</span>
                        {' · '}energy={result._vector.energy.toFixed(2)}
                        {' '}body={result._vector.body.toFixed(2)}
                        {' '}mood={result._vector.mood.toFixed(2)}
                        {' '}focus={result._vector.focus.toFixed(2)}
                        {' '}creat={result._vector.creativity.toFixed(2)}
                        {' '}anx={result._vector.anxiety.toFixed(2)}
                        {' · '}thc={result.avgTHC ?? 'n/a'}
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-white/20 text-center">
                        Custom ratio prediction. Actual effects vary by metabolism, dose, and consumption method.
                    </p>
                </div>
            </MotionDiv>
        </MotionDiv>
    );
}



// ── Main screen ───────────────────────────────────────────────────────────────

interface StrainLibraryScreenProps {
    onBack: () => void;
    onCultivarFocus?: (cultivar: {
        name: string;
        type: string;
        thcPercent: number;
        cbdPercent: number;
        topTerpenes: string[];
    } | null) => void;
}

export function StrainLibraryScreen({ onBack, onCultivarFocus }: StrainLibraryScreenProps) {
    const hasMountedRef = useRef(false);
    useEffect(() => {
        if (hasMountedRef.current) return;
        hasMountedRef.current = true;
    }, []);

    const strains = useMemo(() =>
        [...INVENTORY.cultivars].sort((a, b) => a.name.localeCompare(b.name)), []);

    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Called whenever a cultivar detail is opened/closed — propagates to App.tsx
    const handleSelectCultivar = useCallback((strain: typeof INVENTORY.cultivars[0] | null) => {
        if (strain) {
            setSelectedName(strain.name);
            if (onCultivarFocus) {
                const topTerpenes = strain.terpenes
                    ? Object.entries(strain.terpenes)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([k]) => k)
                    : [];
                onCultivarFocus({
                    name: strain.name,
                    type: strain.type || 'hybrid',
                    thcPercent: strain.thcPercent,
                    cbdPercent: strain.cbdPercent,
                    topTerpenes,
                });
                console.log('[LIBRARY_CONTEXT]', 'Cultivar focused:', strain.name, topTerpenes);
            }
        } else {
            setSelectedName(null);
            onCultivarFocus?.(null);
        }
    }, [onCultivarFocus]);

    // Combo state
    const [comboIds, setComboIds] = useState<string[]>([]);
    const [comboRatios, setComboRatios] = useState<number[]>([]); // 0-100 integers
    const [comboResult, setComboResult] = useState<ComboPreviewResult | null>(null);
    const [showComboSheet, setShowComboSheet] = useState(false);
    const [isComputingNarrative, setIsComputingNarrative] = useState(false);
    const narrativeTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial ratios when 3rd strain added
    useEffect(() => {
        if (comboIds.length === 3 && comboRatios.length === 0) {
            setComboRatios([33, 33, 34]);
        } else if (comboIds.length === 0) {
            setComboRatios([]);
        }
    }, [comboIds.length, comboRatios.length]);

    const handleMicClick = () => startListening(t => setSearchQuery(t), setIsListening);

    const filteredStrains = strains.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getChemotype = (name: string) =>
        INVENTORY.cultivars.find(c => c.name.toLowerCase() === name.toLowerCase());

    const selectedChemotype = selectedName ? getChemotype(selectedName) : null;

    const selectedVisuals = useMemo(() => {
        if (!selectedName || !selectedChemotype) return null;
        return resolveCultivarVisuals(selectedName, selectedChemotype.type || 'hybrid', { isActive: true });
    }, [selectedName, selectedChemotype]);

    // Combo handlers
    const handleAddToCombo = useCallback((strainId: string) => {
        setComboIds(prev => {
            if (prev.includes(strainId)) return prev;
            if (prev.length >= 3) return prev;
            const updated = [...prev, strainId];
            if (updated.length === 3) setComboRatios([33, 33, 34]);
            return updated;
        });
    }, []);

    const handleRemoveFromCombo = useCallback((strainId: string) => {
        setComboIds(prev => prev.filter(id => id !== strainId));
        setComboRatios([]);
    }, []);

    const handleRatioChange = useCallback((idx: number, newVal: number) => {
        setComboRatios(prev => {
            if (prev.length < 3) return prev;
            const current = [...prev];
            const oldVal = current[idx];
            const diff = newVal - oldVal;

            // Proportional distribution to others
            const others = [0, 1, 2].filter(i => i !== idx);
            const otherSum = current[others[0]] + current[others[1]];

            const next = [...current];
            next[idx] = newVal;

            if (otherSum > 0) {
                next[others[0]] = Math.max(0, current[others[0]] - (diff * (current[others[0]] / otherSum)));
                next[others[1]] = Math.max(0, current[others[1]] - (diff * (current[others[1]] / otherSum)));
            } else {
                next[others[0]] = Math.max(0, current[others[0]] - diff / 2);
                next[others[1]] = Math.max(0, current[others[1]] - diff / 2);
            }

            // Rounding correction to exactly 100
            const sum = Math.round(next[0]) + Math.round(next[1]) + Math.round(next[2]);
            const error = 100 - sum;
            const final = next.map(v => Math.round(v));
            final[others[0]] = Math.max(0, final[others[0]] + error);

            return final;
        });
    }, []);

    const handlePreviewCombo = useCallback(async () => {
        if (comboIds.length < 3) return;
        try {
            // 1. Math computation (Instant)
            const result = computeComboPreview(comboIds, comboRatios.map(r => r / 100));
            setComboResult(result);
            setShowComboSheet(true);

            // 2. Debounced Narrative (via LLM)
            if (narrativeTimerRef.current) clearTimeout(narrativeTimerRef.current);

            setIsComputingNarrative(true);
            narrativeTimerRef.current = setTimeout(async () => {
                const narrative = await generateNarrative(result);
                if (narrative) {
                    setComboResult(prev => prev ? { ...prev, summary: narrative } : null);
                }
                setIsComputingNarrative(false);
            }, 600);

        } catch (e) {
            console.error('[COMBO] Preview failed:', e);
            setIsComputingNarrative(false);
        }
    }, [comboIds, comboRatios]);

    // Live vector for dock preview
    const liveVector = useMemo(() => {
        if (comboIds.length < 3 || comboRatios.length < 3) return null;
        try {
            const res = computeComboPreview(comboIds, comboRatios.map(r => r / 100));
            return res._vector;
        } catch { return null; }
    }, [comboIds, comboRatios]);

    return (
        <div className="fixed inset-0 flex flex-col bg-transparent text-white font-sans overflow-hidden">
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
                    <span className="text-[10px] text-white/40">{strains.length} strains</span>
                </div>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 px-6 py-4 bg-black/40 border-b border-white/5">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name or type…"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FFD1]/50 transition-all text-sm"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
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

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-28">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {filteredStrains.map((strain, idx) => {
                        const isSelected = selectedName === strain.name;
                        const inCombo = comboIds.includes(strain.id);

                        const visuals = resolveCultivarVisuals(strain.name, strain.type || 'hybrid', {
                            isActive: isSelected,
                            isHovered: false
                        });

                        const topTerpenes = strain.terpenes
                            ? Object.entries(strain.terpenes)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .slice(0, 3)
                                .map(([k]) => k)
                            : [];

                        const hasSummary = !!StrainSummaryProvider.getCached(strain.id);

                        return (
                            <MotionDiv
                                key={strain.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="relative p-6 rounded-2xl bg-white/5 overflow-hidden group hover:bg-white/8 transition-all cursor-pointer"
                                style={{ border: visuals.borderStyle, boxShadow: visuals.glowStyle }}
                                onClick={() => {
                                    const strain = filteredStrains[idx];
                                    handleSelectCultivar(strain);
                                }}
                            >
                                {/* Color bloom */}
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"
                                    style={{ backgroundColor: visuals.primaryColor }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                                            style={{ backgroundColor: visuals.primaryColor, color: visuals.primaryColor }}
                                        />
                                        <h3 className="text-lg font-light serif text-white group-hover:text-[#00FFD1] transition-colors">{strain.name}</h3>
                                        {hasSummary && (
                                            <span className="text-[8px] uppercase tracking-widest text-[#00FFD1]/60 font-bold">✓ Info</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {topTerpenes.map(t => {
                                            const terpInfo = resolveTerpeneVisuals(t.charAt(0).toUpperCase() + t.slice(1));
                                            return (
                                                <div key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: terpInfo.color }} />
                                                    <span className="text-[9px] text-white/60">{t}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add to combo / Remove from combo button */}
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (!inCombo) handleAddToCombo(strain.id);
                                        }}
                                        disabled={!inCombo && comboIds.length >= 3}
                                        className={`mt-1 flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all
                                            ${inCombo
                                                ? 'bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30 cursor-default'
                                                : comboIds.length >= 3
                                                    ? 'opacity-20 cursor-not-allowed bg-white/5 border border-white/5 text-white/30'
                                                    : 'bg-white/5 border border-white/10 text-white/40 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/30 hover:text-[#00FFD1]'
                                            }`}
                                    >
                                        {inCombo ? <><Check size={9} /> In combo</> : <><Plus size={9} /> Add to combo</>}
                                    </button>
                                </div>
                            </MotionDiv>
                        );
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
                            onClick={() => handleSelectCultivar(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <MotionDiv
                            layoutId={selectedName}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-y-auto shadow-2xl z-50 max-h-[90vh]"
                            style={{ borderColor: selectedVisuals?.primaryColor + '40' }}
                        >
                            {/* Modal Header */}
                            <div className="relative h-32 bg-gradient-to-b from-white/10 to-transparent p-6 flex flex-col justify-end">
                                <div
                                    className="absolute inset-0 opacity-30 blur-[80px]"
                                    style={{ backgroundColor: selectedVisuals?.primaryColor }}
                                />
                                <button
                                    onClick={() => handleSelectCultivar(null)}
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
                                                        .slice(0, 3).map(([k]) => k)
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
                                        {/* Quick stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4">
                                                <div className="p-2 bg-[#00FFD1]/10 rounded-lg text-[#00FFD1]">
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase text-white/40">THC</div>
                                                    <div className="text-xl font-bold text-white">{selectedChemotype.thcPercent}%</div>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase text-white/40">CBD</div>
                                                    <div className="text-xl font-bold text-white">{selectedChemotype.cbdPercent}%</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add to combo — inline in modal */}
                                        {(() => {
                                            const inCombo = comboIds.includes(selectedChemotype.id);
                                            return (
                                                <button
                                                    onClick={() => inCombo
                                                        ? handleRemoveFromCombo(selectedChemotype.id)
                                                        : handleAddToCombo(selectedChemotype.id)
                                                    }
                                                    disabled={!inCombo && comboIds.length >= 3}
                                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all
                                                        ${inCombo
                                                            ? 'bg-[#00FFD1]/10 border-[#00FFD1]/30 text-[#00FFD1] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                                                            : comboIds.length >= 3
                                                                ? 'opacity-30 cursor-not-allowed bg-white/5 border-white/10 text-white/30'
                                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/30 hover:text-[#00FFD1]'
                                                        }`}
                                                >
                                                    {inCombo
                                                        ? <><X size={13} /> Remove from combo</>
                                                        : <><Plus size={13} /> Add to combo</>
                                                    }
                                                </button>
                                            );
                                        })()}

                                        <VibeButton
                                            className="mt-2"
                                            params={{
                                                terpenes: selectedChemotype.terpenes
                                                    ? Object.entries(selectedChemotype.terpenes).map(([k, v]) => ({ name: k, pct: v as number }))
                                                    : [],
                                                effects: (() => {
                                                    // Quick compute for single strain vibe
                                                    try {
                                                        const single = computeComboPreview([selectedChemotype.id], [1]);
                                                        return {
                                                            energy: single._vector.energy,
                                                            body: single._vector.body,
                                                            mood: single._vector.mood,
                                                            anxiety: single._vector.anxiety
                                                        };
                                                    } catch {
                                                        return { energy: 0, body: 0, mood: 0, anxiety: 0 };
                                                    }
                                                })(),
                                                seed: selectedChemotype.id
                                            }}
                                        />

                                        {/* What to Expect — NEW clean section */}
                                        {!isMerchantMode() && (
                                            <WhatToExpect
                                                strainId={selectedChemotype.id}
                                                strainName={selectedChemotype.name}
                                            />
                                        )}

                                        {/* Terpene breakdown */}
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Droplet size={14} className="text-[#FFD700]" />
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFD700]">Terpene Profile</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {selectedChemotype.terpenes && Object.entries(selectedChemotype.terpenes)
                                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                                    .map(([name, val]) => {
                                                        const tVis = resolveTerpeneVisuals(name.charAt(0).toUpperCase() + name.slice(1));
                                                        return (
                                                            <div key={name} className="space-y-1">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="capitalize text-white/70">{name}</span>
                                                                    <span className="font-mono text-white/40">{val}%</span>
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
                                        No data on file for this strain.
                                    </div>
                                )}
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            {/* Combo Dock */}
            <ComboDock
                strains={strains}
                selectedForCombo={comboIds}
                ratios={comboRatios}
                onRemove={handleRemoveFromCombo}
                onRatioChange={handleRatioChange}
                onClearCombo={() => setComboIds([])}
                onPreviewCombo={handlePreviewCombo}
                isLoading={isComputingNarrative}
                liveVector={liveVector}
            />

            {/* Combo Result Sheet */}
            <AnimatePresence>
                {showComboSheet && comboResult && (
                    <ComboSheet
                        result={comboResult}
                        onClose={() => setShowComboSheet(false)}
                        isLoadingNarrative={isComputingNarrative}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
