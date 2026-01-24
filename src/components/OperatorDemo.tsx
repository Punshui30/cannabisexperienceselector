
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Activity, Database, Lock, TrendingUp, ShieldCheck, Box, Search } from 'lucide-react';

interface OperatorDemoProps {
  onClose: () => void;
}

// OPERATOR DEMO - SCRIPTED LINEAR FLOW (STRICT)
// Total Sections: 10 (Intro + 8 Core + Close)
// State Machine Rules: Forward Only, No Branching.
// Auto-Advance: Deterministic (10s fixed).

const SECTIONS = [
  {
    id: 'intro',
    title: 'OPERATOR BRIEFING',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 12L10 15L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: [
      "System Overview: Guided Outcomes Platform",
      "Target: Enterprise & Multi-State Operators",
      "Mode: Autonomous Demonstration",
      "Duration: ~3 Minutes"
    ],
    visual: 'intro'
  },
  {
    id: 'problem',
    title: 'THE INDUSTRY PROBLEM',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-400">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    content: [
      "Indica / Sativa is not science.",
      "Budtender intuition does not scale.",
      "Consumers are guessing.",
      "Dispensaries absorb the cost of dissatisfaction."
    ],
    visual: 'problem'
  },
  {
    id: 'solution',
    title: 'WHAT THIS SYSTEM IS',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00FFD1]">
        <path d="M12 3L4 7V17L12 21L20 17V7L12 3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3V21M4 7L20 17M20 7L4 17" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
    content: [
      "A deterministic cannabis compounding engine.",
      "Based on terpene + cannabinoid math.",
      "Produces repeatable, auditable blends.",
      "NOT a chatbot. NOT a quiz."
    ],
    visual: 'engine'
  },
  {
    id: 'flow',
    title: 'OPERATOR FLOW',
    icon: <TrendingUp className="text-[#BF5AF2]" />,
    content: [
      "1. User Intent (Sleep, Focus, Social)",
      "2. Engine Analysis (Chemotyping)",
      "3. Inventory Matching (Real-time)",
      "4. Deterministic Outcome"
    ],
    visual: 'flow'
  },
  {
    id: 'feed',
    title: 'NETWORK ACTIVITY FEED',
    icon: <Activity className="text-blue-400" />,
    content: [
      "A live, observable network resolution layer.",
      "Aggregates anonymized outcome data ONLY.",
      "NO user identifiable information.",
      "Signals site activity to consumers."
    ],
    visual: 'feed_mock'
  },
  {
    id: 'control',
    title: 'COA INGESTION & CONTROL',
    icon: <Lock className="text-orange-400" />,
    content: [
      "Dispensaries upload raw COAs.",
      "Data is normalized automatically.",
      "Inventory constraints are enforced (Read-Only).",
      "Nothing is hallucinated. Everything is in stock."
    ],
    visual: 'coa_mock'
  },
  {
    id: 'differentiation',
    title: 'ENGINEERED OUTCOMES',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00FFD1]">
        <path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="7" y="5" width="2" height="6" rx="0.5" fill="currentColor" />
        <rect x="15" y="13" width="2" height="6" rx="0.5" fill="currentColor" />
      </svg>
    ),
    content: [
      "Two users. The same question.",
      "Different inventories.",
      "Different blends.",
      "Because outcomes depend on composition, not menus.",
      "This is calculation, not categorization."
    ],
    visual: 'diff'
  },
  {
    id: 'business',
    title: 'BUSINESS PATHS',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold-400">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: [
      "Kiosk Licensing (In-store).",
      "Web Access (Pre-order / Discovery).",
      "Optional End-User App.",
      "Monetizable Insights Layer."
    ],
    visual: 'business'
  },
  {
    id: 'safety',
    title: 'SAFETY & SCOPE',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    content: [
      "Deterministic Logic (No hallucinations).",
      "No Medical Claims.",
      "Ingestion route modeling (edibles, smoking) is NOT part of this system.",
      "Full Auditability for Regulators."
    ],
    visual: 'safety'
  },
  {
    id: 'close',
    title: 'GUIDED OUTCOMES',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00FFD1]">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 12V12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    content: [
      "Repeatable Cannabis Compounding.",
      "Guided Outcomes at Scale.",
      "A Platform, Not a Gimmick."
    ],
    visual: 'intro'
  }
];

