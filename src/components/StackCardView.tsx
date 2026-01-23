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
}

export function StackCardView({ stack, onBack, onViewDetails }: StackCardViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading for smooth animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Determine theme color based on stack content
  const themeColor = '#8B5CF6'; // Default violet for stacks

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-20 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

        {/* Back Button */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
        </div>

        <div className="text-center px-6">
          <h1 className="text-xl font-serif text-white tracking-tight">
            Curated Stack
          </h1>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
            Layered Protocol
          </p>
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
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      border: `1px solid ${themeColor}40`
                    }}
                  >
                    <Layers size={24} style={{ color: themeColor }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-serif text-white mb-1">
                      {stack.name}
                    </h2>
                    <p className="text-sm text-white/70 leading-relaxed">
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
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium hover:from-[#7C3AED] hover:to-[#6D28D9] transition-all active:scale-95 shadow-lg shadow-purple-500/25"
            >
              <span>View Full Protocol</span>
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}