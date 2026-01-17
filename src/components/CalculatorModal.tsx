
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EngineResult, assertBlend } from '../types/domain';

interface CalculatorProps {
  recommendation: EngineResult;
  onClose: () => void;
}

interface CalculationResult {
  cultivar: string;
  grams: number;
  percentage: number;
  role: string;
}

export function CalculatorModal({ recommendation, onClose }: CalculatorProps) {
  // Guard: Calculator only works for Blends
  if (recommendation.kind !== 'blend') return null;

  const [prerollSize, setPrerollSize] = useState(1.0);
  const [showResults, setShowResults] = useState(false);

  const calculateBlend = (): CalculationResult[] => {
    return recommendation.cultivars.map((c, idx) => {
      const isFoundation = idx === 0;
      const isBalance = idx === 1;
      const role = isFoundation ? 'Foundation' : isBalance ? 'Balance' : 'Accent';

      return {
        cultivar: c.name,
        grams: +(prerollSize * c.ratio).toFixed(3),
        percentage: c.ratio * 100,
        role,
      };
    });
  };

  const blendResults = calculateBlend();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center backdrop-blur-2xl bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-xl max-h-[90vh] flex flex-col glass-card border-white/10 bg-black/60 rounded-t-[2.5rem] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00FFD1]">Portion Calculation</span>
                </div>
                <h2 className="text-3xl font-light text-white mb-1 serif">
                  {recommendation.name}
                </h2>
                <p className="text-xs text-white/30 font-light">
                  Exact cultivar weights based on total weight
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-8 overflow-y-auto bg-black/20">

            {/* Preroll Size Selector */}
            <div className="mb-10">
              <label className="block text-sm text-white/40 uppercase tracking-widest font-semibold mb-6">Target Weight (Grams)</label>

              <div className="flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00FFD1]/5 rounded-2xl blur-xl transition-all" />
                  <input
                    type="number"
                    value={prerollSize}
                    onChange={(e) => {
                      setPrerollSize(Math.max(0.1, Math.min(10, +e.target.value)));
                      setShowResults(false);
                    }}
                    step="0.1"
                    className="relative w-full px-8 py-8 bg-white/5 border border-white/10 rounded-2xl text-white text-6xl font-light focus:border-[#00FFD1]/50 focus:outline-none transition-all text-center serif"
                  />
                </div>

                <div className="flex gap-2">
                  {[0.5, 0.75, 1.0, 1.5, 2.0].map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setPrerollSize(size);
                        setShowResults(false);
                      }}
                      className={`flex-1 py-4 rounded-xl text-sm font-bold tracking-widest transition-all ${prerollSize === size
                        ? 'bg-[#00FFD1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)] scale-[1.05]'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                      {size}g
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {!showResults && (
              <button
                onClick={() => setShowResults(true)}
                className="w-full btn-neon-green"
              >
                Perform Calculation
              </button>
            )}

            {/* Results Section */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-6 pt-4 border-t border-white/5">
                    Weight Distribution Breakdown
                  </div>

                  {blendResults.map((result, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative p-6 glass-card border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-[#00FFD1] font-bold mb-1 opacity-60">Step {idx + 1}</span>
                          <span className="text-lg text-white font-medium">{result.cultivar}</span>
                          <span className="text-[9px] text-white/20 uppercase tracking-[0.2em]">{result.role} • {Math.round(result.percentage)}%</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl text-white font-light serif">{result.grams}</span>
                          <span className="text-sm text-white/20 font-bold tracking-widest uppercase">g</span>
                        </div>
                      </div>

                      {/* Visual progress for each component */}
                      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#00FFD1] to-[#00FFD1]/40"
                        />
                      </div>
                    </motion.div>
                  ))}

                  <div className="pt-8 text-center">
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] mb-8">Guided Outcomes Calculation Layer</p>
                    <button
                      onClick={onClose}
                      className="px-10 py-3 rounded-full border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white hover:border-white/40 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}