
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StackedRecommendation } from '../App';

export type PresetStack = {
  id: string;
  name: string;
  vibe: string;
  outcomeTag: string;
  colorScheme: 'warm' | 'cool' | 'energetic' | 'calm';
  timeOfDay: string;
  tempo: string;
  stack: Omit<StackedRecommendation, 'id' | 'matchScore'>;
};

const presetStacks: PresetStack[] = [
  {
    id: 'preset-1',
    name: 'Late Night Focus',
    vibe: 'Deep concentration without stimulation',
    outcomeTag: 'Flow',
    colorScheme: 'cool',
    timeOfDay: 'Night',
    tempo: 'Steady',
    stack: {
      name: 'Late Night Focus',
      layers: [
        {
          layerName: 'Mental Clarity',
          cultivars: [
            { name: 'Harlequin', ratio: 0.6, profile: 'Clear focus', characteristics: ['Functional', 'Alert', 'Calm'] },
            { name: 'ACDC', ratio: 0.4, profile: 'Smooth baseline', characteristics: ['Balanced', 'Grounded', 'Clear'] },
          ],
          purpose: 'Sustained concentration',
          timing: '0-180 min',
        },
      ],
      reasoning: 'Perfect for late work sessions. Clean mental state without keeping you wired.',
      totalDuration: '3-4 hours',
    },
  },
  {
    id: 'preset-2',
    name: 'Creative Flow',
    vibe: 'Open exploration with structure',
    outcomeTag: 'Creative',
    colorScheme: 'energetic',
    timeOfDay: 'Afternoon',
    tempo: 'Energetic',
    stack: {
      name: 'Creative Flow',
      layers: [
        {
          layerName: 'Ideation',
          cultivars: [
            { name: 'Jack Herer', ratio: 0.5, profile: 'Creative energy', characteristics: ['Inspired', 'Sharp', 'Open'] },
            { name: 'Durban Poison', ratio: 0.3, profile: 'Mental agility', characteristics: ['Fast', 'Clear', 'Motivated'] },
            { name: 'Blue Dream', ratio: 0.2, profile: 'Pleasant ease', characteristics: ['Comfortable', 'Flowing', 'Balanced'] },
          ],
          purpose: 'Generate ideas',
          timing: '0-90 min',
        },
      ],
      reasoning: 'Opens creative channels while maintaining execution ability.',
      totalDuration: '2-3 hours',
    },
  },
  {
    id: 'preset-3',
    name: 'Sunday Calm',
    vibe: 'Complete unwinding',
    outcomeTag: 'Calm',
    colorScheme: 'warm',
    timeOfDay: 'Evening',
    tempo: 'Slow',
    stack: {
      name: 'Sunday Calm',
      layers: [
        {
          layerName: 'Gentle Relaxation',
          cultivars: [
            { name: 'Blue Dream', ratio: 0.5, profile: 'Soft comfort', characteristics: ['Easy', 'Pleasant', 'Relaxed'] },
            { name: 'Northern Lights', ratio: 0.3, profile: 'Peaceful state', characteristics: ['Calm', 'Serene', 'Restful'] },
            { name: 'Harlequin', ratio: 0.2, profile: 'Functional calm', characteristics: ['Clear', 'Balanced', 'Present'] },
          ],
          purpose: 'Rest without sedation',
          timing: '0-120 min',
        },
      ],
      reasoning: 'Deeply restful but functional. Perfect for recovery days.',
      totalDuration: '2-3 hours',
    },
  },
  {
    id: 'preset-4',
    name: 'Social Lift',
    vibe: 'Warm engagement',
    outcomeTag: 'Social',
    colorScheme: 'energetic',
    timeOfDay: 'Evening',
    tempo: 'Moderate',
    stack: {
      name: 'Social Lift',
      layers: [
        {
          layerName: 'Open Connection',
          cultivars: [
            { name: 'OG Kush', ratio: 0.45, profile: 'Social warmth', characteristics: ['Talkative', 'Happy', 'Open'] },
            { name: 'Wedding Cake', ratio: 0.35, profile: 'Relaxed confidence', characteristics: ['Comfortable', 'Engaged', 'Friendly'] },
            { name: 'ACDC', ratio: 0.2, profile: 'Clear presence', characteristics: ['Grounded', 'Present', 'Balanced'] },
          ],
          purpose: 'Feel connected',
          timing: '0-150 min',
        },
      ],
      reasoning: 'Great for gatherings where you want to feel present and engaged.',
      totalDuration: '2.5-3 hours',
    },
  },
];

interface PresetStacksProps {
  onBack: () => void;
  onSelectPreset?: (preset: PresetStack) => void;
}

export function PresetStacks({ onBack, onSelectPreset }: PresetStacksProps) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(presetStacks.length / itemsPerPage);
  const currentPresets = presetStacks.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

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

        <div className="flex flex-col items-end">
          <span className="text-sm font-normal text-white serif">Guided Outcomes</span>
          <span className="text-[10px] text-white/40">powered by <span className="text-[#FFD700] italic serif">StrainMath™</span></span>
        </div>
      </div>

      <div className="flex-shrink-0 px-8 py-6 text-center">
        <h1 className="text-4xl font-light text-white mb-2 serif tracking-tight">Curated Stacks</h1>
        <p className="text-[#00FFD1] text-[10px] uppercase tracking-[0.3em] font-semibold">Expert Recommendations</p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 py-4 flex items-center justify-center min-h-0">
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {currentPresets.map((preset, idx) => (
              <motion.button
                key={preset.id}
                onClick={() => onSelectPreset?.(preset)}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative h-48 p-6 glass-card text-left border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#00FFD1]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">{preset.timeOfDay}</span>
                  <h3 className="text-xl font-light text-white serif mb-1 group-hover:text-[#00FFD1] transition-colors">{preset.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 font-light">{preset.vibe}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="px-2.5 py-1 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[9px] font-bold text-[#00FFD1] uppercase tracking-widest">
                    {preset.outcomeTag}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 py-10 flex justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1 rounded-full transition-all duration-300 ${page === i ? 'bg-[#00FFD1] w-8' : 'bg-white/10 w-4'
                }`}
            />
          ))}
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-20">
        <p className="text-[8px] uppercase tracking-widest text-white">© 2026 StrainMath Intellectual Property</p>
      </div>
    </div>
  );
}