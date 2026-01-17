import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IntentSeed, OutcomeExemplar } from '../types/domain';
import { SwipeDeck } from './SwipeDeck';
import { BLEND_SCENARIOS, BlendScenario } from '../data/presetBlends';

interface InputScreenProps {
  onSubmit: (data: IntentSeed) => void;
  onSelectPreset: (exemplar: OutcomeExemplar | BlendScenario) => void;
  isAdmin?: boolean;
  initialText?: string;
  onBrowsePresets?: () => void; // Added back to match App.tsx usage if needed, though snippet ignored it? 
  // Wait, App.tsx calls: onBrowsePresets={() => setView('presets')}
  // User snippet has: button onClick={() => onSubmit...} and "Explore Preset Stacks" button.
  // The "Explore Preset Stacks" button in snippet has NO implementation (onClick is missing).
  // I will attach onBrowsePresets to that button.
  onAdminModeToggle?: () => void; // App.tsx passes this. I will keep it in interface but maybe not use it if user didn't include it?
  // User snippet has "Admin Mode" badge in header.
}

// User snippet omitted onBrowsePresets in destructuring?
// input: export function InputScreen({ onSubmit, onSelectPreset, isAdmin, initialText }: InputScreenProps)
// I will ADD onBrowsePresets back to make the "Explore" button work.

export function InputScreen({
  onSubmit,
  onSelectPreset,
  isAdmin,
  initialText,
  onBrowsePresets
}: InputScreenProps) {
  const [mode, setMode] = useState<'describe' | 'strain'>('describe');
  const [description, setDescription] = useState('');

  // Effect to populate text from Static View return
  useEffect(() => {
    if (initialText) {
      setDescription(initialText);
      setMode('describe');
    }
  }, [initialText]);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">

      {/* 1. FIXED HEADER */}
      <div className="flex-shrink-0 pt-12 px-6 pb-4 flex items-center justify-between z-10 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Logo - Text Fallback for Reliability */}
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <span className="font-bold text-lg text-[#d4a259]">AG</span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              ANTIGRAVITY
            </h1>
            <p className="text-[10px] text-[#d4a259] uppercase tracking-[0.2em] mt-1">
              Experience Engine
            </p>
          </div>
        </div>
        {isAdmin && <div className="text-xs uppercase tracking-widest text-red-500 border border-red-500 px-2 py-1 rounded">Admin Mode</div>}
      </div>

      {/* 2. FLEXIBLE BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 flex flex-col gap-6">

        {/* INPUT AREA (Reduced Height) */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            {/* Tabs Row */}
            <div className="flex gap-2">
              <button onClick={() => setMode('describe')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'describe' ? 'bg-[#d4a259] text-black shadow-lg shadow-[#d4a259]/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                Describe
              </button>
              <button onClick={() => setMode('strain')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'strain' ? 'bg-[#d4a259] text-black shadow-lg shadow-[#d4a259]/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                Strain
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'describe' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="How do you want to feel? (e.g. social, creative, relaxed due to...)"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#d4a259] transition-colors resize-none placeholder:text-white/20 h-28" // Fixed h-28 (7rem)
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-white/30 uppercase tracking-widest">
                  {description.length} chars
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="p-4 border border-white/10 rounded-2xl bg-[#1A1A1A] h-28 flex items-center justify-center">
                  <p className="text-white/40 text-sm italic">Strain Library Integration Pending...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SCENARIO SWIPEDECK (Yielding Height) */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Start with a Scenario</h3>
            <span className="text-[10px] text-[#d4a259] uppercase tracking-widest animate-pulse">Swipe →</span>
          </div>

          {/* Bounded Container for SwipeDeck */}
          <div className="flex-1 w-full relative min-h-[180px]">
            <SwipeDeck
              items={BLEND_SCENARIOS}
              renderItem={(scenario, isActive) => (
                <div
                  className="w-full h-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 flex flex-col relative overflow-hidden group cursor-pointer"
                  onClick={() => {
                    // RUNTIME GUARD from User Snippet
                    if (!scenario || typeof scenario !== 'object') {
                      console.error('CRITICAL: InputScreen SwipeDeck passed invalid scenario', scenario);
                      return;
                    }
                    onSelectPreset(scenario);
                  }}
                >
                  {/* Color Indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: scenario.visualProfile.color }} />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="flex justify-between items-start mb-2 pl-3">
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-[#d4a259] transition-colors">{scenario.title}</h4>
                      <p className="text-xs text-white/50">{scenario.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/80 leading-relaxed pl-3 line-clamp-3">
                    "{scenario.inputText}"
                  </p>

                  <div className="mt-auto pl-3 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors border border-white/20 rounded-full px-3 py-1">
                      Tap to Preview
                    </span>
                  </div>
                </div>
              )}
              onSwipe={(index) => {
                // Analytics hook could go here
              }}
            />
          </div>
        </div>

      </div>

      {/* 3. FIXED FOOTER */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 bg-black/90 border-t border-white/5 z-20 flex flex-col gap-3">
        <button
          onClick={() => onSubmit({ kind: 'intentSeed', text: description, strainName: mode === 'strain' ? 'Strain X' : undefined })}
          className="w-full h-14 bg-gradient-to-r from-[#d4a259] to-[#b8860b] rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#d4a259]/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <span className="text-black font-extrabold text-sm uppercase tracking-[0.15em]">Generate Recommendations</span>
          <span className="text-black text-lg">✦</span>
        </button>

        <button
          onClick={onBrowsePresets}
          className="w-full py-3 flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white">Explore Preset Stacks</span>
          <span className="text-[#d4a259]">→</span>
        </button>
      </div>

    </div>
  );
}