import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';
import { VoiceFeedback } from './VoiceFeedback';
import { SpatialStack } from './SpatialStack';
import { CardShell } from './CardShell';

export interface BlendCardProps {
  recommendation: UIBlendRecommendation;
  onCalculate: () => void;
}

export function BlendCard({ recommendation, onCalculate }: BlendCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showVoiceFeedback, setShowVoiceFeedback] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group h-full"
      >
        {/* Soft Ambient Glow */}
        <div
          className="absolute -inset-4 blur-3xl opacity-20 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle, ${(recommendation.cultivars[0]?.color || '#00FFD1')}30, transparent 70%)`
          }}
        />

        <CardShell
          color={recommendation.cultivars[0]?.color}
          secondaryColor={recommendation.cultivars[1]?.color}
          className="h-full flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
            <div className="mb-4 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
                {recommendation.matchScore}% Match
              </span>
            </div>

            <h2 className="text-3xl font-light text-white mb-2 serif tracking-tight leading-tight">
              {recommendation.name}
            </h2>

            <p className="text-xs text-white/40 font-medium tracking-wide">
              {recommendation.effects?.onset || 'Fast'} Onset • {recommendation.effects?.duration || '2-4h'} Duration
            </p>
          </div>

          <div className="flex-1 py-6 flex flex-col justify-center">
            {/* Visualization */}
            <SpatialStack
              data={{
                kind: 'stack',
                stackId: recommendation.id,
                id: recommendation.id,
                name: recommendation.name,
                description: recommendation.description || 'Custom Blend',
                matchScore: recommendation.matchScore,
                reasoning: recommendation.reasoning,
                totalDuration: recommendation.effects.duration,
                layers: [{
                  type: 'blend',
                  layerName: 'Blend Composition',
                  cultivars: recommendation.cultivars.map(c => ({
                    name: c.name,
                    ratio: c.ratio,
                    profile: c.profile || 'Hybrid',
                    characteristics: c.characteristics || []
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

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={onCalculate}
              className="w-full py-4 rounded-xl bg-[#00FFD1] text-black font-bold text-sm uppercase tracking-widest hover:bg-[#00FFD1]/90 transition-colors shadow-[0_0_20px_rgba(0,255,209,0.3)] hover:shadow-[0_0_30px_rgba(0,255,209,0.5)]"
            >
              Calculate Recipe
            </button>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowVoiceFeedback(true)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Feedback
              </button>
              <div className="w-px h-3 bg-white/10 self-center" />
              <button
                onClick={() => setShowDetails(true)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Chemistry
              </button>
            </div>
          </div>
        </CardShell>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card p-8 border-[#00FFD1]/20 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-light text-[#ffd700] serif">StrainMath™ Chemistry</h3>
                <button onClick={() => setShowDetails(false)} className="text-white/20 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* 1. Dominant Terpenes */}
                {recommendation.blendEvaluation?.explanationData?.dominantContributors && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-bold">Dominant Terpenes</h4>
                    <div className="space-y-3">
                      {recommendation.blendEvaluation.explanationData.dominantContributors.filter(Boolean).map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-medium capitalize">{t.terpene}</span>
                            <span className="text-[10px] text-white/40">{t.contribution}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[#00FFD1] font-mono text-xs">{t.percent}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Detected Interactions */}
                {recommendation.blendEvaluation?.explanationData?.interactions && recommendation.blendEvaluation.explanationData.interactions.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-bold border-t border-white/5 pt-4">Detected Interactions</h4>
                    <div className="space-y-2">
                      {recommendation.blendEvaluation.explanationData.interactions.filter(Boolean).map((int, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                          <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${int.type === 'synergy' ? 'bg-[#00FFD1]' : int.type === 'antagonism' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className={`uppercase font-bold tracking-wider ${int.type === 'synergy' ? 'text-[#00FFD1]' : int.type === 'antagonism' ? 'text-red-400' : 'text-yellow-400'}`}>{int.type}</span>
                              <span className="text-white/20 capitalize">{int.magnitude}</span>
                            </div>
                            <p className="text-sm text-white/80 font-light leading-snug">
                              {int.effect}
                            </p>
                            <div className="text-[9px] text-white/30 mt-1 capitalize">
                              {int.terpenes.join(' + ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Risks & Tradeoffs */}
                {recommendation.blendEvaluation?.explanationData && (recommendation.blendEvaluation.explanationData.risksIncurred.length > 0 || recommendation.blendEvaluation.explanationData.risksManaged.length > 0) && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-bold border-t border-white/5 pt-4">Risk Profile</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {recommendation.blendEvaluation.explanationData.risksManaged.filter(Boolean).map((r, idx) => (
                        <div key={idx} className="px-3 py-2 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                          <span className="font-bold">✓ MANAGED:</span> {r.mitigationStrategy} ({r.severity})
                        </div>
                      ))}
                      {recommendation.blendEvaluation.explanationData.risksIncurred.filter(Boolean).map((r, idx) => (
                        <div key={idx} className="px-3 py-2 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs">
                          <span className="font-bold">! RISK:</span> {r.reason} ({r.severity})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Score Confidence</span>
                  <span className="text-lg text-[#00FFD1] font-medium">{Math.round(recommendation.confidence * 100)}%</span>
                </div>
                <button onClick={() => setShowDetails(false)} className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase text-white/40 hover:text-white">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showVoiceFeedback && (
        <VoiceFeedback
          recommendationName={recommendation.name}
          onClose={() => setShowVoiceFeedback(false)}
          onRecalculate={() => { }}
        />
      )}
    </>
  );
}