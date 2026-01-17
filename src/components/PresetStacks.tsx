```javascript
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OUTCOME_EXEMPLARS } from '../data/presetStacks';
import type { OutcomeExemplar } from '../types/domain';
import logoImg from '../assets/logo.png';


export function PresetStacks({ onBack }: { onBack: () => void }) { // Modified function signature
  const [selectedStack, setSelectedStack] = useState<OutcomeExemplar | null>(null); // Added state

  // No Engine Logic Here - Strictly UI/Static Data

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-sans">

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedStack && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex-none p-6 flex items-center justify-between border-b border-white/10">
              <button onClick={() => setSelectedStack(null)} className="text-white/60 hover:text-white flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </button>
              <h2 className="text-xl font-light text-white serif">{selectedStack.title}</h2>
              <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-md mx-auto space-y-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFD1] to-transparent opacity-50" style={{ backgroundColor: selectedStack.visualProfile.color }} />
                  <h1 className="text-3xl font-medium text-white mb-2">{selectedStack.title}</h1>
                  <p className="text-white/60 text-sm mb-6">{selectedStack.subtitle}</p>
                  <p className="text-white/80 leading-relaxed font-light">{selectedStack.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Target Profile</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4"
                      style={{ borderColor: selectedStack.visualProfile.color, color: selectedStack.visualProfile.color }}>
                      {selectedStack.visualProfile.dominantEffect[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium capitalize">{selectedStack.visualProfile.dominantEffect}</div>
                      <div className="text-xs text-white/40">Dominant Effect</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4 flex items-center justify-between relative z-10">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40 group-hover:text-[#00FFD1] transition-colors">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs uppercase tracking-widest text-white/40">Home</span>
        </button>

        <div className="flex items-center gap-3">
          <img src={logoImg} alt="GO logo" className="w-8 h-auto" />
          <div className="flex flex-col items-end">
            <span className="text-sm font-normal text-white serif">Guided Outcomes</span>
            <span className="text-[10px] text-white/40">powered by <span className="text-[#FFD700] italic serif">StrainMath™</span></span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-8 py-6 text-center">
        <h1 className="text-4xl font-light text-white mb-2 serif tracking-tight">Curated Stacks</h1>
        <p className="text-[#00FFD1] text-[10px] uppercase tracking-[0.3em] font-semibold">Intent Templates</p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 py-4 flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 pb-10">
                transition={{ delay: idx * 0.05 }}
                className="group relative h-64 p-6 glass-card text-left border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#00FFD1]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-2" style={{ color: stack.visualProfile.color }}>{stack.subtitle}</span>
                  <h3 className="text-xl font-light text-white serif mb-3 group-hover:text-[#00FFD1] transition-colors">{stack.title}</h3>
                  <p className="text-xs text-white/40 line-clamp-4 font-light leading-relaxed">{stack.description}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="px-2.5 py-1 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[9px] font-bold text-[#00FFD1] uppercase tracking-widest">
                    Build
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#00FFD1] group-hover:bg-[#00FFD1]/10 group-hover:border-[#00FFD1]/40 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
      </div>
    </div>
  );
}