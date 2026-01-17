
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EngineResult, assertBlend } from '../types/domain';
import { SwipeDeck } from './SwipeDeck';
import { BlendCard } from './BlendCard';
import logoImg from '../assets/logo.png';


interface ResultsProps {
  recommendations: EngineResult[];
  onCalculate: (rec: EngineResult) => void;
  onBack: () => void;
  onShare?: (rec: EngineResult) => void;
}

export function ResultsScreen({ recommendations, onCalculate, onBack, onShare }: ResultsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRec = recommendations[activeIndex];

  // Rule 3: Enforce Data Contract (Crash if Stack passed to Results)
  if (activeRec) {
    assertBlend(activeRec);
  }

  return (
    <div className="w-full flex-grow flex flex-col bg-transparent overflow-hidden font-sans relative">

      {/* Figma Branding Persistent */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4 relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-8">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40 group-hover:text-[#00FFD1] transition-colors">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs uppercase tracking-widest text-white/40">Back</span>
          </button>


          <div className="flex items-center gap-3">
            <img src={logoImg} alt="GO logo" className="w-8 h-auto" />
            <div className="flex flex-col items-end">
              <span className="text-sm font-normal text-white serif">Guided Outcomes</span>
              <span className="text-[10px] text-white/40">powered by <span className="text-[#FFD700] italic serif">StrainMath™</span></span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-light text-white mb-2 serif tracking-tight">Your Blends</h1>
          <p className="text-[#00FFD1] text-[10px] uppercase tracking-[0.3em] font-semibold">Engine Result #{activeIndex + 1}</p>
        </div>
      </div>

      {/* Middle: Swipe Deck */}
      <div className="flex-1 w-full relative z-10 min-h-0">
        <SwipeDeck
          items={recommendations}
          renderItem={(rec, isActive) => (
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="w-full max-w-xl">
                <BlendCard recommendation={rec as any} onCalculate={() => onCalculate(rec)} />
              </div>
            </div>
          )}
          onSwipe={(index) => setActiveIndex(index)}
          className="w-full h-full"
        />
      </div>

      {/* Bottom: Progress Indicators (Managed by SwipeDeck internal or external) */}
      {/* We can keep external indicators for context if desired, or rely on SwipeDeck's internal ones. 
           User requested NO multi-card grids/previews. 
           SwipeDeck has internal dots, so we can remove this external block to avoid duplication.
           But wait, SwipeDeck internal dots are optional. Let's rely on SwipeDeck internal for encapsulation.
       */}

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-20 z-0">
        <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
      </div>
    </div >
  );
}