export function OperatorDemo({ onClose }: OperatorDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // DETERMINISTIC AUTO-ADVANCE (10s CONSTANT)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        // Forward Only Rule
        if (prev < SECTIONS.length - 1) return prev + 1;
        return prev;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    // Forward Only Rule
    if (currentIndex < SECTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const currentSection = SECTIONS[currentIndex];

  // Non-interactive progress visualization
  const progress = ((currentIndex + 1) / SECTIONS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Background Texture - Operator Artifact */}
      <div className="absolute inset-0 z-0 opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50" />

      <div className="relative z-10 w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center p-8">

        {/* Progress Indicator - informational only, no interaction */}
        <div className="w-full max-w-lg h-0.5 bg-white/10 rounded-full mb-16 overflow-hidden text-center">
          <motion.div
            className="h-full bg-[#00FFD1]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center space-y-10"
          >
            {/* ICON */}
            <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {React.cloneElement(currentSection.icon as React.ReactElement, { size: 48 })}
            </div>

            {/* TITLE */}
            <h2 className="text-4xl font-black tracking-widest text-white uppercase font-sans">
              {currentSection.title}
            </h2>

            {/* CONTENT */}
            <div className="space-y-6 max-w-2xl">
              {currentSection.content.map((line, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  className="text-xl text-white/80 font-light leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* VISUAL MOCKS - Non-Interactive, CSS Only */}
            <div className="mt-8 h-32 w-full flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-1000">
              {currentSection.visual === 'feed_mock' && (
                <div className="flex flex-col gap-2 w-72 text-left p-4 border border-white/10 bg-black/40 rounded-lg font-mono text-[9px] tracking-tight overflow-hidden">
                  <div className="flex justify-between text-[#00FFD1] opacity-80 border-b border-white/5 pb-1 mb-1">
                    <span>NODE_ACTIVE</span>
                    <span className="animate-pulse">●</span>
                  </div>
                  <div className="text-white/40"><span className="text-white/20">09:12:01</span> RESOLUTION_REQ: ID_882</div>
                  <div className="text-white/40"><span className="text-white/20">09:12:04</span> INVENTORY_MAP: [STORE_22]</div>
                  <div className="text-white/40"><span className="text-white/20">09:12:08</span> CALC_SUCCESS: SYNERGY_0.98</div>
                  <div className="text-white/40"><span className="text-white/20">09:12:12</span> STREAM_EMIT: BLEND_V2</div>
                </div>
              )}
              {currentSection.visual === 'coa_mock' && (
                <div className="flex items-center gap-3 text-[10px] font-mono tracking-tighter">
                  <div className="border border-white/20 px-3 py-2 bg-white/5 rounded text-orange-400/80">RAW_DATA</div>
                  <ChevronRight size={10} className="text-white/20" />
                  <div className="border border-[#00FFD1]/30 px-3 py-2 bg-[#00FFD1]/5 rounded text-[#00FFD1]">NORMALIZED</div>
                  <ChevronRight size={10} className="text-white/20" />
                  <div className="border border-white/20 px-3 py-2 bg-white/5 rounded text-white italic">IMMUTABLE</div>
                </div>
              )}
              {currentSection.visual === 'flow' && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded border border-white/10 flex items-center justify-center text-[#BF5AF2] bg-[#BF5AF2]/5 text-[9px] font-mono">INTENT</div>
                    <div className="w-8 h-[1px] bg-white/10" />
                    <div className="w-12 h-12 rounded border border-white/10 flex items-center justify-center text-[#00FFD1] bg-[#00FFD1]/5 text-[9px] font-mono">MATH</div>
                    <div className="w-8 h-[1px] bg-white/10" />
                    <div className="w-12 h-12 rounded border border-white/10 flex items-center justify-center text-white bg-white/5 text-[9px] font-mono">RESULT</div>
                  </div>
                  <div className="mt-2 text-[8px] text-white/20 uppercase tracking-[0.3em]">Deterministic Pipeline</div>
                </div>
              )}
              {currentSection.visual === 'diff' && (
                <div className="flex flex-col gap-4 w-full max-w-sm">
                  <div className="flex items-center justify-between px-6 py-3 border border-white/10 bg-white/5 rounded-lg overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FFD1]" />
                    <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Inventory Alpha</span>
                    <div className="h-[1px] flex-1 mx-4 bg-white/10" />
                    <span className="text-[10px] font-mono text-white tracking-widest uppercase font-bold">Blend #01</span>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 border border-white/10 bg-white/5 rounded-lg overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffaa00]" />
                    <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Inventory Beta</span>
                    <div className="h-[1px] flex-1 mx-4 bg-white/10" />
                    <span className="text-[10px] font-mono text-white tracking-widest uppercase font-bold">Blend #02</span>
                  </div>
                </div>
              )}
              {currentSection.visual === 'business' && (
                <div className="flex gap-4 items-end h-16">
                  <div className="w-8 bg-[#00FFD1]/20 border-t border-x border-[#00FFD1]/40 h-[40%]" />
                  <div className="w-8 bg-[#00FFD1]/40 border-t border-x border-[#00FFD1]/60 h-[70%]" />
                  <div className="w-8 bg-[#00FFD1]/60 border-t border-x border-[#00FFD1]/80 h-[90%]" />
                  <div className="w-8 bg-[#00FFD1] border-t border-x border-white h-[100%]" />
                </div>
              )}
              {currentSection.visual === 'safety' && (
                <div className="relative w-32 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 border border-white/10 rounded overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
                  </div>
                  <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest text-center px-2">
                    Regulatory Compliance Buffer
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER - Exit Only */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors text-[10px] uppercase tracking-widest backdrop-blur-md border border-white/5"
        >
          <span>Exit Demo</span>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}