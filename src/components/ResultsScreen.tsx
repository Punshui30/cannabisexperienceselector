import { useState } from 'react';
import { EngineResult, UIBlendRecommendation, assertBlend } from '../types/domain';
import { adaptEngineResult } from '../lib/adaptEngineResult';
import { SwipeDeck } from './SwipeDeck';
import { BlendCard } from './BlendCard';
import { PaginationDots } from './PaginationDots';
import { Layers, Share2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface ResultsProps {
  recommendations: UIBlendRecommendation[]; // Array of UI Recs
  onCalculate: (rec: any) => void;
  onBack: () => void;
  onShare?: (rec: any) => void;
  onViewDetail?: (blend: UIBlendRecommendation) => void;
  onOpenConsultant: () => void;
}

export function ResultsScreen({ recommendations, onCalculate, onBack, onShare, onViewDetail, onOpenConsultant }: ResultsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRec = recommendations[activeIndex];

  // Rule 3: Enforce Data Contract (Crash if Stack passed to Results)
  if (activeRec) {
    assertBlend(activeRec);
  }

  return (
    <div className="w-full flex flex-col bg-transparent font-sans relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10 opacity-50" />
      </div>

      <div className="relative z-20 flex flex-col animate-in fade-in zoom-in-95 duration-500"> {/* Added subtle entry animation for Refactor Transitions */}
        {/* DEBUG OVERLAY (Bottom) - Development Only */}
        {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true') && (
          <div className="absolute bottom-[-200px] left-0 w-full z-50 pointer-events-none p-4 opacity-50 hover:opacity-100 transition-opacity">
            <h3 className="text-red-500 font-bold text-xs">DEBUG</h3>
            <pre className="text-[9px] text-green-400 font-mono whitespace-pre-wrap h-24 overflow-y-auto pointer-events-auto select-text bg-black/80 border border-white/10">
              {JSON.stringify(recommendations, null, 2)}
            </pre>
          </div>
        )}

        {/* HEADER */}
        <div className="flex-shrink-0 pt-4 px-6 max-[360px]:px-4 max-[360px]:pt-2 pb-16 relative z-30">
          <div className="flex justify-between items-start mb-4"> {/* Density: mb-8 -> mb-4 */}
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-md"
            >
              <ArrowLeft size={12} className="text-white/40 group-hover:text-white transition-colors" />
              <span className="text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Back</span>
            </button>

            <div className="flex gap-4">
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/10 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]" />
                  <span className="text-[9px] font-medium text-white/60 uppercase tracking-widest">Live v2.5</span>
                </div>
              </div>

              {onShare && (
                <button
                  onClick={() => onShare(activeRec as any)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-[#00FFD1] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-[#00FFD1] text-[9px] uppercase tracking-[0.4em] mb-1 opacity-80">
              Engine Result #{activeIndex + 1}
            </p>
            <h1 className="text-3xl font-light text-white serif tracking-tight">Your Blends</h1> {/* Density: text-4xl -> text-3xl */}
          </div>
        </div>

        {/* SWIPE DECK - Gestures & Animation */}
        <div className="w-full relative z-10 flex-1 flex flex-col justify-center pb-8 min-h-[400px]">
          {recommendations.length > 0 ? (
            <SwipeDeck
              items={recommendations}
              onSwipe={(idx) => setActiveIndex(idx)}
              className="max-w-md w-full h-full flex-1 mx-auto px-4"
              renderItem={(rec, isActive) => (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <BlendCard
                    recommendation={rec}
                    onShare={onShare}
                    onCalculate={onCalculate}
                    onViewDetail={onViewDetail}
                    onOpenConsultant={onOpenConsultant}
                    index={recommendations.indexOf(rec)}
                  />
                </div>
              )}
            />
          ) : (
            <div className="text-white text-center w-full">Loading recommendations...</div>
          )}
        </div>

        {/* PAGINATION DOTS - Outside card container */}
        <div className="w-full relative z-10 mt-12 mb-6">
          <PaginationDots
            currentIndex={activeIndex}
            totalItems={recommendations.length}
          />
        </div>

        {/* FOOTER DISCLAIMER */}
        <div className="flex-shrink-0 py-4 text-center opacity-20 z-0">
          <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath™ Intellectual Property</p>
        </div>

        {/* FLOATING ACTION BUTTON - Calculate Dose (Bottom Left) */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCalculate(activeRec)}
          className="fixed bottom-6 left-6 z-50 px-6 py-4 rounded-full bg-gradient-to-br from-[#00FFD1] to-[#00E0B8] text-black shadow-[0_0_30px_rgba(0,255,209,0.4)] flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
          style={{
            boxShadow: '0 8px 32px rgba(0, 255, 209, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5v14" />
          </svg>
          <span>Calculate Dose</span>
        </motion.button>
      </div>
    </div>
  );
}