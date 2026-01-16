import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StackedRecommendation } from '../App';
import { COLORS, LAYER_COLORS } from '../lib/colors';
import { VoiceFeedback } from './VoiceFeedback';

type Props = {
  recommendation: StackedRecommendation;
  onCalculate: () => void;
};

export function StackedCard({ recommendation, onCalculate }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [showVoiceFeedback, setShowVoiceFeedback] = useState(false);

  const getLayerColor = (idx: number) => {
    if (idx === 0) return LAYER_COLORS.layer1.solid;
    if (idx === 1) return LAYER_COLORS.layer2.solid;
    return LAYER_COLORS.layer3.solid;
  };

  const getLayerGradient = (idx: number) => {
    if (idx === 0) return LAYER_COLORS.layer1.gradient;
    if (idx === 1) return LAYER_COLORS.layer2.gradient;
    return LAYER_COLORS.layer3.gradient;
  };

  return (
    <>
      {/* Main Card - True Black with High Chroma Accents */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl border overflow-hidden shadow-2xl"
          style={{
            backgroundColor: COLORS.background,
            borderColor: COLORS.stack.primary + '40',
          }}
        >
          {/* Inner glow - single hue */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at top right, ${COLORS.stack.primary}, transparent 70%)`,
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLORS.stack.primary}20, transparent)`,
            }}
          />

          <div className="relative p-8">
            {/* Header - Compact */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: COLORS.stack.primary + '20',
                    borderColor: COLORS.stack.primary,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="2.5" rx="1" fill="currentColor" style={{ color: COLORS.stack.primary }} opacity="0.5" />
                    <rect x="2" y="5.75" width="10" height="2.5" rx="1" fill="currentColor" style={{ color: COLORS.stack.primary }} opacity="0.75" />
                    <rect x="2" y="9.5" width="10" height="2.5" rx="1" fill="currentColor" style={{ color: COLORS.stack.primary }} />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: COLORS.stack.primary }}>Stacked</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: COLORS.blend.primary + '20',
                    borderColor: COLORS.blend.primary,
                  }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: COLORS.blend.primary,
                      boxShadow: `0 0 8px ${COLORS.blend.primary}`,
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: COLORS.blend.primary }}>{recommendation.matchScore}% Match</span>
                </motion.div>
              </div>

              <h2 className="text-4xl font-light mb-3" style={{ color: COLORS.foreground }}>
                {recommendation.name}
              </h2>
              <p className="text-base leading-relaxed font-light line-clamp-2 mb-2" style={{ color: COLORS.neutral.text.secondary }}>
                {recommendation.reasoning}
              </p>
              <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.neutral.text.tertiary }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 3.5V7L9.5 8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{recommendation.totalDuration}</span>
              </div>
            </div>

            {/* Layers - Mini preview with high chroma */}
            <div className="space-y-3 mb-6">
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: COLORS.neutral.text.tertiary }}>
                {recommendation.layers.length} Layers
              </div>
              {recommendation.layers.map((layer, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1, type: 'spring' }}
                  className="relative rounded-xl border p-4"
                  style={{
                    backgroundColor: COLORS.neutral.surface,
                    borderColor: getLayerColor(idx) + '40',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium"
                      style={{
                        background: getLayerGradient(idx),
                        color: COLORS.background,
                        boxShadow: `0 0 15px ${getLayerColor(idx)}60`,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium" style={{ color: COLORS.foreground }}>{layer.layerName}</div>
                      <div className="text-xs" style={{ color: COLORS.neutral.text.secondary }}>{layer.timing}</div>
                    </div>
                  </div>
                  <div className="text-sm font-light" style={{ color: COLORS.neutral.text.secondary }}>{layer.purpose}</div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCalculate}
                className="w-full relative group overflow-hidden rounded-xl"
                style={{
                  background: COLORS.stack.gradient,
                  boxShadow: `0 0 30px ${COLORS.stack.primary}40`,
                }}
              >
                {/* Animated shimmer overlay */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 1,
                  }}
                />
                <div className="relative px-6 py-3.5 flex flex-col items-center justify-center">
                  <span className="text-base font-medium" style={{ color: COLORS.foreground }}>Get Pre-Roll Amounts</span>
                  <span className="text-xs mt-1 opacity-70" style={{ color: COLORS.foreground }}>
                    Exact amounts for your pre-roll size
                  </span>
                </div>
              </motion.button>

              {/* Voice Feedback Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                onClick={() => setShowVoiceFeedback(true)}
                whileHover={{ scale: 1.005, y: -1 }}
                whileTap={{ scale: 0.995 }}
                className="w-full px-6 py-3 rounded-xl border text-sm flex items-center justify-center gap-2"
                style={{
                  backgroundColor: `${COLORS.stack.primary}08`,
                  borderColor: `${COLORS.stack.primary}30`,
                  color: COLORS.stack.primary,
                }}
              >
                <motion.svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <rect x="6" y="2" width="4" height="7" rx="2" stroke={COLORS.stack.primary} strokeWidth="1.5" />
                  <path d="M2 7C2 9.76 4.24 12 8 12C11.76 12 14 9.76 14 7" stroke={COLORS.stack.primary} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 12V14M5 14H11" stroke={COLORS.stack.primary} strokeWidth="1.5" strokeLinecap="round" />
                </motion.svg>
                <span>Give Feedback</span>
              </motion.button>

              <button
                onClick={() => setShowDetails(true)}
                className="w-full px-6 py-3 rounded-xl border text-sm"
                style={{
                  backgroundColor: COLORS.neutral.surface,
                  borderColor: COLORS.neutral.border,
                  color: COLORS.foreground,
                }}
              >
                View Details
              </button>
            </div>

            {/* IP Attribution Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 pt-4 border-t text-center"
              style={{ borderColor: COLORS.neutral.border }}
            >
              <div 
                className="text-xs font-light" 
                style={{ color: COLORS.neutral.text.tertiary, opacity: 0.5 }}
              >
                Outcome design powered by StrainMath™
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Outer glow - high chroma */}
        <div 
          className="absolute -inset-4 rounded-[2.5rem] blur-2xl -z-10 opacity-30"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.stack.primary}, transparent 70%)`,
          }}
        />
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 backdrop-blur-xl z-50 flex items-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl border-t max-h-[70vh] overflow-y-auto"
              style={{
                backgroundColor: COLORS.background,
                borderColor: COLORS.neutral.border,
              }}
            >
              <div 
                className="sticky top-0 border-b px-6 py-4 flex items-center justify-between"
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.neutral.border,
                }}
              >
                <h2 className="text-xl font-medium" style={{ color: COLORS.foreground }}>Layer Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: COLORS.neutral.surface }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke={COLORS.foreground} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {recommendation.layers.map((layer, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl p-4 border"
                    style={{
                      backgroundColor: COLORS.neutral.surface,
                      borderColor: getLayerColor(idx) + '40',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
                        style={{
                          background: getLayerGradient(idx),
                          color: COLORS.background,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-base font-medium" style={{ color: COLORS.foreground }}>{layer.layerName}</div>
                        <div className="text-xs" style={{ color: COLORS.neutral.text.secondary }}>{layer.timing}</div>
                      </div>
                    </div>
                    <div className="text-sm mb-3" style={{ color: COLORS.neutral.text.secondary }}>{layer.purpose}</div>
                    <div className="space-y-2">
                      {layer.cultivars.map((c, cidx) => (
                        <div 
                          key={cidx} 
                          className="flex items-center justify-between text-sm rounded-lg px-3 py-2"
                          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                        >
                          <span style={{ color: COLORS.foreground }}>{c.name}</span>
                          <span style={{ color: COLORS.neutral.text.secondary }}>{Math.round(c.ratio * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Feedback Modal */}
      {showVoiceFeedback && (
        <VoiceFeedback
          recommendationName={recommendation.name}
          onClose={() => setShowVoiceFeedback(false)}
          onRecalculate={(constraints) => {
            console.log('Recalculate with constraints:', constraints);
            // Would trigger actual recalculation logic
          }}
        />
      )}
    </>
  );
}