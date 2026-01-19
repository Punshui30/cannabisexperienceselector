import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { CardShell } from './CardShell';
import { SpatialStack } from './SpatialStack';
import { LiveConsultant } from './LiveConsultant';

interface BlendCardProps {
  recommendation: UIBlendRecommendation;
  onShare?: (rec: UIBlendRecommendation) => void;
  onCalculate?: (rec: UIBlendRecommendation) => void;
  onViewDetail?: (blend: UIBlendRecommendation) => void;
  index?: number;
}

export function BlendCard({ recommendation, onShare, onCalculate, onViewDetail, index = 0 }: BlendCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  // ADAPTER: Convert Blend to Stack Shape for Visualization
  const stackData: UIStackRecommendation = {
    kind: 'stack',
    stackId: recommendation.id,
    id: recommendation.id,
    name: recommendation.name,
    description: recommendation.description || '',
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
      whyThisPhase: 'Synergistic combination',
    }],
    effects: recommendation.effects,
    confidence: recommendation.confidence
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

          {/* VISUALIZATION */}
          <div
            className="relative h-48 w-full bg-black/20 rounded-xl border border-white/5 mb-6 overflow-hidden cursor-pointer"
            onClick={() => onViewDetail?.(recommendation)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
              <div className="w-full px-4">
                <SpatialStack
                  data={stackData}
                  compact={true}
                />
              </div>
            </div>
          </div>

          {/* WHY THIS BLEND - Reasoning Section */}
          {recommendation.reasoning && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] mb-2">
                Why This Blend
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          )}

          {/* EFFECTS TIMELINE - Removed, using Actions instead */}

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
                onClick={() => setShowFeedback(true)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                disabled={showFeedback}
              >
                Feedback
              </button>
              <div className="w-px h-3 bg-white/10 self-center" />
              <button
                onClick={() => onViewDetail?.(recommendation)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Detail View
              </button>
            </div>
          </div>

        </CardShell>
      </motion.div>

      {/* Context-Aware Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <LiveConsultant
            context={{
              recommendation,
              cardType: 'primary' // TODO: Pass actual card type from parent
            }}
            onClose={handleFeedbackClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface BlendCardProps {
  recommendation: UIBlendRecommendation;
  onShare?: (rec: UIBlendRecommendation) => void;
  onCalculate?: (rec: UIBlendRecommendation) => void;
  onViewDetail?: (blend: UIBlendRecommendation) => void;
  index?: number;
}

export function BlendCard({ recommendation, onShare, onCalculate, onViewDetail, index = 0 }: BlendCardProps) {
  const [showVoiceFeedback, setShowVoiceFeedback] = useState(false);

  const handleVoiceComplete = () => {
    setShowVoiceFeedback(false);
  };

  // ADAPTER: Convert Blend to Stack Shape for Visualization
  const stackData: UIStackRecommendation = {
    kind: 'stack',
    stackId: recommendation.id,
    id: recommendation.id,
    name: recommendation.name,
    description: recommendation.description || '',
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
      whyThisPhase: 'Synergistic combination',
    }],
    effects: recommendation.effects,
    confidence: recommendation.confidence
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

          {/* VISUALIZATION */}
          <div
            className="relative h-48 w-full bg-black/20 rounded-xl border border-white/5 mb-6 overflow-hidden cursor-pointer"
            onClick={() => onViewDetail?.(recommendation)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
              <div className="w-full px-4">
                <SpatialStack
                  data={stackData}
                  compact={true}
                />
              </div>
            </div>
          </div>

          {/* WHY THIS BLEND - Reasoning Section */}
          {recommendation.reasoning && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] mb-2">
                Why This Blend
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          )}

          {/* EFFECTS TIMELINE - Removed, using Actions instead */}

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
                disabled={showVoiceFeedback}
              >
                Consultant
              </button>
              <div className="w-px h-3 bg-white/10 self-center" />
              <button
                onClick={() => onViewDetail?.(recommendation)}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Detail View
              </button>
            </div>
          </div>

        </CardShell>
      </motion.div>

      {/* Voice Consultant */}
      <AnimatePresence>
        {showVoiceFeedback && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm px-4">
              <VoiceFeedback
                recommendationName={recommendation.name}
                currentRecommendation={recommendation}
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