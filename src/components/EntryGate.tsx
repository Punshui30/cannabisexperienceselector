import React, { useState, useEffect } from 'react'; // FORCE_UPDATE: 2026-01-20-T14-41
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Info, User, Settings, Zap, Shield } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface EntryGateProps {
  onEnterUser: () => void;
  onEnterAdmin: () => void;
  onEnterFeed: () => void;
}

export function EntryGate({ onEnterUser, onEnterAdmin, onEnterFeed }: EntryGateProps) {
  const [step, setStep] = useState<'splash' | 'age' | 'familiarity' | 'explanation' | 'mode'>('age');
  const [explanationStep, setExplanationStep] = useState(0);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  // Removed internal splash timer to avoid double-splash with App.tsx

  // --- SUB-COMPONENTS ---

  const GoldSlit = () => (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
      className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent my-4"
    />
  );

  const LogoMark = () => (
    <div className="flex flex-col items-center mb-6">
      <div className="w-40 h-40 mb-6 flex items-center justify-center">
        <img src={logoImg} alt="GO Logo" className="w-full h-full object-contain" />
      </div>
      <div className="mt-2 flex flex-col items-center">
        <h1 className="text-3xl font-normal text-white serif tracking-wide">Guided Outcomes</h1>
        <p className="text-base text-white/60">powered by <span className="text-[#FFD700] italic serif">StrainMath™</span></p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-4 max-[360px]:px-2 overflow-hidden py-12 max-[360px]:py-6">

      {/* Persistent Branding */}
      <div className="z-20 flex flex-col items-center mb-12">
        <LogoMark />
        {step === 'splash' && (
          <div className="w-48">
            <GoldSlit />
          </div>
        )}
      </div>

      {/* Dynamic Content Area */}
      <div className="z-20 w-full flex justify-center items-start">
        <AnimatePresence mode="wait">

          {step === 'splash' && (
            <motion.p
              key="splash-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-white/40 text-xs tracking-[0.4em] uppercase font-light"
            >
              Initializing...
            </motion.p>
          )}

          {step === 'age' && (
            <motion.div
              key="age"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full max-w-sm max-[360px]:max-w-[90vw] p-8 max-[360px]:p-5 rounded-3xl relative group flex flex-col items-center text-center"
            >
              {/* IRIDESCENT GOLD BORDER (Increased to 2px for visibility) */}
              <div className="absolute inset-0 p-[2px] rounded-3xl bg-gradient-to-br from-[#C9A24D] via-[#FFE194] to-[#C9A24D]/40 opacity-100 transition-opacity duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-black rounded-[22px]" /> {/* Adjusted radius for internal fit */}
              </div>

              {/* Ambient Gold Glow Underlay (Moved outside or ensuring visibility) */}
              <div className="absolute -inset-4 bg-[#C9A24D]/20 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 animate-pulse-slow pointer-events-none z-[-1]" />

              <div className="relative z-10 w-full flex flex-col items-center">
                <h2 className="text-2xl font-light text-white mb-2 serif">Age Verification Required</h2>
                <p className="text-white/50 text-sm mb-8">
                  You must be 21 years of age or older to access this application.
                </p>

                <button
                  onClick={() => setIsAgeConfirmed(!isAgeConfirmed)}
                  className="w-full flex items-center p-4 rounded-xl bg-white/5 border border-white/10 mb-6 group transition-colors hover:bg-white/10"
                >
                  <div className={`w-6 h-6 rounded-full border mr-4 flex items-center justify-center transition-all ${isAgeConfirmed ? 'border-[#00FFD1] bg-[#00FFD1]' : 'border-white/30'
                    }`}>
                    {isAgeConfirmed && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm text-white">I confirm that I am 21 years of age or older</span>
                    <span className="text-[10px] text-white/30">This confirmation is required for each session</span>
                  </div>
                </button>

                <button
                  onClick={() => isAgeConfirmed && setStep('familiarity')}
                  disabled={!isAgeConfirmed}
                  className={`w-full btn-neon-green shadow-lg shadow-[#00FFD1]/20 ${!isAgeConfirmed && 'opacity-20 cursor-not-allowed scale-100 shadow-none'}`}
                >
                  Continue
                </button>

                <p className="mt-8 text-[9px] text-white/30 leading-tight">
                  By continuing, you acknowledge that cannabis products are for adults 21+ only. Use responsibly and in accordance with applicable laws.
                </p>
              </div>
            </motion.div>
          )}

          {step === 'familiarity' && (
            <motion.div
              key="familiarity"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full max-w-md max-[360px]:max-w-[95vw] flex flex-col items-center"
            >
              <h2 className="text-3xl font-light text-white mb-4 serif text-center">Have you used<br />Guided Outcomes™ before?</h2>
              <p className="text-white/40 mb-8 text-sm">This helps us show the right amount of explanation for this session.</p>

              <div className="flex flex-col gap-4 w-full px-4">
                <button
                  onClick={() => { setExplanationStep(0); setStep('explanation'); }}
                  className="group relative p-6 glass-card-neon-purple hover:bg-[#BF5AF2]/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-[#BF5AF2]/20 flex items-center justify-center border border-[#BF5AF2]/40 text-[#BF5AF2]">
                      <Info size={24} />
                    </div>
                    <div className="flex-1">
                      <span className="block text-lg font-medium text-white">First time</span>
                      <span className="text-sm text-white/40">Show me how this works</span>
                    </div>
                    <ChevronRight size={20} className="text-white/10 group-hover:text-[#BF5AF2]" />
                  </div>
                </button>

                <button
                  onClick={onEnterUser}
                  className="group relative p-6 glass-card-neon-green hover:bg-[#00FFD1]/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-[#00FFD1]/20 flex items-center justify-center border border-[#00FFD1]/40 text-[#00FFD1]">
                      <ArrowRight size={24} />
                    </div>
                    <div className="flex-1">
                      <span className="block text-lg font-medium text-white">I've used this before</span>
                      <span className="text-sm text-white/40">Skip to experience</span>
                    </div>
                    <ChevronRight size={20} className="text-white/10 group-hover:text-[#00FFD1]" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'explanation' && (
            <motion.div
              key={`expl-${explanationStep}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full max-w-sm max-[360px]:max-w-[90vw] p-8 max-[360px]:p-4 glass-card flex flex-col items-center text-center"
            >
              <div className="mb-8">
                <div className="w-16 h-16 rounded-full bg-[#BF5AF2]/10 flex items-center justify-center mb-6 mx-auto border border-[#BF5AF2]/30 shadow-[0_0_20px_rgba(191,90,242,0.15)]">
                  {/* ICONOGRAPHY SWITCHER */}
                  {explanationStep === 0 && (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BF5AF2" strokeWidth="1.5">
                      <title>Interpretation Eye</title>
                      <path d="M4 16C4 16 9 6 16 6C23 6 28 16 28 16C28 16 23 26 16 26C9 26 4 16 4 16Z" strokeOpacity="0.8" />
                      <path d="M12 16H20" strokeOpacity="0.6" strokeLinecap="round" />
                      <path d="M13.5 13H18.5" strokeOpacity="0.6" strokeLinecap="round" />
                      <path d="M13.5 19H18.5" strokeOpacity="0.6" strokeLinecap="round" />
                    </svg>
                  )}
                  {explanationStep === 1 && (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BF5AF2" strokeWidth="1.5">
                      <title>Reliable Blend</title>
                      {/* Interlocking/Stacked Geometry for Stability */}
                      <circle cx="12" cy="12" r="7" strokeOpacity="0.6" />
                      <circle cx="20" cy="20" r="7" strokeOpacity="0.6" />
                      <path d="M12 12L20 20" strokeOpacity="0.8" />
                    </svg>
                  )}
                  {explanationStep === 2 && (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BF5AF2" strokeWidth="1.5">
                      <title>User Input</title>
                      {/* Speech/Waveform Metaphor */}
                      <path d="M4 24V16C4 10 9 6 16 6C23 6 28 10 28 16" strokeOpacity="0.6" />
                      <path d="M8 16V18" strokeLinecap="round" />
                      <path d="M12 14V20" strokeLinecap="round" strokeWidth="2" />
                      <path d="M16 12V22" strokeLinecap="round" strokeWidth="2" />
                      <path d="M20 14V20" strokeLinecap="round" strokeWidth="2" />
                      <path d="M24 16V18" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {explanationStep === 0 && (
                  <>
                    <h3 className="text-2xl font-light text-white mb-4 serif">From Guessing to Precision</h3>
                    <p className="text-white/50 leading-relaxed text-sm">
                      Most cannabis recommendations are guesses based on names or categories. <br /><br />
                      StrainMath<span className="text-[8px] align-top opacity-60">™</span> uses measured chemistry — cannabinoids and terpenes — to calculate exact outcomes instead of relying on strain labels.
                    </p>
                  </>
                )}
                {explanationStep === 1 && (
                  <>
                    <h3 className="text-2xl font-light text-white mb-4 serif">Blends Are Repeatable.<br />Strains Are Not.</h3>
                    <p className="text-white/50 leading-relaxed text-sm">
                      Individual strains change by grower, batch, and harvest. <br /><br />
                      StrainMath<span className="text-[8px] align-top opacity-60">™</span> creates custom blends with precise ratios, so the effect you choose can be reproduced — every time.
                    </p>
                  </>
                )}
                {explanationStep === 2 && (
                  <>
                    <h3 className="text-2xl font-light text-white mb-4 serif">Built From Real Inventory,<br />Not Theory</h3>
                    <p className="text-white/50 leading-relaxed text-sm mb-4">
                      Every recommendation is calculated using lab-verified COAs from the products available in the store you’re shopping. <br /><br />
                      That means the results apply to you, here, now — not a generic database.
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between w-full mt-4">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === explanationStep ? 'bg-[#BF5AF2] w-4' : 'bg-white/10'}`} />
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (explanationStep < 2) setExplanationStep(prev => prev + 1);
                    else onEnterUser(); // Direct entry
                  }}
                  className="text-[#BF5AF2] font-medium text-sm flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-wider"
                >
                  {explanationStep < 2 ? 'Next' : 'Get Started'} <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'mode' && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md flex flex-col items-center px-4"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-white mb-1 serif">Select Mode</h2>
                <p className="text-white/40 text-sm">Choose your experience</p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {/* USER MODE */}
                <button
                  onClick={onEnterUser}
                  className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 hover:to-white/5 transition-all flex items-center justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFD1]/20 to-[#00E0B8]/10 flex items-center justify-center border border-[#00FFD1]/20">
                      <User size={24} className="text-[#00FFD1]" />
                    </div>
                    <div className="text-left">
                      <span className="block text-base font-semibold text-white group-hover:text-[#00FFD1] transition-colors">Find Your Experience</span>
                      <span className="text-xs text-white/40">Personalized recommendations</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/20 group-hover:text-[#00FFD1] transition-colors" />
                </button>

                {/* LIVE BLENDS FEED - ELEVATED */}
                <button
                  onClick={onEnterFeed}
                  className="group relative p-6 rounded-2xl border border-[#00FFD1]/20 bg-gradient-to-br from-[#00FFD1]/10 to-transparent hover:from-[#00FFD1]/15 hover:to-[#00FFD1]/5 transition-all flex items-center justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFD1]/30 to-[#00E0B8]/20 flex items-center justify-center border border-[#00FFD1]/30">
                      <div className="absolute inset-0 rounded-full bg-[#00FFD1]/20 animate-pulse" />
                      <Zap size={24} className="text-[#00FFD1] relative z-10" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="block text-base font-semibold text-white group-hover:text-[#00FFD1] transition-colors">Live Blends</span>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFD1]"></span>
                        </span>
                      </div>
                      <span className="text-xs text-white/50">See what people are creating now</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#00FFD1]/40 group-hover:text-[#00FFD1] transition-colors" />
                </button>

                <div className="w-full h-px bg-white/5 my-2" />

                {/* ADMIN MODE */}
                <button
                  onClick={onEnterAdmin}
                  className="group relative p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Shield size={16} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-medium text-white/60 group-hover:text-white transition-colors">Admin Portal</span>
                      <span className="text-xs text-white/30">Operator controls</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/10 group-hover:text-orange-500" />
                </button>

                <p className="text-center text-white/20 text-[10px] mt-6">
                  Age verification required every session for compliance
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}