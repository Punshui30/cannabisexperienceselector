import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { CardShell } from './CardShell';
import { SpatialStack } from './SpatialStack';

interface BlendCardProps {
  recommendation: UIBlendRecommendation;
  onShare?: (rec: UIBlendRecommendation) => void;
  onCalculate?: (rec: UIBlendRecommendation) => void;
  onViewDetail?: (blend: UIBlendRecommendation) => void;
  onOpenConsultant?: () => void; // Optional because SwipeDeck/Results logic
  index?: number;
}

export function BlendCard({ recommendation, onShare, onCalculate, onViewDetail, onOpenConsultant, index = 0 }: BlendCardProps) {
  // @ts-expect-error UI behavior preserved intentionally
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive accent color from outcome category
  const outcomeColors = {
    'Focus': '#00FFD1',
    'Relax': '#A855F7',
    'Sleep': '#6366F1',
    'Social': '#EAB308',
    'Relief': '#34D399',
    'Other': '#ffffff'
  };

  // Need to find outcome category - check reasoning or effect tags
  let category: keyof typeof outcomeColors = 'Other';
  const text = (recommendation.reasoning || '').toLowerCase();
  if (text.includes('focus') || text.includes('energy')) category = 'Focus';
  else if (text.includes('relax') || text.includes('calm')) category = 'Relax';
  else if (text.includes('sleep') || text.includes('night')) category = 'Sleep';
  else if (text.includes('social') || text.includes('fun')) category = 'Social';
  else if (text.includes('pain') || text.includes('relief')) category = 'Relief';

  const accentColor = outcomeColors[category];

  // ADAPTER: Convert Blend to Stack Shape for Visualization
  const stackData: UIStackRecommendation = {
    kind: 'stack',
    stackId: recommendation.id,
    id: recommendation.id,
    name: recommendation.name,
    description: recommendation.description || '',
    matchScore: recommendation.matchScore,
    reasoning: recommendation.reasoning,
    totalDuration: recommendation.effects.duration,
    layers: [{
      type: 'blend',
      layerName: 'Blend Composition',
      cultivars: recommendation.cultivars.map(c => ({
        name: c.name,
        ratio: c.ratio,
        profile: c.profile || 'Hybrid',
        characteristics: c.characteristics || []
      })),
      phaseIntent: 'Complete Experience',
      whyThisPhase: 'Synergistic combination',
    }],
    effects: recommendation.effects,
    confidence: recommendation.confidence
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative w-full max-w-sm mx-auto z-10"
      >
        <CardShell
          className="relative overflow-hidden group border border-white/10 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            boxShadow: `inset 0 0 0 1px ${accentColor}20`
          }}
        >
          {/* Layer 1: Top-weighted iridescent accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[4px] opacity-80 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${accentColor}80 20%, 
                  ${accentColor} 50%, 
                  ${accentColor}80 80%, 
                  transparent 100%)`,
              filter: 'blur(0.5px)'
            }}
          />

          {/* HEADER */}
          <div className="flex justify-between items-start mb-3 relative z-10"> {/* Density: mb-6 -> mb-3 */}
            <div>
              <div className="flex items-center gap-2 mb-0.5"> {/* Density: mb-1 -> mb-0.5 */}
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-1.5 py-px rounded-full border border-[#00FFD1]/20 shadow-[0_0_10px_-2px_rgba(0,255,209,0.3)]">
                  Match {recommendation.matchScore}%
                </span>
                {recommendation.kind === 'blend' && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-1.5 py-px rounded-full border border-purple-500/20">
                    Blend
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-serif text-white leading-none tracking-tight"> {/* Density: text-3xl -> text-2xl */}
                {recommendation.name}
              </h2>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(recommendation);
              }}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors" // Density: p-2 -> p-1.5
              aria-label="Share Blend"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </button>
          </div>

          {/* VISUALIZATION */}
          <div
            className="relative h-36 w-full bg-black/20 rounded-xl border border-white/5 mb-4 overflow-hidden cursor-pointer" // Density: h-48 -> h-36, mb-6 -> mb-4
            onClick={() => onViewDetail?.(recommendation)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
              <div className="w-full px-4">
                <SpatialStack
                  data={stackData}
                  compact={true}
                />
              </div>
            </div>
          </div>

          {/* WHY THIS BLEND - UNIFIED EXPANSION (No Inline) */}
          {recommendation.reasoning && (
            <div className="mb-3"> {/* Density: mb-4 -> mb-3 */}
              <div
                className="relative p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer group/reasoning overflow-hidden hover:bg-white/10 transition-colors" // Density: p-4 -> p-3
                onClick={() => onViewDetail?.(recommendation)} // UNIFIED CARD EXPANSION
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#00FFD1]">
                    Why This Blend
                  </h3>
                  <span className="text-[9px] text-white/40 group-hover/reasoning:text-white/60 transition-colors">
                    Read Full Detail →
                  </span>
                </div>

                <div className="relative overflow-hidden h-[2.4rem]"> {/* Fixed height, ~2 lines */}
                  <p className="text-xs text-white/70 leading-snug font-light line-clamp-2">
                    {recommendation.reasoning}
                  </p>

                  {/* Subtle fade to indicate more */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="space-y-2 relative z-10"> {/* Density: space-y-3 -> space-y-2 */}
            <button
              onClick={() => onCalculate?.(recommendation)}
              className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2" // Density: py-4 -> py-3, text-xs -> text-[10px]
            >
              <span>Calculate Dose</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>

            <div className="flex justify-center">
              <button
                onClick={() => onViewDetail?.(recommendation)}
                className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors py-1"
              >
                Tap for Full Breakdown
              </button>
            </div>
          </div>

        </CardShell>
      </motion.div>

    </>
  );
}