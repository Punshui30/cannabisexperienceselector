import { motion } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';
import { SpatialStack } from './SpatialStack';
import { COLORS } from '../lib/colors';

interface Props {
    recommendation: UIBlendRecommendation;
}

/**
 * SharedResultScreen
 * A READ-ONLY, Safe-Mode view of a blend.
 * No Engine, No Recalculation, No Personalization.
 */
export function SharedResultScreen({ recommendation }: Props) {

    const handleFindDispensary = () => {
        // In a real app, this would open a map or inventory locator
        alert("This would open the dispensary locator.");
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-black font-sans selection:bg-[#00FFD1] selection:text-black">

            {/* --- BACKGROUND (Static, Premium) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[80%] bg-[#7C3AED]/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-[#059669]/40 rounded-full blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
            </div>

            <div className="relative z-10 w-full max-w-md h-full flex flex-col p-6">

                {/* HEADER: Read Only Badge */}
                <div className="flex justify-between items-center mb-8 pt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00FFD1]" />
                        <span className="text-[#00FFD1] text-[10px] uppercase tracking-widest font-bold">Shared Result</span>
                    </div>
                    <div className="text-white/40 text-[10px] uppercase tracking-widest">
                        StrainMath™ Verified
                    </div>
                </div>

                {/* CARD CONTENT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl"
                >
                    <div className="text-center mb-8 border-b border-white/5 pb-6">
                        <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                {recommendation.matchScore}% Match
                            </span>
                        </div>
                        <h1 className="text-4xl font-light text-white mb-2 serif tracking-tight">
                            {recommendation.name}
                        </h1>
                        <p className="text-xs text-white/40 font-medium tracking-wide">
                            {recommendation.effects?.onset} Onset • {recommendation.effects?.duration} Duration
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <SpatialStack
                            data={{
                                kind: 'stack',
                                stackId: recommendation.id,
                                id: recommendation.id,
                                name: recommendation.name,
                                description: recommendation.description || 'Custom Stack',
                                matchScore: recommendation.matchScore,
                                reasoning: recommendation.reasoning,
                                totalDuration: recommendation.effects?.duration || 'Unknown',

                                layers: [{
                                    type: 'blend',
                                    layerName: 'Blend Composition',
                                    cultivars: recommendation.cultivars.map(c => ({
                                        name: c.name,
                                        ratio: c.ratio,
                                        profile: c.profile || 'Hybrid',
                                        characteristics: []
                                    })),
                                    phaseIntent: 'Complete Experience',
                                    whyThisPhase: 'A synergistic combination of selected cultivars.',
                                    onsetEstimate: recommendation.effects.onset,
                                    durationEstimate: recommendation.effects.duration,
                                    consumptionGuidance: 'Vaporize / Smoke',
                                    purpose: 'Main Experience',
                                    timing: 'Single Phase'
                                }]
                            }}
                            compact={true}
                        />
                    </div>

                    {/* SAFE ACTION: Find Dispensary */}
                    <div className="mt-6">
                        <button
                            onClick={handleFindDispensary}
                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-colors"
                        >
                            Find Nearby
                        </button>
                        <p className="text-center text-[10px] text-white/30 mt-4 max-w-xs mx-auto leading-relaxed">
                            This is a read-only view. To create your own custom blend, visit the main application.
                        </p>
                    </div>
                </motion.div>

                {/* FOOTER */}
                <div className="py-6 text-center">
                    <div className="text-[10px] text-white/20 uppercase tracking-widest">
                        Powered by StrainMath™
                    </div>
                </div>

            </div>
        </div>
    );
}
