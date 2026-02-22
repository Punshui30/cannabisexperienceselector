import { useState, useEffect } from 'react';
import { UIBlendRecommendation, assertBlend } from '../types/domain';
import { SwipeDeck } from './SwipeDeck';
import { BlendCard } from './BlendCard';
import { PaginationDots } from './PaginationDots';
import { Share2, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShowEvidencePanel } from './ShowEvidencePanel';
import { Intelligence } from '../lib/merchantIntelligence';

interface ResultsProps {
  recommendations: UIBlendRecommendation[]; // Array of UI Recs
  onCalculate: (rec: any) => void;
  onBack: () => void;
  onConcludeSession?: () => void; // New explicit session conclusion action
  onViewDetail?: (blend: UIBlendRecommendation) => void;
  onOpenConsultant: () => void;
}

export function ResultsScreen({ recommendations, onCalculate, onBack, onConcludeSession, onViewDetail, onOpenConsultant }: ResultsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showEvidence, setShowEvidence] = useState(false);
  const activeRec = recommendations[activeIndex];

  // Rule 3: Enforce Data Contract (Crash if Stack passed to Results)
  if (activeRec) {
    assertBlend(activeRec);
  }

  // Silent log on mount/change for merchant intelligence
  useEffect(() => {
    if (activeRec) {
      Intelligence.logResolution({
        blendId: activeRec.id,
        blendName: activeRec.name,
        confidenceScore: (activeRec.matchScore || 90) / 100,
        components: activeRec.cultivars.map(c => ({ name: c.name, ratio: c.ratio })),
        outcomeCategory: (activeRec.outcomeCategory as any) || 'Other',
        commentary: activeRec.reasoning,
        inputMode: 'assisted'
      });
    }
  }, [activeRec?.id]);

  return (
    <div className="w-full flex flex-col bg-transparent font-sans relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10 opacity-50" />
      </div>

      <div className="relative z-20 flex flex-col animate-in fade-in zoom-in-95 duration-500">

        {/* HEADER */}
        <div className="flex-shrink-0 pt-16 px-6 max-[360px]:px-4 pb-16 relative z-30" style={{ paddingTop: 'max(4rem, env(safe-area-inset-top))' }}>
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md active:scale-90"
            >
              <ArrowLeft size={16} className="text-white/60 group-hover:text-white transition-colors" />
              <span className="text-[10px] uppercase tracking-widest text-white/60 group-hover:text-white transition-colors font-bold">Back</span>
            </button>

            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_8px_#00FFD1]" />
                <span className="text-[9px] font-medium text-white/60 uppercase tracking-widest">v2.8</span>
              </div>

              {/* BEAST MODE: Evidence Trigger */}
              {activeRec?.decisionReceipt && (
                <button
                  onClick={() => setShowEvidence(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#BF5AF2]/10 border border-[#BF5AF2]/30 hover:bg-[#BF5AF2]/20 transition-all active:scale-95"
                >
                  <BookOpen size={12} className="text-[#BF5AF2]" />
                  <span className="text-[9px] font-bold text-[#BF5AF2] uppercase tracking-[0.1em]">Why this match?</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <h1 className="text-4xl font-serif text-white tracking-tight drop-shadow-lg">Your Experience</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2">Personalized Recommendation</p>
          </div>
        </div>

        {/* SWIPE DECK - Gestures & Animation */}
        <div className="w-full relative z-10 flex-1 flex flex-col justify-center pb-8 min-h-[460px]">
          {recommendations.length > 0 ? (
            <>
              {/* NAVIGATION ARROWS (Floating) */}
              {recommendations.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2 z-40 pointer-events-none">
                  <button
                    onClick={() => activeIndex > 0 && setActiveIndex(activeIndex - 1)}
                    className={`w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all active:scale-90 ${activeIndex === 0 ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}
                  >
                    <ArrowLeft size={18} className="text-white" />
                  </button>
                  <button
                    onClick={() => activeIndex < recommendations.length - 1 && setActiveIndex(activeIndex + 1)}
                    className={`w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all active:scale-90 ${activeIndex === recommendations.length - 1 ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}
                  >
                    <ArrowRight size={18} className="text-white" />
                  </button>
                </div>
              )}

              <SwipeDeck
                items={recommendations}
                currentIndex={activeIndex}
                onIndexChange={setActiveIndex}
                className="max-w-md w-full h-full flex-1 mx-auto"
                renderItem={(rec, isActive) => (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <BlendCard
                      recommendation={rec as UIBlendRecommendation}
                      onCalculate={onCalculate}
                      onViewDetail={onViewDetail}
                      onOpenConsultant={onOpenConsultant}
                      index={recommendations.indexOf(rec)}
                      total={recommendations.length}
                    />
                  </div>
                )}
              />
            </>
          ) : (
            <div className="text-white text-center w-full underline italic">Resolving engine outputs...</div>
          )}
        </div>

        {/* PAGINATION DOTS */}
        <PaginationDots
          currentIndex={activeIndex}
          totalItems={recommendations.length}
        />

        {/* SESSION ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="w-full relative z-10 mb-8 px-6"
        >
          <div className="max-w-xs mx-auto">
            <button
              onClick={onConcludeSession}
              className="w-full bg-white/5 backdrop-blur-xl text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 font-medium hover:bg-white/10 transition-all active:scale-95 shadow-lg border border-white/10"
            >
              <Share2 size={18} />
              <span className="text-xs uppercase tracking-widest font-black">Save This Blend</span>
            </button>
          </div>
        </motion.div>

        {/* FOOTER */}
        <div className="flex-shrink-0 py-4 text-center opacity-20 z-0">
          <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath™ Intellectual Property</p>
        </div>

        {/* FLOATING ACTION BUTTON */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCalculate(activeRec)}
          className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-full bg-gradient-to-br from-[#00FFD1] to-[#00E0B8] text-black shadow-[0_0_30px_rgba(0,255,209,0.4)] flex items-center gap-2 font-black text-xs uppercase tracking-widest"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5v14" />
          </svg>
          <span>Get Dosing Guide</span>
        </motion.button>
      </div>

      {/* BEAST MODE: Evidence Overlay */}
      <AnimatePresence>
        {showEvidence && activeRec?.decisionReceipt && (
          <ShowEvidencePanel
            receipt={activeRec.decisionReceipt}
            onClose={() => setShowEvidence(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}