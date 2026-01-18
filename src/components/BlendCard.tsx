
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';
import { VoiceFeedback } from './VoiceFeedback';
import { BlendCompositionBar } from './visuals/BlendCompositionBar';

interface BlendCardProps {
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
        className="relative group"
        onLayoutAnimationComplete={() => {
          console.log('VERIFICATION: BlendCard Rendering', {
            blendName: recommendation.name,
            renderedIDs: recommendation.cultivars.map(c => c.name),
            count: recommendation.cultivars.length
          });
        }}
      >
        {/* Rich Gradient Glow Outer - Restored Opacity/Depth */}
        <div
          className="absolute -inset-1 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"
          style={{
            background: `linear-gradient(45deg, ${recommendation.cultivars[0]?.color}40, ${recommendation.cultivars[1]?.color}40)`
          }}
        />

        import {getGlassCardStyles} from '../lib/glassStyles';

        // ...

        <div
          className="relative overflow-hidden shadow-2xl rounded-3xl"
          style={getGlassCardStyles(
            recommendation.cultivars[0]?.color,
            recommendation.cultivars[1]?.color
          )}
        >
          {/* Top Header Section */}
          <div className="p-8 pb-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                {/* Distinct Badge for Custom Blends */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 rounded border border-[#00FFD1] bg-[#00FFD1]/10 text-[#00FFD1] text-[9px] font-bold uppercase tracking-widest">
                    Custom Blend
                  </div>
                </div>
                <h2 className="text-4xl font-light text-white mb-2 serif tracking-tight leading-none">
                  {recommendation.name}
                </h2>
                {/* Score moved here for cleaner layout */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-light text-[#00FFD1] serif">{recommendation.matchScore}%</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#00FFD1]/60">Match</span>
                </div>
              </div>
            </div>

            {/* VISUALIZATION: SINGLE HORIZONTAL PERCENTAGE BAR (Strict Rule 2) */}
            <div className="w-full py-4 px-2">
              <BlendCompositionBar blend={recommendation} />
            </div>

            {/* Cultivar Legend & Terpene Indicators directly on face */}
            <div className="space-y-3 mb-6">
              {recommendation.cultivars.filter(Boolean).map((cultivar, idx) => (
                <div key={idx} className="flex items-center justify-between group/row">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cultivar.color }} />
                    <div>
                      <div className="text-sm font-medium text-white">{cultivar.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40">{cultivar.profile}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Terpene Dots */}
                    <div className="flex gap-1.5">
                      {cultivar.prominentTerpenes?.filter(Boolean).slice(0, 3).map((terp, tIdx) => (
                        <div
                          key={tIdx}
                          className="w-1.5 h-1.5 rounded-full bg-white/20"
                          title={terp}
                          style={{ backgroundColor: tIdx === 0 ? cultivar.color : undefined }} // Highlight dominant
                        />
                      ))}
                    </div>
                    <div className="text-xl font-light text-white/80 w-12 text-right serif">
                      {Math.round(cultivar.ratio * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Principal Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowVoiceFeedback(true)}
                className="py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Feedback
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Chemistry
              </button>
            </div>

            <button
              onClick={onCalculate}
              className="w-full btn-neon-green"
            >
              Calculate Recipe
            </button>
          </div>
        </div>
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
                <h3 className="text-2xl font-light text-white serif">StrainMath™ Chemistry</h3>
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