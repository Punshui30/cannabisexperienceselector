import { motion } from 'motion/react';
import { SwipeDeck } from './SwipeDeck';
import { PRESET_STACKS } from '../data/presetStacks';
import type { OutcomeExemplar, UIStackRecommendation } from '../types/domain';
import logoImg from '../assets/logo.png';
// Graph Removed
import { TerpeneDisplay } from './visuals/TerpeneDisplay';
import { getGlassCardStyles } from '../lib/glassStyles';
import { StackCompositionBar } from './visuals/StackCompositionBar';

export function PresetStacks({ onBack, onSelect }: { onBack: () => void, onSelect: (stack: OutcomeExemplar) => void }) {
  // No Engine Logic Here - Strictly UI/Static Data

  return (
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden font-sans">
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

      {/* Swipe Deck Area */}
      <div className="flex-1 w-full relative z-10 min-h-0 overflow-hidden">
        <SwipeDeck
          items={PRESET_STACKS}
          renderItem={(exemplar, isActive) => (
            <div className="w-full h-full flex items-center justify-center p-8">
              <motion.button
                className="relative w-full max-w-sm aspect-[3/4] p-8 rounded-3xl bg-white/5 text-left overflow-hidden group hover:bg-white/10 transition-colors flex flex-col"
                style={{
                  ...getGlassCardStyles(exemplar.visualProfile.color),
                  // Override specific layout needs if any
                }}
                onClick={() => {
                  if (!exemplar || typeof exemplar !== 'object') {
                    console.error('CRITICAL: PresetStacks passed invalid exemplar', exemplar);
                    return;
                  }
                  onSelect(exemplar);
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                {/* Iridescent Strip */}
                <div
                  className="absolute top-0 left-0 w-full h-1.5 opacity-80 group-hover:opacity-100 transition-opacity z-20"
                  style={{
                    background: `linear-gradient(90deg, ${exemplar.visualProfile.color}, #fff, ${exemplar.visualProfile.color})`,
                    backgroundSize: '200% 100%',
                    filter: 'blur(1px)'
                  }}
                />

                {/* Visual Layer Removed - Static Card Only */}

                {/* Spacer to push content down if needed, but flex-end handles bottom alignment */}
                {/* We just need to ensure title doesn't overlap graph too much. Graph is top-8 to h-24 (top 32+96=128px). Card height is large. */}

                <div className="relative z-10 flex flex-col flex-1 justify-end pt-32">
                  <h3 className="text-3xl font-light text-white mb-2 leading-tight serif">{exemplar.title}</h3>
                  <p className="text-white/60 text-sm mb-4 leading-relaxed line-clamp-3">{exemplar.subtitle}</p>

                  {/* TERPENE INFO & GRAPH */}
                  {/* VERTICAL STACK VISUALIZATION */}
                  {exemplar.kind === 'stack' && (
                    <div className="flex-1 w-full flex flex-col items-center justify-center my-4 relative">
                      {/* The Vertical Tube */}
                      <div className="w-16 h-32 rounded-lg overflow-hidden flex flex-col-reverse shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
                        {(exemplar.data as UIStackRecommendation).layers.map((layer, idx) => {
                          // Assuming equal visual weight for simplified stack preview
                          // Or calculate relative to duration? Equal is better for "Layering" concept visualization.
                          return layer.cultivars.map((c, cIdx) => (
                            <div
                              key={`${idx}-${cIdx}`}
                              className="flex-1 w-full relative group/segment"
                              style={{ backgroundColor: getCultivarVisuals(c.name).color }}
                            >
                              {/* Shine/Glass Effect overlay per segment */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                            </div>
                          ));
                        })}
                      </div>
                      {/* Label */}
                      <span className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full text-[9px] uppercase tracking-widest text-white/20 rotate-90 origin-left">
                        Protocol
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div className="px-3 py-1.5 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[10px] font-bold text-[#00FFD1] uppercase tracking-widest">
                      View Journey
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#00FFD1] group-hover:bg-[#00FFD1]/10 group-hover:border-[#00FFD1]/40 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          )}
        />
      </div>

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
      </div>
    </div>
  );
}