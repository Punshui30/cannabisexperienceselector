import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Info, User, Shield, Tv, Zap } from 'lucide-react';
import logoImg from '../assets/logo.png';

// Typed motion components to solve TS mismatch
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
};
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

type MotionPProps = React.HTMLAttributes<HTMLParagraphElement> & {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
};
const MotionP = motion.p as React.ComponentType<MotionPProps>;

interface EntryGateProps {
  onEnterUser: () => void;
  onEnterAdmin: () => void;
  onEnterFeed: () => void;
  onEnterTv: () => void;
}

export function EntryGate({ onEnterUser, onEnterAdmin, onEnterFeed, onEnterTv }: EntryGateProps) {
  const [step, setStep] = useState<'splash' | 'age' | 'familiarity' | 'explanation' | 'mode'>('age');
  const [explanationStep, setExplanationStep] = useState(0);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  const GoldSlit = () => (
    <MotionDiv
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
    <div className="w-full min-h-dvh relative overflow-y-auto scrollbar-hide pb-[env(safe-area-inset-bottom,24px)] bg-black">
      <div className="w-full flex flex-col items-center justify-start px-4 py-8 max-[360px]:px-2 max-[360px]:py-4">

        {/* Persistent Branding */}
        <div className="z-20 flex flex-col items-center mb-12 flex-shrink-0">
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
              <MotionP
                key="splash-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(8px)" }}
                transition={{ delay: 2, duration: 0.8 }}
                className="text-white/40 text-xs tracking-[0.4em] uppercase font-light"
              >
                Initializing...
              </MotionP>
            )}

            {step === 'age' && (
              <MotionDiv
                key="age"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="w-full max-w-sm max-[360px]:max-w-[90vw] p-8 max-[360px]:p-5 rounded-3xl relative group flex flex-col items-center text-center border border-white/10"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[4px] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, #C9A24D80 20%, #FFE194 50%, #C9A24D80 80%, transparent 100%)`,
                    filter: 'blur(0.5px)'
                  }}
                />
                <div className="absolute -inset-4 bg-[#C9A24D]/20 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-[-1]" />

                <div className="relative z-10 w-full flex flex-col items-center text-center">
                  <h2 className="text-2xl font-light text-white mb-2 serif">Age Verification</h2>
                  <p className="text-white/50 text-xs mb-8">
                    You must be 21+ to access this application.
                  </p>

                  <button
                    onClick={() => setIsAgeConfirmed(!isAgeConfirmed)}
                    className="w-full flex items-center p-4 rounded-xl bg-white/5 border border-white/10 mb-6 group transition-colors hover:bg-white/10"
                  >
                    <div className={`w-6 h-6 rounded-full border mr-4 flex items-center justify-center transition-all ${isAgeConfirmed ? 'border-[#00FFD1] bg-[#00FFD1]' : 'border-white/30'}`}>
                      {isAgeConfirmed && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs text-white">I am 21 years of age or older</span>
                    </div>
                  </button>

                  <button
                    onClick={() => isAgeConfirmed && setStep('familiarity')}
                    disabled={!isAgeConfirmed}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-black transition-all ${isAgeConfirmed ? 'bg-[#00FFD1] hover:scale-105 shadow-[0_0_20px_rgba(0,255,209,0.3)]' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                  >
                    Continue
                  </button>
                </div>
              </MotionDiv>
            )}

            {step === 'familiarity' && (
              <MotionDiv
                key="familiarity"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="w-full max-w-md flex flex-col items-center"
              >
                <h2 className="text-3xl font-light text-white mb-4 serif text-center">Have you used Guided Outcomes™?</h2>
                <div className="flex flex-col gap-4 w-full px-4">
                  <button onClick={() => { setExplanationStep(0); setStep('explanation'); }} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between text-left">
                    <div className="flex items-center gap-4">
                      <Info size={24} className="text-[#BF5AF2]" />
                      <div>
                        <span className="block text-lg font-medium text-white">First time</span>
                        <span className="text-xs text-white/40">Show me how this works</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/20" />
                  </button>
                  <button onClick={onEnterUser} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between text-left">
                    <div className="flex items-center gap-4">
                      <ArrowRight size={24} className="text-[#00FFD1]" />
                      <div>
                        <span className="block text-lg font-medium text-white">Returning user</span>
                        <span className="text-xs text-white/40">Skip to experience</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/20" />
                  </button>
                </div>
              </MotionDiv>
            )}

            {step === 'explanation' && (
              <MotionDiv
                key={`expl-${explanationStep}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full max-w-sm p-8 glass-card border border-white/10 rounded-[2rem] flex flex-col items-center text-center"
              >
                {/* Step specific content */}
                {explanationStep === 0 && (
                  <>
                    <h3 className="text-2xl font-light text-white mb-4 serif">From Guessing to Precision</h3>
                    <p className="text-white/50 text-sm leading-relaxed">StrainMath™ uses chemistry, not names, to pre-calculate effects.</p>
                  </>
                )}
                {explanationStep === 1 && (
                  <>
                    <h3 className="text-2xl font-light text-white mb-4 serif">Repeatable Outcomes</h3>
                    <p className="text-white/50 text-sm leading-relaxed">Blends allow us to reproduce the exact same feeling every time you visit.</p>
                  </>
                )}
                {explanationStep === 2 && (
                  <>
                    <h3 className="text-2xl font-light text-white mb-4 serif">Real Inventory</h3>
                    <p className="text-white/50 text-sm leading-relaxed">We calculate results based on what's physically on the shelf right now.</p>
                  </>
                )}

                <div className="flex items-center justify-between w-full mt-10">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => <div key={i} className={`h-1.5 rounded-full transition-all ${i === explanationStep ? 'w-6 bg-[#BF5AF2]' : 'w-1.5 bg-white/10'}`} />)}
                  </div>
                  <button onClick={() => explanationStep < 2 ? setExplanationStep(s => s + 1) : setStep('mode')} className="text-[#BF5AF2] text-sm uppercase tracking-widest font-bold">
                    {explanationStep < 2 ? 'Next' : 'Select Mode'}
                  </button>
                </div>
              </MotionDiv>
            )}

            {step === 'mode' && (
              <MotionDiv
                key="mode"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md flex flex-col gap-4 px-4"
              >
                <button onClick={onEnterUser} className="p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <User size={24} className="text-[#00FFD1]" />
                    <span className="text-lg font-medium text-white">Guided Journey</span>
                  </div>
                  <ChevronRight size={20} className="text-white/20" />
                </button>

                <button onClick={onEnterFeed} className="p-6 rounded-3xl border border-[#00FFD1]/20 bg-[#00FFD1]/5 hover:bg-[#00FFD1]/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Zap size={24} className="text-[#00FFD1]" />
                    <span className="text-lg font-medium text-white">Live Network</span>
                  </div>
                  <ChevronRight size={20} className="text-[#00FFD1]/40" />
                </button>

                <button onClick={onEnterTv} className="p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-[#BF5AF2]/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <Tv size={24} className="text-white/40 group-hover:text-[#BF5AF2]" />
                    <span className="text-lg font-medium text-white/80 group-hover:text-white">TV / Display Mode</span>
                  </div>
                  <ChevronRight size={20} className="text-white/20" />
                </button>

                <div className="h-px bg-white/5 my-2" />

                <button onClick={onEnterAdmin} className="p-4 rounded-2xl border border-white/5 flex items-center justify-between grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                  <div className="flex items-center gap-3">
                    <Shield size={18} />
                    <span className="text-sm font-medium">Internal Controls</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}