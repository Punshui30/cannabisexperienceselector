import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation } from '../types/domain';
import { CardShell } from './CardShell';
import { SpatialStack } from './SpatialStack';
import { VoiceFeedback } from './VoiceFeedback';
import { QRCodeSVG } from 'qrcode.react';

interface BlendCardProps {
  recommendation: UIBlendRecommendation;
  onShare?: (rec: UIBlendRecommendation) => void;
  onCalculate?: (rec: UIBlendRecommendation) => void;
  index?: number;
}

export function BlendCard({ recommendation, onShare, onCalculate, index = 0 }: BlendCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showVoiceFeedback, setShowVoiceFeedback] = useState(false);

  // Auto-close consultant after analysis
  const handleVoiceComplete = () => {
    setShowVoiceFeedback(false);
    // Optionally trigger something else, but for now just close
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative w-full max-w-sm mx-auto z-10"
      >
        <CardShell className="relative overflow-hidden group">

          {/* HEADER */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-full border border-[#00FFD1]/20 shadow-[0_0_10px_-2px_rgba(0,255,209,0.3)]">
                  Match {recommendation.matchScore}%
                </span>
                {recommendation.kind === 'blend' && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    Blend
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-serif text-white leading-none tracking-tight">
                {recommendation.name}
              </h2>
            </div>

            <button
              onClick={() => onShare?.(recommendation)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              aria-label="Share Blend"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </button>
          </div>

          {/* MAIN VISUAL: SPATIAL STACK (Collapsed State) */}
          <div
            className="relative h-48 w-full bg-black/20 rounded-xl border border-white/5 mb-6 overflow-hidden cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 mix-blend-screen">
              {/* Subtle hinting at content */}
              <div className="w-full px-8">
                <SpatialStack
                  items={recommendation.cultivars.map(c => ({
                    name: c.name,
                    ratio: c.ratio,
                    color: c.color,
                    terpenes: c.prominentTerpenes
                  }))}
                  height={160}
                  compact={true}
                />
              </div>
            </div>

            {/* Readout Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Primary Effect</span>
                <span className="text-sm text-white font-medium">
                  {recommendation.reasoning.split('.')[0]}
                </span>
              </div>
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/40 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>


          {/* ACTIONS */}
          <div className="space-y-3 relative z-10">
            <button
              onClick={() => onCalculate?.(recommendation)}
              className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Calculate Dose</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowVoiceFeedback(true)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                disabled={showVoiceFeedback} // Disable re-click if active
              >
                Consultant
              </button>
              <div className="w-px h-3 bg-white/10 self-center" />
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Detail View
              </button>
            </div>
          </div>

          {/* EXPANDED DETAILS (Spatial Stack + Flavor) */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-white/5 space-y-4 mt-4">

                  {/* Spatial Stack Visualization (Full) */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest">Molecular Composition</h4>
                      <div className="flex gap-2 text-[10px] text-white/40">
                        {recommendation.blendEvaluation?.cannabinoids?.cbd && (
                          <span>CBD {recommendation.blendEvaluation.cannabinoids.cbd.toFixed(1)}%</span>
                        )}
                        {recommendation.blendEvaluation?.cannabinoids?.thc && (
                          <span>THC {recommendation.blendEvaluation.cannabinoids.thc.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>

                    <SpatialStack
                      items={recommendation.cultivars.map(c => ({
                        name: c.name,
                        ratio: c.ratio,
                        color: c.color,
                        terpenes: c.prominentTerpenes
                      }))}
                      height={200}
                    />
                  </div>

                  {/* Flavor Notes / Terpenes */}
                  <div className="grid grid-cols-2 gap-2">
                    {recommendation.cultivars.map((cultivar, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-white/40 mb-1">CULTIVAR 0{i + 1}</div>
                        <div className="text-sm font-medium text-white mb-1 truncate">{cultivar.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {cultivar.prominentTerpenes.slice(0, 2).map(t => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chemistry Analysis (Text) */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">System Analysis</h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {recommendation.reasoning}
                    </p>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </CardShell>
      </motion.div>

      {/* Voice Consultant (Overlay) */}
      <AnimatePresence>
        {showVoiceFeedback && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm px-4">
              <VoiceFeedback
                text={recommendation.reasoning}
                recommendationName={recommendation.name}
                mode="consultation"
                onClose={handleVoiceComplete}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}