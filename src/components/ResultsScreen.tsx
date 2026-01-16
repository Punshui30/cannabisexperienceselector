
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { BlendRecommendation } from '../App';
import { BlendCard } from './BlendCard';
import logoImg from '../assets/logo.png';

interface ResultsProps {
  recommendations: BlendRecommendation[];
  onCalculate: (rec: BlendRecommendation) => void;
  onBack: () => void;
  onShare?: (rec: BlendRecommendation) => void;
}

export function ResultsScreen({ recommendations, onCalculate, onBack, onShare }: ResultsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRec = recommendations[activeIndex];

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-sans">

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

      {/* Middle: Card Carousel */}
      <div className="flex-1 px-6 py-4 relative z-10 flex items-center justify-center min-h-0">
        <div className="w-full max-w-xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.98, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.02, x: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <BlendCard recommendation={activeRec} onCalculate={() => onCalculate(activeRec)} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {recommendations.length > 1 && (
            <div className="absolute -left-12 -right-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button
                onClick={() => setActiveIndex(prev => prev > 0 ? prev - 1 : recommendations.length - 1)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/40">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setActiveIndex(prev => prev < recommendations.length - 1 ? prev + 1 : 0)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/40">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Progress Indicators */}
      {recommendations.length > 1 && (
        <div className="flex-shrink-0 py-10 z-10">
          <div className="flex justify-center gap-3">
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-[#00FFD1] w-8 shadow-[0_0_10px_rgba(0,255,209,0.5)]' : 'bg-white/10 w-4'
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-20 z-0">
        <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
      </div>
    </div>
  );
}