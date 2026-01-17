import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
// import { COLORS } from '../lib/colors'; // Remove external deps if possible, or keep if safe. COLORS is safe.
import { COLORS } from '../lib/colors';

// FIX: Remove fragile imports like figma:asset if they cause issues. 
// Using local asset or text fallback for reliability.
import logo from '../assets/logo.png';

type Props = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<'logo' | 'title' | 'powered' | 'exit'>('logo');

  useEffect(() => {
    // Phase 1: Logo
    const logoTimer = setTimeout(() => setPhase('title'), 2000);
    // Phase 2: Title
    const titleTimer = setTimeout(() => setPhase('powered'), 4000);
    // Phase 3: Disclaimer/Powered
    const poweredTimer = setTimeout(() => setPhase('exit'), 6000);
    // Phase 4: EXIT UNCONDITIONALLY
    const exitTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(titleTimer);
      clearTimeout(poweredTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  // Guardrail: This component must NOT access routes, presets, or engine state.
  // It is a pure visual loop.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden pointer-events-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-black">
        <motion.div
          animate={{ opacity: phase === 'exit' ? 0 : 0.4, scale: phase === 'exit' ? 1.2 : 1 }}
          transition={{ duration: 2 }}
          className="absolute md:w-[600px] md:h-[600px] w-96 h-96 bg-purple-900/40 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Content Container */}
      <motion.div
        animate={{ opacity: phase === 'exit' ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: phase === 'logo' ? 'blur(0px)' : 'blur(0px)'
          }}
          transition={{ duration: 1.5 }}
          className="mb-8"
        >
          {/* Flexible Logo Handling: Try Image, Fallback to Text */}
          <img src={logo} alt="AntiGravity" className="w-24 h-auto opacity-90" onError={(e) => e.currentTarget.style.display = 'none'} />
          <h1 className="text-3xl font-bold tracking-[0.2em] text-white mt-4 text-center">ANTIGRAVITY</h1>
        </motion.div>

        {/* Text Phases */}
        <div className="h-16 flex flex-col items-center justify-center">
          <motion.p
            key="p1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: (phase === 'title' || phase === 'powered') ? 1 : 0, y: (phase === 'title' || phase === 'powered') ? 0 : -10 }}
            className="text-white/60 text-sm uppercase tracking-widest text-center"
          >
            Experience Engine
          </motion.p>

          {phase === 'powered' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#d4a259] text-xs uppercase tracking-[0.3em] mt-2 font-bold"
            >
              Powered by StrainMath
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}