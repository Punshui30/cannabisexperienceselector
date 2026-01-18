import { useState } from 'react';
import { EngineResult, assertBlend } from '../types/domain';
import { SwipeDeck } from './SwipeDeck';
import { BlendCard } from './BlendCard';
import { ArrowLeft } from 'lucide-react';
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
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden font-sans relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10" />
        <div className="w-full h-full opacity-40 mix-blend-screen scale-110 blur-sm">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1621509426999-56d445c5855e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
      </div>

      <div className="relative z-20 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex-shrink-0 pt-12 px-6 pb-2">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white backdrop-blur-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex gap-4">
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-[#00FFD1] tracking-widest uppercase">
                    StrainMath<span className="text-[8px] align-top opacity-60">™</span> Output
                  </span>
                </div>
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">Confidence: 94%</p>
              </div>

              {onShare && (
                <button
                  onClick={() => onShare(activeRec as any)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#00FFD1] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="text-center mb-4">
            <h1 className="text-3xl font-light text-white mb-2 serif tracking-tight">Your Blends</h1>
            <p className="text-[#00FFD1] text-[10px] uppercase tracking-[0.3em] font-semibold">
              Engine Result #{activeIndex + 1}
            </p>
          </div>
        </div>

        {/* MIDDLE: SWIPE DECK */}
        <div className="flex-1 w-full relative z-10 min-h-0 overflow-hidden">
          <SwipeDeck
            items={recommendations}
            renderItem={(rec, isActive) => (
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-xl h-full max-h-[600px]">
                  <BlendCard recommendation={rec as any} onCalculate={() => onCalculate(rec)} />
                </div>
              </div>
            )}
            onSwipe={(index) => setActiveIndex(index)}
            className="w-full h-full"
          />
        </div>

        {/* FOOTER DISCLAIMER */}
        <div className="flex-shrink-0 py-4 text-center opacity-20 z-0">
          <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
        </div>
      </div>
    </div>
  );
}