import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../lib/colors';

type Props = {
  recommendationName: string;
  onClose: () => void;
  onRecalculate?: (constraints: string) => void;
};

type FeedbackState = 'listening' | 'processing' | 'explaining' | 'choice';

export function VoiceFeedback({ recommendationName, onClose, onRecalculate }: Props) {
  const [state, setState] = useState<FeedbackState>('listening');
  const [userFeedback, setUserFeedback] = useState('');
  const [systemResponse, setSystemResponse] = useState('');

  // Simulated voice feedback examples
  const handleVoiceInput = () => {
    // Simulate voice capture
    const exampleFeedbacks = [
      { 
        user: "I usually don't like Harlequin",
        system: "That makes sense.\n\nHarlequin is included here to balance anxiety and smooth the overall experience. In this blend, its effects are moderated by the other components, which often makes it feel different than when used alone.\n\nYou could try this blend as-is, or I can recalculate while avoiding Harlequin."
      },
      { 
        user: "This feels too energizing",
        system: "I understand that concern.\n\nThe current blend is designed with an energetic profile to match your request for focus and alertness. However, the Harlequin component (20%) helps moderate this energy to prevent overstimulation.\n\nWe could adjust by increasing the calming components or reducing the sativa dominance."
      },
      { 
        user: "Can you make this more relaxing?",
        system: "Absolutely.\n\nThe current recommendation balances focus with a moderate energy level. If we shift toward relaxation, we'll adjust the terpene profile to favor myrcene and linalool, which create a more calming effect.\n\nThis may reduce the alertness you originally requested. Would you like to proceed with that change?"
      }
    ];

    const selected = exampleFeedbacks[Math.floor(Math.random() * exampleFeedbacks.length)];
    
    setState('processing');
    setUserFeedback(selected.user);
    
    setTimeout(() => {
      setState('explaining');
      setSystemResponse(selected.system);
      setTimeout(() => {
        setState('choice');
      }, 1500);
    }, 1000);
  };

  const handleKeepBlend = () => {
    onClose();
  };

  const handleRecalculate = () => {
    if (onRecalculate) {
      onRecalculate(userFeedback);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-h-[90vh] flex flex-col bg-white/5 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
                  Voice Feedback
                </div>
                <h2 className="text-2xl font-light mb-1 text-white">
                  Adjust Recommendation
                </h2>
                <p className="text-sm text-white/50 font-light">
                  Describe your preferences or concerns
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              {/* Listening State */}
              {state === 'listening' && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 rounded-full mb-6 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${COLORS.blend.primary}40, ${COLORS.blend.primary}10)`,
                      border: `2px solid ${COLORS.blend.primary}`,
                      boxShadow: `0 0 40px ${COLORS.blend.primary}40`,
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="15" y="8" width="10" height="18" rx="5" stroke={COLORS.blend.primary} strokeWidth="3" />
                      <path d="M8 20C8 26.63 13.37 32 20 32C26.63 32 32 26.63 32 20" stroke={COLORS.blend.primary} strokeWidth="3" strokeLinecap="round" />
                      <path d="M20 32V38M13 38H27" stroke={COLORS.blend.primary} strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </motion.div>

                  <h3 className="text-xl font-light text-white mb-3">Tap to speak</h3>
                  <p className="text-sm text-white/50 font-light text-center max-w-sm mb-8">
                    Describe what you'd like to adjust or any concerns you have about this recommendation.
                  </p>

                  <motion.button
                    onClick={handleVoiceInput}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-2xl font-medium text-lg"
                    style={{
                      background: COLORS.blend.gradient,
                      color: COLORS.background,
                      boxShadow: `0 0 30px ${COLORS.blend.primary}40`,
                    }}
                  >
                    Start Recording
                  </motion.button>

                  <p className="text-xs text-white/40 mt-6 text-center font-light">
                    Example: "I usually don't like Harlequin" or "This feels too energizing"
                  </p>
                </motion.div>
              )}

              {/* Processing State */}
              {state === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full mb-6"
                    style={{
                      border: `3px solid ${COLORS.blend.primary}30`,
                      borderTopColor: COLORS.blend.primary,
                    }}
                  />
                  <p className="text-white/80 font-light">Processing your feedback...</p>
                  
                  {userFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 px-6 py-4 rounded-2xl border max-w-md"
                      style={{
                        backgroundColor: `${COLORS.blend.primary}10`,
                        borderColor: `${COLORS.blend.primary}30`,
                      }}
                    >
                      <p className="text-sm font-light italic" style={{ color: COLORS.blend.primary }}>
                        "{userFeedback}"
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Explaining State */}
              {(state === 'explaining' || state === 'choice') && (
                <motion.div
                  key="explaining"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* User feedback echo */}
                  <div 
                    className="px-6 py-4 rounded-2xl border"
                    style={{
                      backgroundColor: `${COLORS.blend.primary}10`,
                      borderColor: `${COLORS.blend.primary}30`,
                    }}
                  >
                    <div className="text-xs uppercase tracking-wide text-white/40 mb-2">You said:</div>
                    <p className="text-base font-light italic" style={{ color: COLORS.blend.primary }}>
                      "{userFeedback}"
                    </p>
                  </div>

                  {/* System explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-6 py-5 rounded-2xl border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="text-xs uppercase tracking-wide text-white/40 mb-3">System response:</div>
                    <div className="space-y-3 text-white/90 font-light leading-relaxed whitespace-pre-line">
                      {systemResponse}
                    </div>
                  </motion.div>

                  {/* Choice buttons */}
                  {state === 'choice' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3 pt-4"
                    >
                      <div className="text-sm text-white/60 font-light mb-4">What would you like to do?</div>
                      
                      {/* Keep blend */}
                      <motion.button
                        onClick={handleKeepBlend}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full px-6 py-4 rounded-2xl border text-left"
                        style={{
                          backgroundColor: `${COLORS.blend.primary}15`,
                          borderColor: COLORS.blend.primary,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-base font-medium mb-1" style={{ color: COLORS.blend.primary }}>
                              Try this blend as-is
                            </div>
                            <div className="text-sm text-white/50 font-light">
                              Trust the recommendation
                            </div>
                          </div>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7 10L9 12L13 8" stroke={COLORS.blend.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="10" cy="10" r="8" stroke={COLORS.blend.primary} strokeWidth="2" />
                          </svg>
                        </div>
                      </motion.button>

                      {/* Recalculate */}
                      <motion.button
                        onClick={handleRecalculate}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full px-6 py-4 rounded-2xl border text-left"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-base font-medium text-white mb-1">
                              Recalculate with constraints
                            </div>
                            <div className="text-sm text-white/50 font-light">
                              Adjust based on your feedback
                            </div>
                          </div>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10 4V1M10 1L7 4M10 1L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
