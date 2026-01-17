import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateRecommendations, type UIBlendRecommendation, type UserInput } from '../lib/engineAdapter';
import logoImg from '../assets/logo.png';

export interface PresetStacksProps {
  onBack: () => void;
  onSelectPreset?: (preset: UIBlendRecommendation) => void;
}

// Define the intents for our fixed presets
const PRESET_INTENTS: Array<{ id: string; title: string; vibe: string; tag: string; input: UserInput }> = [
  {
    id: 'preset-focus',
    title: 'Late Night Focus',
    vibe: 'Deep concentration without stimulation',
    tag: 'Flow',
    input: { mode: 'describe', text: 'focus work ignore distractions clear mind no anxiety' }
  },
  {
    id: 'preset-creative',
    title: 'Creative Flow',
    vibe: 'Open exploration with structure',
    tag: 'Creative',
    input: { mode: 'describe', text: 'creative art music energetic inspiring happy' }
  },
  {
    id: 'preset-calm',
    title: 'Sunday Calm',
    vibe: 'Complete unwinding',
    tag: 'Calm',
    input: { mode: 'describe', text: 'relax calm sleep stress relief quiet comfort' }
  },
  {
    id: 'preset-social',
    title: 'Social Lift',
    vibe: 'Warm engagement',
    tag: 'Social',
    input: { mode: 'describe', text: 'social talkative happy party laugh' }
  }
];

export function PresetStacks({ onBack, onSelectPreset }: PresetStacksProps) {
  const [recommendations, setRecommendations] = useState<UIBlendRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine presets on mount
    const recs = PRESET_INTENTS.map(p => {
      const results = generateRecommendations(p.input);
      // Take the top result and override the name/metadata for display stability
      const top = results[0];
      if (top) {
        return {
          ...top,
          id: p.id,
          name: p.title, // Override name with Preset Title
          reasoning: p.vibe // Override reasoning with short vibe for card
        };
      }
      return null;
    }).filter((r): r is UIBlendRecommendation => r !== null);

    setRecommendations(recs);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="fixed inset-0 bg-black flex items-center justify-center text-white/30 tracking-widest uppercase text-xs">Loading Presets...</div>;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-sans">

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
        <p className="text-[#00FFD1] text-[10px] uppercase tracking-[0.3em] font-semibold">Expert Recommendations</p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 py-4 flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 pb-10">
          <AnimatePresence mode="wait">
            {recommendations.map((rec, idx) => (
              <motion.button
                key={rec.id}
                onClick={() => onSelectPreset?.(rec)}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative h-64 p-6 glass-card text-left border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#00FFD1]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Build {idx + 1}</span>
                  <h3 className="text-xl font-light text-white serif mb-1 group-hover:text-[#00FFD1] transition-colors">{rec.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 font-light mb-4">{rec.reasoning}</p>

                  {/* Cultivar Preview */}
                  <div className="space-y-1">
                    {rec.cultivars.slice(0, 3).map((c, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] text-white/60">
                        <span>{c.name}</span>
                        <span className="text-white/30">{Math.round(c.ratio * 100)}%</span>
                      </div>
                    ))}
                    {rec.cultivars.length > 3 && (
                      <div className="text-[9px] text-white/30 italic">+{rec.cultivars.length - 3} more</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="px-2.5 py-1 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[9px] font-bold text-[#00FFD1] uppercase tracking-widest">
                    Select
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#00FFD1] group-hover:bg-[#00FFD1]/10 group-hover:border-[#00FFD1]/40 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
      </div>
    </div>
  );
}