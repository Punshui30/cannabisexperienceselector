import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { COLORS } from '../lib/colors';
import logo from 'figma:asset/f7eabe4467f2f507507acb041076599c4b9fae68.png';

type Props = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<'logo' | 'title' | 'powered' | 'exit'>('logo');

  useEffect(() => {
    // Phase 1: Logo (0-2.5s)
    const logoTimer = setTimeout(() => {
      setPhase('title');
    }, 2500);

    // Phase 2: "Guided Outcomes Calculator" (2.5-4.5s)
    const titleTimer = setTimeout(() => {
      setPhase('powered');
    }, 4500);

    // Phase 3: "Powered by StrainMath" (4.5-7s) - keep both texts visible
    const poweredTimer = setTimeout(() => {
      setPhase('exit');
    }, 7000);

    // Phase 4: Exit with light flash (7-9.5s) - much longer
    const exitTimer = setTimeout(() => {
      onComplete();
    }, 9500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(titleTimer);
      clearTimeout(poweredTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: '#000000',
        willChange: 'opacity',
      }}
      initial={{ opacity: 1 }}
      animate={{
        opacity: phase === 'exit' ? 0 : 1,
      }}
      transition={{
        duration: phase === 'exit' ? 1 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Highly visible ambient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            backgroundColor: COLORS.energy,
            filter: 'blur(120px)',
            width: '600px',
            height: '600px',
            top: '50%',
            left: '50%',
            marginTop: '-300px',
            marginLeft: '-300px',
            willChange: 'opacity, transform',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: phase === 'exit' ? 0.4 : 0.15,
            scale: phase === 'exit' ? 2 : 1,
          }}
          transition={{
            duration: phase === 'exit' ? 2 : 1.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Exit light flash - emerald */}
        {phase === 'exit' && (
          <motion.div
            className="absolute rounded-full"
            style={{
              background: COLORS.blend.gradient,
              filter: 'blur(140px)',
              width: '700px',
              height: '700px',
              top: '50%',
              left: '50%',
              marginTop: '-350px',
              marginLeft: '-350px',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.35, 0],
              scale: [0.5, 1.5, 2],
            }}
            transition={{
              duration: 2.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        )}

        {/* Exit light flash - purple */}
        {phase === 'exit' && (
          <motion.div
            className="absolute rounded-full"
            style={{
              background: COLORS.stack.gradient,
              filter: 'blur(140px)',
              width: '650px',
              height: '650px',
              top: '50%',
              left: '50%',
              marginTop: '-325px',
              marginLeft: '-325px',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0.6, 1.4, 2],
            }}
            transition={{
              duration: 2.5,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        )}
      </div>

      {/* Overlay to dampen background and ensure text pop */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Logo - Phase 1 */}
        <motion.div
          className="relative"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: phase === 'exit' ? 0 : 1,
            scale: phase === 'logo' ? 1 : phase === 'exit' ? 1.1 : 0.85,
          }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Logo glow effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              willChange: 'opacity',
              filter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === 'exit' ? 0 : 0.2,
            }}
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: '280px',
                height: 'auto',
                objectFit: 'contain',
                opacity: 0.6,
                willChange: 'auto',
              }}
            />
          </motion.div>

          {/* Main logo */}
          <img
            src={logo}
            alt="Logo"
            style={{
              position: 'relative',
              width: '280px',
              height: 'auto',
              objectFit: 'contain',
              willChange: 'auto',
            }}
          />
        </motion.div>

        {/* "Guided Outcomes Calculator" - Phase 2 */}
        <motion.div
          className="text-center mt-8"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: (phase === 'title' || phase === 'powered') && phase !== 'exit' ? 1 : 0,
            y: (phase === 'title' || phase === 'powered') ? 0 : 10,
          }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h1
            className="text-2xl font-light tracking-wide"
            style={{ color: COLORS.neutral.text.primary }}
          >
            Guided Outcomes Calculator
          </h1>

          {/* Underline */}
          <motion.div
            className="h-px mx-auto mt-3"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLORS.energy}, transparent)`,
              willChange: 'width, opacity',
            }}
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: (phase === 'title' || phase === 'powered') && phase !== 'exit' ? '200px' : 0,
              opacity: (phase === 'title' || phase === 'powered') && phase !== 'exit' ? 1 : 0,
            }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>

        {/* "Powered by StrainMath™" - Phase 3 */}
        <motion.div
          className="text-center mt-12"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: phase === 'powered' && phase !== 'exit' ? 1 : 0,
            y: phase === 'powered' ? 0 : 10,
          }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            className="text-xs uppercase tracking-[0.3em] font-light mb-1"
            style={{ color: COLORS.neutral.text.tertiary }}
          >
            Powered by
          </div>
          <div
            className="text-xl font-light tracking-wide"
            style={{ color: COLORS.energy }}
          >
            StrainMath™
          </div>
        </motion.div>

      </div>

      {/* Edge vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.7) 100%)',
        }}
      />
    </motion.div>
  );
}