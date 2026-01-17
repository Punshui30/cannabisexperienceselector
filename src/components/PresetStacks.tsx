import { motion, AnimatePresence } from 'motion/react';
import { PRESET_STACKS, PresetStack } from '../data/presetStacks';
import logoImg from '../assets/logo.png';

export interface PresetStacksProps {
  onBack: () => void;
  onSelectPreset?: (preset: PresetStack) => void;
}

export function PresetStacks({ onBack, onSelectPreset }: PresetStacksProps) {

  // No Engine Logic Here - Strictly UI/Static Data

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-sans">

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
          <AnimatePresence mode="wait">
            {PRESET_STACKS.map((stack, idx) => (
              <motion.button
                key={stack.id}
                onClick={() => onSelectPreset?.(stack)}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
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