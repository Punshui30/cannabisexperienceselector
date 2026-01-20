
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
    icon: <Box className="text-white" />,
    content: [
      "System Overview: Guided Outcomes Platform",
      "Target: Enterprise & Multi-State Operators",
      "Mode: Autonomous Demonstration",
      "Duration: ~3 Minutes"
    ],
    visual: 'logo'
  },
  {
    id: 'problem',
    title: 'THE INDUSTRY PROBLEM',
    icon: <Activity className="text-red-400" />,
    content: [
      "Indica / Sativa is not science.",
      "Budtender intuition does not scale.",
      "Consumers are guessing.",
      "Dispensaries absorb the cost of dissatisfaction."
    ],
    visual: 'alert'
  },
  {
    id: 'solution',
    title: 'WHAT THIS SYSTEM IS',
    icon: <Database className="text-[#00FFD1]" />,
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
    title: 'PUBLIC INTELLIGENCE FEED',
    icon: <Activity className="text-blue-400" />,
    content: [
      "A live, observable intelligence layer.",
      "Aggregates anonymized outcome data ONLY.",
      "NO user identifiable information.",
      "Signals system activity to consumers."
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
    title: 'DIFFERENTIATION',
    icon: <ShieldCheck className="text-green-400" />,
    content: [
      "Two users → Different blends.",
      "Same user, different inventory → Different outcomes.",
      "Static menus cannot do this.",
      "Budtenders cannot calculate this."
    ],
    visual: 'diff'
  },
  {
    id: 'business',
    title: 'BUSINESS PATHS',
    icon: <TrendingUp className="text-gold-400" />,
    content: [
      "Kiosk Licensing (In-store).",
      "Web Access (Pre-order / Discovery).",
      "Optional End-User App.",
      "Monetizable Intelligence Layer."
    ],
    visual: 'business'
  },
  {
    id: 'safety',
    title: 'SAFETY & SCOPE',
    icon: <ShieldCheck className="text-white" />,
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
    icon: <Database className="text-[#00FFD1]" />,
    content: [
      "Repeatable Cannabis Compounding.",
      "Guided Outcomes at Scale.",
      "A Platform, Not a Gimmick."
    ],
    visual: 'logo'
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
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50" />

      <div className="relative z-10 w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center p-8">

        {/* Progress Indicator - informational only, no interaction */}
        <div className="w-full max-w-lg h-0.5 bg-white/10 rounded-full mb-12 overflow-hidden">
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
            className="flex flex-col items-center text-center space-y-8"
          >
            {/* ICON */}
            <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {React.cloneElement(currentSection.icon as React.ReactElement, { size: 48 })}
            </div>

            {/* TITLE */}
            <h2 className="text-4xl font-black tracking-widest text-white uppercase">
              {currentSection.title}
            </h2>

            {/* CONTENT */}
            <div className="space-y-4 max-w-2xl">
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
                <div className="space-y-2 w-64 text-left p-4 border border-white/10 bg-black/40 rounded text-[10px] text-green-400 font-mono tracking-wider">
                  <div className="animate-pulse opacity-50">_SYSTEM_FEED_LIVE</div>
                  <div className="opacity-70">ID:99281... CALC_COMPLETE</div>
                  <div className="opacity-70">ID:12993... INVENTORY_SYNC</div>
                  <div className="opacity-70">ID:88271... BLEND_OPTIMIZED</div>
                </div>
              )}
              {currentSection.visual === 'coa_mock' && (
                <div className="flex items-center gap-4 text-[10px] font-mono text-orange-400 tracking-wider">
                  <div className="border border-white/10 p-2 opacity-70">INPUT_COA</div>
                  <ChevronRight size={12} className="opacity-30" />
                  <div className="border border-white/10 p-2 opacity-70">NORMALIZE</div>
                  <ChevronRight size={12} className="opacity-30" />
                  <div className="border border-white/10 p-2 text-white opacity-90">LOCKED</div>
                </div>
              )}
              {currentSection.visual === 'flow' && (
                <div className="flex items-center gap-4 text-[10px] font-mono text-[#BF5AF2] tracking-wider">
                  <div className="border border-white/10 p-2 opacity-70">USER_INTENT</div>
                  <ChevronRight size={12} className="opacity-30" />
                  <div className="border border-white/10 p-2 opacity-70">CHEMOTYPE</div>
                  <ChevronRight size={12} className="opacity-30" />
                  <div className="border border-white/10 p-2 text-white opacity-90">OUTCOME</div>
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