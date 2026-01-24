/**
 * STACK CARD VIEW (PREVIEW)
 * -------------------------
 * This is a non-terminal visual preview screen.
 * - NO protocol explanation
 * - NO calculation or session terminal logic
 * - Primary intent: Beauty + Visual Hierarchy
 */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Layers, ChevronRight } from 'lucide-react';
import type { UIStackRecommendation } from '../types/domain';
import { CardShell } from './CardShell';
import { SpatialStack } from './SpatialStack';

interface StackCardViewProps {
  stack: UIStackRecommendation;
  onBack: () => void;
  onViewDetails: () => void;
  setActiveStackId: (id: string | null) => void;
}

export function StackCardView({ stack, onBack, onViewDetails, setActiveStackId }: StackCardViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // HARD RESET: Prevent auto-entry into detail view from leftover state
    console.log('[MOUNT]', 'StackCardView: Resetting activeStackId');
    setActiveStackId(null);

    // Simulate loading for smooth animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [setActiveStackId]);

  // Determine theme color based on stack content
  const themeColor = '#8B5CF6'; // Default violet for stacks

  return (
    <div className="relative flex flex-col pt-4">
      {/* Header Wrapper (NO overflow hidden to prevent clipping) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-[120px] pt-12 pb-4 flex flex-col justify-end"
      >
        {/* Gradient Mask (Absolute child, allows text to breathe in parent) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none overflow-hidden" />

        {/* Back Button */}
        <div className="absolute left-6 bottom-4 z-20">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
        </div>

        {/* Text Layer (Relative, with real padding) */}
        <div className="px-10 relative z-10 pb-2">
          <h1 className="text-2xl font-serif text-white tracking-tight leading-tight text-center">
            {stack.name}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-px w-3 bg-[#00FFD1] opacity-40" />
            <p className="text-[9px] text-[#00FFD1] uppercase tracking-[0.2em] font-bold opacity-90">
              Protocol Preview
            </p>
            <span className="h-px w-3 bg-[#00FFD1] opacity-40" />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 pb-8">
        <div className="max-w-md mx-auto space-y-8">

          {/* Stack Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <CardShell
              color={themeColor}
              className="!p-0"
              style={{ minHeight: '200px' }}
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header (Secondary/Contextual) */}
                <div className="flex items-center gap-4 mb-8 pt-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      border: `1px solid ${themeColor}40`
                    }}
                  >
                    <Layers size={20} style={{ color: themeColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/50 leading-relaxed font-light line-clamp-2 italic">
                      {stack.description}
                    </p>
                  </div>
                </div>

                {/* Stack Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Layers</span>
                    <span className="text-sm font-medium">{stack.layers?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Duration</span>
                    <span className="text-sm font-medium">{stack.totalDuration}</span>
                  </div>
                  {stack.confidence && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Confidence</span>
                      <span className="text-sm font-medium">{Math.round(stack.confidence * 100)}%</span>
                    </div>
                  )}
                </div>

                {/* Rich Visual Deck - SpatialStack (Restored) */}
                <div className="flex-1 w-full flex items-center justify-center my-4 overflow-hidden">
                  <SpatialStack data={stack} />
                </div>
              </div>
            </CardShell>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={onViewDetails}
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white/90 rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-lg group"
            >
              <span className="text-sm">View Full Protocol</span>
              <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}