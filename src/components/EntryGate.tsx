import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Info, User, Settings } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface EntryGateProps {
  onEnterUser: () => void;
  onEnterAdmin: () => void;
}

export function EntryGate({ onEnterUser, onEnterAdmin }: EntryGateProps) {
  const [step, setStep] = useState<'age' | 'familiarity' | 'explanation'>('age');
  const [explanationStep, setExplanationStep] = useState(0);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  const LogoMark = () => (
    <div className="flex flex-col items-center mb-6">
      <div className="w-24 h-24 mb-4">
        <img src={logoImg} alt="GO Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-xl text-white serif tracking-wide">Guided Outcomes</h1>
      <p className="text-xs text-white/60">
        powered by <span className="text-[#FFD700] italic serif">StrainMath™</span>
      </p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <LogoMark />

      <AnimatePresence mode="wait">

        {step === 'age' && (
          <motion.div
            key="age"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-8 max-w-sm text-center"
          >
            <h2 className="text-2xl text-white mb-4 serif">Age Verification</h2>

            <button
              onClick={() => setIsAgeConfirmed(v => !v)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-6"
            >
              {isAgeConfirmed ? '✓ Confirmed 21+' : 'I am 21 or older'}
            </button>

            <button
              disabled={!isAgeConfirmed}
              onClick={() => setStep('familiarity')}
              className="btn-neon-green w-full"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 'familiarity' && (
          <motion.div
            key="fam"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md w-full"
          >
            <h2 className="text-3xl text-white serif mb-6 text-center">
              Have you used Guided Outcomes before?
            </h2>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setExplanationStep(0);
                  setStep('explanation');
                }}
                className="glass-card p-6 text-left"
              >
                First time
              </button>

              <button
                onClick={onEnterUser}
                className="glass-card p-6 text-left"
              >
                I've used this before
              </button>
            </div>
          </motion.div>
        )}

        {step === 'explanation' && (
          <motion.div
            key={`exp-${explanationStep}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-8 max-w-sm text-center"
          >
            <p className="text-white/60 mb-6">
              Step {explanationStep + 1} of 3
            </p>

            <button
              onClick={() => {
                if (explanationStep < 2) setExplanationStep(s => s + 1);
                else onEnterUser();
              }}
              className="btn-neon-green w-full"
            >
              {explanationStep < 2 ? 'Next' : 'Get Started'}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}