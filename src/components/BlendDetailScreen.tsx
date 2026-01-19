import { ArrowLeft } from 'lucide-react';
import { UIBlendRecommendation } from '../types/domain';
import { SpatialStack } from './SpatialStack';
import { getCultivarVisuals } from '../lib/cultivarData';

interface BlendDetailScreenProps {
    blend: UIBlendRecommendation;
    onBack: () => void;
}

export function BlendDetailScreen({ blend, onBack }: BlendDetailScreenProps) {
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
        <div className="w-full min-h-screen flex flex-col bg-black text-white relative overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">

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
                <div className="w-10" /> {/* Spacer */}
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
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cultivar.color }} />
                                    <div>
                                        <div className="text-sm font-medium text-white">{cultivar.name}</div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{cultivar.profile}</div>
                                    </div>
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
        </div>
    );
}
