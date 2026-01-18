import { motion } from 'motion/react';
import { SwipeDeck } from './SwipeDeck';
import { PRESET_STACKS } from '../data/presetStacks';
import type { OutcomeExemplar, UIStackRecommendation } from '../types/domain';
import logoImg from '../assets/logo.png';
import { getGlassCardStyles } from '../lib/glassStyles';
import { getCultivarVisuals } from '../lib/cultivarData';
import { SpatialStack } from './SpatialStack';

// ... (keep usage in JSX)

{/* VERTICAL STACK VISUALIZATION - SpatialStack */ }
{
  exemplar.kind === 'stack' && (
    <div className="flex-1 w-full flex items-center justify-center my-4">
      <SpatialStack data={exemplar.data as UIStackRecommendation} compact={true} />
    </div>
  )
}

// ...
import { CardShell } from './CardShell';

export function PresetStacks({ onBack, onSelect }: { onBack: () => void, onSelect: (stack: OutcomeExemplar) => void }) {
  // ...

  return (
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden font-sans">
      {/* ... keeping header ... */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4 flex items-center justify-between relative z-10">
        {/* ... */}
      </div>

      <div className="flex-shrink-0 px-8 py-6 text-center">
        {/* ... */}
      </div>

      {/* Swipe Deck Area - Corrected */}
      <div className="flex-1 w-full relative z-10 min-h-0 overflow-hidden">
        <SwipeDeck
          items={PRESET_STACKS}
          renderItem={(exemplar, isActive) => (
            <div className="w-full h-full flex items-center justify-center p-8">
              <CardShell
                className="w-full max-w-sm aspect-[3/4] text-left cursor-pointer flex flex-col"
                color={exemplar.visualProfile.color}
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
                {/* Iridescent Strip */}
                <div
                  className="absolute top-0 left-0 w-full h-1.5 opacity-80 group-hover:opacity-100 transition-opacity z-20"
                  style={{
                    background: `linear-gradient(90deg, ${exemplar.visualProfile.color}, #fff, ${exemplar.visualProfile.color})`,
                    backgroundSize: '200% 100%',
                    filter: 'blur(1px)'
                  }}
                />

                <div className="relative z-10 flex flex-col flex-1 justify-end pt-12">
                  {/* Title Block */}
                  <div className="mb-4">
                    <h3 className="text-3xl font-light text-white mb-2 leading-tight serif">{exemplar.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{exemplar.subtitle}</p>
                  </div>

                  {/* VERTICAL STACK VISUALIZATION - ProtocolStrip (RESTORED) */}
                  {exemplar.kind === 'stack' && (
                    <div className="flex-1 w-full flex items-center justify-center my-4 scale-75 origin-center">
                      <ProtocolStrip data={exemplar.data as UIStackRecommendation} />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
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
              </CardShell>
            </div>
          )}
        />
      </div>

      {/* ... footer ... */}
    </div>
  );
}