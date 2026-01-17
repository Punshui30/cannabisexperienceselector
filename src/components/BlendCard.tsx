
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { UIBlendRecommendation } from '../lib/engineAdapter';
import { VoiceFeedback } from './VoiceFeedback';

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
            renderedIDs: recommendation.cultivars.map(c => c.name), // Using name as ID proxy since normalized
            count: recommendation.cultivars.length
          });
        }}
      >
        {/* Neon Glow Outer */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFD110] to-[#BF5AF2] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />

        <div className="relative glass-card border-white/5 bg-black/40 overflow-hidden">
          {/* Top Header Section */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00FFD1]">Match Fidelity</span>
                </div>
                <h2 className="text-4xl font-light text-white mb-2 serif tracking-tight">
                  {recommendation.name}
                </h2>
                <div className="text-sm text-white/40 leading-relaxed font-light line-clamp-2 max-w-sm">
                  {recommendation.reasoning}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-3xl font-light text-white serif">{recommendation.matchScore}%</span>
                <span className="text-[9px] uppercase tracking-widest text-white/20">Score</span>
              </div>
            </div>

            {/* Cultivar Stack - Dynamic Visual Representation */}
            <div className="flex gap-4 items-end justify-center mb-8 h-[240px]">

              {/* Left Side: Labels */}
              <div className="flex flex-col-reverse justify-between h-full py-4 text-right min-w-[100px]">
                {recommendation.cultivars.map((cultivar, idx) => (
                  <div key={idx} className="flex flex-col justify-center h-full">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${[
                      'text-[#4C1D95]',
                      'text-[#5B21B6]',
                      'text-[#7C3AED]',
                      'text-[#8B5CF6]',
                      'text-[#A78BFA]',
                      'text-[#C4B5FD]'
                    ][idx % 6]}`}>
                      {cultivar.profile}
                    </span>
                    <span className="text-xs text-white/40 font-light mt-0.5">
                      {cultivar.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Center Visual Stack */}
              <div className="w-16 h-full flex flex-col-reverse rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 bg-white/5">
                {recommendation.cultivars.map((cultivar, idx) => {
                  const colors = [
                    'bg-[#4C1D95]', // Deepest Purple
                    'bg-[#5B21B6]',
                    'bg-[#7C3AED]',
                    'bg-[#8B5CF6]',
                    'bg-[#A78BFA]',
                    'bg-[#C4B5FD]'  // Lightest Lavender
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <motion.div
                      key={`${cultivar.name}-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${cultivar.ratio * 100}%`, opacity: 1 }}
                      transition={{ delay: 0.5 + (idx * 0.1), duration: 0.8, ease: "easeOut" }}
                      className={`w-full ${colorClass} relative group border-t border-white/10 first:border-t-0`}
                    />
                  );
                })}
              </div>

              {/* Right Side: Percentages */}
              <div className="flex flex-col-reverse justify-between h-full py-4 min-w-[60px]">
                {recommendation.cultivars.map((cultivar, idx) => (
                  <div key={idx} className="flex flex-col justify-center h-full pl-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-light text-white serif">
                        {Math.round(cultivar.ratio * 100)}
                      </span>
                      <span className="text-[10px] text-white/30">%</span>
                    </div>
                  </div>
                ))}
              </div>
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
                Timeline
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
              className="w-full max-w-md glass-card p-8 border-[#00FFD1]/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-light text-white serif">Release Timeline</h3>
                <button onClick={() => setShowDetails(false)} className="text-white/20 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {recommendation.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <span className="w-20 text-[10px] uppercase tracking-widest text-[#00FFD1] font-bold mt-1">{item.time}</span>
                    <span className="flex-1 text-sm text-white/70 leading-relaxed font-light">{item.feeling}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Total Duration</span>
                  <span className="text-lg text-[#00FFD1] font-medium">{recommendation.effects.duration}</span>
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