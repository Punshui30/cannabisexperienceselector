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
      {/* Main Card */}
      <div className="relative w-full max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00FFD1]/30 bg-[#00FFD1]/10 text-[#00FFD1] text-xs font-medium uppercase tracking-wider mb-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] animate-pulse" />
              Social
            </motion.div>

            <h2 className="text-4xl font-light text-white mb-2">{recommendation.name}</h2>
            <p className="text-white/40 text-sm font-light">{recommendation.reasoning}</p>
          </div>

          {/* The Stack Visualization */}
          <div className="flex items-center justify-center gap-8 mb-12">

            {/* Left Labels */}
            <div className="flex flex-col justify-between h-[300px] py-4 text-right">
              {recommendation.layers.map((layer, idx) => (
                <div key={idx} className="flex flex-col justify-center h-1/3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? 'text-[#8B5CF6]' :
                    idx === 1 ? 'text-[#C084FC]' : 'text-[#E879F9]'
                    }`}>
                    {layer.purpose}
                  </span>
                  <span className="text-xs text-white/40 font-light mt-0.5">
                    {layer.cultivars[0]?.name || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>

            {/* Center Visual Stack */}
            <div className="w-16 h-[300px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
              {recommendation.layers.map((layer, idx) => {
                // Reverse index for visual stacking (Foundation at bottom)
                // But data comes top-down usually. Let's assume input order matches visual top-down or bottom-up?
                // Typically "Foundation" is bottom. 
                // Let's assume the array is ordered [Access/Accent, Balance, Foundation] or similar.
                // Actually based on screenshot: Accent (Top), Balance (Mid), Foundation (Bottom).
                // Let's map colors based on index for now assuming generic order.

                const colors = [
                  'bg-[#8B5CF6]', // Deep Purple (Bottom/Foundation)
                  'bg-[#C084FC]', // Mid Purple (Mid/Balance) 
                  'bg-[#E879F9]'  // Light Purple/Pink (Top/Accent)
                ];

                // We need to reverse the rendering order if the first item is "Foundation" (bottom)
                // or just map styles correctly. 
                // Let's assume input order is [Foundation, Balance, Accent]. 
                // To display Foundation at bottom, we need flex-col-reverse? Or map in reverse?
                // The screenshot shows 45% / 35% / 20%. 

                return (
                  <motion.div
                    key={idx}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${layer.cultivars[0]?.ratio * 100}%`, opacity: 1 }}
                    transition={{ delay: 0.5 + (idx * 0.2), duration: 0.8, ease: "easeOut" }}
                    className={`w-full ${idx === 0 ? 'bg-[#5B21B6]' : // Foundation
                      idx === 1 ? 'bg-[#A855F7]' : // Balance
                        'bg-[#F0ABFC]'               // Accent
                      } relative group`}
                  >
                  </motion.div>
                );
              }).reverse()}
            </div>

            {/* Right Percentages */}
            <div className="flex flex-col justify-between h-[300px] py-4">
              {recommendation.layers.map((layer, idx) => (
                <div key={idx} className="flex flex-col justify-center h-1/3">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] w-4 bg-white/20"></div>
                    <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-mono">
                      {Math.round(layer.cultivars[0]?.ratio * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onCalculate}
            className="w-full py-4 rounded-xl bg-[#D946EF] text-white font-medium text-sm tracking-wide shadow-lg shadow-[#D946EF]/25 hover:bg-[#C026D3] transition-colors"
          >
            Calculate Portions
          </motion.button>

        </motion.div>
      </div >

      {/* Details Modal */}
      <AnimatePresence>
        {
          showDetails && (
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
          )
        }
      </AnimatePresence >

      {/* Voice Feedback Modal */}
      {
        showVoiceFeedback && (
          <VoiceFeedback
            recommendationName={recommendation.name}
            onClose={() => setShowVoiceFeedback(false)}
            onRecalculate={(constraints) => {
              console.log('Recalculate with constraints:', constraints);
              // Would trigger actual recalculation logic
            }}
          />
        )
      }
    </>
  );
}