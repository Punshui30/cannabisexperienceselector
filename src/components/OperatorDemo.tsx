
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Activity, Database, Lock, TrendingUp, ShieldCheck } from 'lucide-react';

interface OperatorDemoProps {
  onClose: () => void;
}

// OPERATOR DEMO - SCRIPTED LINEAR FLOW
// 1. Industry Problem
// 2. What This Is (Deterministic Engine)
// 3. Operator Flow (Input -> Output)
// 4. Public Feed (Intelligence)
// 5. COA Ingestion & Control
// 6. Differentiation
// 7. Business Paths
// 8. Safety & Scope (Ingestion Lock)
// 9. Close

const SECTIONS = [
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
      "Aggregates anonymized outcome data.",
      "Builds trust through transparency.",
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
      "Inventory constraints are enforced.",
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
      "No Ingestion Modeling (Form Factor Agnostic).",
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

  // Auto-Advance logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev < SECTIONS.length - 1) return prev + 1;
        return prev; // Stop at end
      });
    }, 8000); // 8 seconds per slide = ~3 minutes total, plenty of read time

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (currentIndex < SECTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const currentSection = SECTIONS[currentIndex];
  const progress = ((currentIndex + 1) / SECTIONS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50" />

      <div className="relative z-10 w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center p-8">

        {/* Progress Bar */}
        <div className="w-full max-w-lg h-1 bg-white/10 rounded-full mb-12 overflow-hidden">
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                  transition={{ delay: idx * 0.2 + 0.3 }}
                  className="text-xl text-white/80 font-light leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* VISUAL MOCKS (Simplistic CSS-only representations) */}
            <div className="mt-8 h-32 w-full flex items-center justify-center opacity-50">
              {currentSection.visual === 'feed_mock' && (
                <div className="space-y-2 w-64 text-left p-4 border border-white/10 bg-black/40 rounded text-xs text-green-400 font-mono">
                  <div className="animate-pulse">_FEED_ACTIVE</div>
                  <div>[13:14:02] FOCUS_STACK_04 Generated</div>
                  <div>[13:14:05] New Inventory Synced</div>
                  <div>[13:14:10] SLEEP_BLEND_09 Optimized</div>
                </div>
              )}
              {currentSection.visual === 'coa_mock' && (
                <div className="flex items-center gap-4 text-xs font-mono text-orange-400">
                  <div className="border border-white/10 p-2">RAW_COA_PDF</div>
                  <ChevronRight size={16} />
                  <div className="border border-white/10 p-2">NORMALIZER</div>
                  <ChevronRight size={16} />
                  <div className="border border-white/10 p-2 text-white">ENGINE_READY</div>
                </div>
              )}
              {currentSection.visual === 'flow' && (
                <div className="flex items-center gap-4 text-xs font-mono text-[#BF5AF2]">
                  <div className="border border-white/10 p-2">INTENT</div>
                  <ChevronRight size={16} />
                  <div className="border border-white/10 p-2">CHEMOTYPE</div>
                  <ChevronRight size={16} />
                  <div className="border border-white/10 p-2 text-white">OUTCOME</div>
                </div>
              )}
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Footer Controls */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white/40 hover:text-white uppercase text-xs tracking-widest transition-colors"
          >
            Exit Demo
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group"
          >
            {currentIndex === SECTIONS.length - 1 ? (
              <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
            ) : (
              <ChevronRight size={20} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}