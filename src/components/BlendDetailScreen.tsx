import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';
import { SpatialStack } from './SpatialStack';
import { resolveCultivarVisuals, resolveTerpeneVisuals } from '../lib/visuals';
import { CultivarCard } from './shared/CultivarCard';

interface BlendDetailScreenProps {
    blend: UIBlendRecommendation;
    onBack: () => void;
    onOpenConsultant: () => void;
}

export function BlendDetailScreen({ blend, onBack, onOpenConsultant }: BlendDetailScreenProps) {
    // Removed local state

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
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#00FFD1] mb-1">Blend Detail</h2>
                    <div className="h-0.5 w-8 bg-[#00FFD1]/30 mx-auto rounded-full" />
                </div>
                <button
                    onClick={onOpenConsultant}
                    className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors px-3 py-2"
                >
                    Live Assistant
                </button>
            </div>

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black pointer-events-none" />

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
                </div>

                {/* Why This Blend */}
                {blend.reasoning && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto w-full">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] mb-2">
                            Why This Blend
                        </h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            {blend.reasoning}
                        </p>
                    </div>
                )}

                {/* Visualization */}
                <div className="flex items-center justify-center w-full max-w-md mx-auto py-8">
                    <SpatialStack data={stackData} />
                </div>

                {/* Cultivar Breakdown */}
                <div className="max-w-md mx-auto w-full space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                        Cultivar Composition
                    </h3>
                    {blend.cultivars.map((cultivar, i) => (
                        <CultivarCard
                            key={i}
                            name={cultivar.name}
                            profile={cultivar.profile}
                            ratio={cultivar.ratio}
                            prominentTerpenes={cultivar.prominentTerpenes}
                            characteristics={cultivar.characteristics}
                            context={{ density: 'default', showPercentage: true }}
                        />
                    ))}
                </div>

                {/* Effects Timeline */}
                {blend.effects && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto w-full">
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

            {/* Live Assistant Triggered Globally */}
        </div>
    );
}
