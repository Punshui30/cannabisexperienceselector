import { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';
import { SpatialStack } from './SpatialStack';
import { resolveCultivarVisuals } from '../lib/visuals';
import { SpeakButton } from './SpeakButton';
import { MusicVibeButton } from './MusicVibeButton';
import { INVENTORY } from '../lib/inventory';
import { BlendDetailOverlay } from './BlendDetailOverlay';

const MotionDiv = motion.div as any;

interface BlendDetailScreenProps {
    blend: UIBlendRecommendation;
    onBack: () => void;
    /** When user generates a vibe track, pass its URL so the share tile can show it. */
    onVibeTrackGenerated?: (url: string) => void;
}

export function BlendDetailScreen({ blend, onBack, onVibeTrackGenerated }: BlendDetailScreenProps) {
    const [isCalculating, setIsCalculating] = useState(false);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [activeOverlayTab, setActiveOverlayTab] = useState<'composition' | 'timeline'>('composition');
    const [prerollSize, setPrerollSize] = useState<number>(0.7); // Default to 0.7g

    if (!blend) return null;

    // Convert blend to stack format for visualization
    const stackData = {
        kind: 'stack' as const,
        stackId: blend.id,
        id: blend.id,
        name: blend.name,
        description: blend.reasoning || '',
        matchScore: blend.matchScore,
        reasoning: blend.reasoning,
        totalDuration: blend.effects.duration,
        layers: [{
            type: 'blend' as const,
            layerName: 'Blend Composition',
            cultivars: blend.cultivars.map(c => ({
                name: c.name,
                ratio: c.ratio,
                profile: c.profile || 'Hybrid',
                characteristics: c.characteristics || []
            })),
            phaseIntent: 'Complete Experience',
            whyThisPhase: 'Synergistic combination',
        }],
        effects: blend.effects,
        confidence: blend.confidence
    };

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col bg-black text-white overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">

            {/* HEADER */}
            <div className="w-full p-6 flex justify-between items-center z-20 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#00FFD1] mb-1">StrainMath<span className="text-[9px] align-top opacity-60">™</span> Blend</h2>
                    <div className="h-0.5 w-8 bg-[#00FFD1]/30 mx-auto rounded-full" />
                </div>
                <div className="w-10 h-10" />
            </div>

            {/* Background - Pure Black */}
            <div className="absolute inset-0 bg-black pointer-events-none" />

            <div className="flex flex-col gap-6 relative z-10 pb-32 px-4">

                {/* Blend Header */}
                <div className="shrink-0 pt-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-full border border-[#00FFD1]/20">
                            Match {blend.matchScore}%
                        </span>
                    </div>
                    <h1 className="text-3xl font-serif text-white mb-2 leading-tight">
                        {blend.name}
                    </h1>

                    <div className="flex justify-center mt-3">
                        <MusicVibeButton
                            terpenes={blend.cultivars.flatMap(c => {
                                const fullCv = INVENTORY.cultivars.find(cv => cv.name === c.name);
                                if (!fullCv?.terpenes) return [];
                                return Object.entries(fullCv.terpenes).map(([name, pct]) => ({
                                    name,
                                    percent: (pct as number) * c.ratio
                                }));
                            })}
                            narration={blend.reasoning}
                            cultivars={blend.cultivars}
                            onGenerated={onVibeTrackGenerated}
                        />
                    </div>
                </div>

                {/* Why This Blend */}
                {blend.reasoning && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto w-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1]">
                                Why This Blend
                            </h3>
                            {/* SpeakButton: fixed w-7 h-7, never shifts layout */}
                            <SpeakButton
                                text={blend.reasoning}
                                summaryMode={true}
                                aria-label="Read blend reasoning aloud"
                            />
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">
                            {blend.reasoning}
                        </p>
                    </div>
                )}

                {/* Visualization */}
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center justify-center w-full max-w-md mx-auto py-8 relative"
                >
                    <div className="absolute inset-0 bg-[#00FFD1]/5 blur-[80px] rounded-full animate-pulse-slow" />
                    <SpatialStack
                        data={stackData}
                        active={isOverlayOpen}
                        onOpenCultivars={() => {
                            setActiveOverlayTab('composition');
                            setIsOverlayOpen(true);
                        }}
                    />
                </MotionDiv>
            </div>

            {/* ACTIONS */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end z-50 pointer-events-auto">
                <button
                    onClick={() => setIsCalculating(true)}
                    className="shadow-[0_0_20px_rgba(0,255,209,0.3)] bg-white text-black font-bold uppercase tracking-widest text-[10px] px-6 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                    style={{
                        boxShadow: '0 8px 32px rgba(0, 255, 209, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <Zap size={20} fill="currentColor" />
                    <span>Calculate Dose</span>
                </button>
            </div>

            {/* CALCULATOR MODAL */}
            <AnimatePresence>
                {isCalculating && (
                    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-end sm:items-center justify-center p-4 sm:p-6" onClick={() => setIsCalculating(false)}>
                        <MotionDiv
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-sm bg-black border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 relative overflow-hidden"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {/* The Hairline Border (Rest of card) */}
                            <div className="absolute inset-0 rounded-[inherit] border border-white/10 pointer-events-none z-10" />

                            {/* The Front-Edge Iridescent Light (Top Highlight) */}
                            <div
                                className="absolute top-0 left-[5%] right-[5%] h-[1px] opacity-100 z-20"
                                style={{
                                    background: `linear-gradient(90deg, transparent 0%, #00FFD1 50%, transparent 100%)`,
                                    boxShadow: `0 0 10px rgba(0, 255, 209, 0.4)`
                                }}
                            />

                            <div className="flex justify-between items-center mb-6 pt-2">
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-serif text-white leading-tight">Blend Recipe</h3>
                                    <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Guided Outcomes™ Calculator</span>
                                </div>
                                <button onClick={() => setIsCalculating(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white">✕</button>
                            </div>

                            <div className="mb-8">
                                <label className="block text-[10px] uppercase tracking-widest text-[#00FFD1] mb-3 font-bold">Select Pre-roll Size</label>
                                <div className="flex gap-2">
                                    {[0.5, 0.7, 1.0, 1.5].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setPrerollSize(size)}
                                            className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden ${prerollSize === size
                                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {size === 0.7 ? '0.7g' : `${size}g`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Required Ingredients</span>
                                {blend.cultivars.map((cultivar, idx) => {
                                    const grams = (prerollSize * (cultivar.ratio || (1 / blend.cultivars.length))).toFixed(2);
                                    const visuals = resolveCultivarVisuals(cultivar.name);
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
                                            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity"
                                                style={{ boxShadow: `inset 0 0 10px ${visuals.primaryColor}20` }} />
                                            <div className="flex items-center gap-2 relative z-10">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: visuals.primaryColor }} />
                                                <span className="text-sm text-white font-medium">{cultivar.name}</span>
                                            </div>
                                            <div className="flex items-baseline gap-1 relative z-10">
                                                <span className="text-lg font-mono text-[#00FFD1]">{grams}</span>
                                                <span className="text-xs text-white/40 font-mono">g</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-[10px] text-white/30 italic">Mix thoroughly before packing.</p>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            {/* BLEND DETAIL OVERLAY */}
            <BlendDetailOverlay
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                cultivars={blend.cultivars}
                effects={blend.effects}
                blendName={blend.name}
                initialTab={activeOverlayTab}
            />
        </div>
    );
}
