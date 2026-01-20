import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../lib/colors';

type DemoScene = {
  title: string;
  narration: string[];
  caption: string;
  visual: 'intro' | 'problem' | 'positioning' | 'gate' | 'admin' | 'scan' | 'business' | 'demo-mode' | 'consumer' | 'recommendation' | 'different' | 'explanation' | 'preroll' | 'cart' | 'feedback' | 'share' | 'unique' | 'monetization' | 'big-picture' | 'final';
  duration: number; // seconds
};

const DEMO_SCENES: DemoScene[] = [
  {
    title: 'The Challenge',
    narration: [
      'Customers expect consistency, but cannabis chemistry is naturally variable.',
      '"Blue Dream" from Grower A isn\'t the same as "Blue Dream" from Grower B.',
      'When the batch changes, the customer experience shifts.',
      'This variability creates friction and loss of trust at the counter.'
    ],
    caption: 'Chemistry varies. Outcomes shouldn\'t.',
    visual: 'problem',
    duration: 12
  },
  {
    title: 'The Data Gap',
    narration: [
      'Budtenders are forced to guess based on strain names or "Indica/Sativa" labels.',
      'These categories or labels are too broad to predict specific therapeutic effects.',
      'Without lab-verified intelligence, every sale is a chemical variable.',
      'StrainMath™ bridges the gap between lab data and human experience.'
    ],
    caption: 'Labels are not guarantees.',
    visual: 'scan',
    duration: 12
  },
  {
    title: 'The Solution: Outcomes',
    narration: [
      'We focus on chemical outcomes, not historical strain lore.',
      'Our engine analyzes your live inventory COAs in real-time.',
      'We generate precise cultivar blends designed to hit target feelings.',
      'Consistency is maintained even as individual strains rotate in and out.'
    ],
    caption: 'From Strain Names to Engineered Outcomes.',
    visual: 'recommendation',
    duration: 14
  },
  {
    title: 'Operational Efficiency',
    narration: [
      'Budtenders can resolve complex customer queries in seconds.',
      'Guided recommendations help manage peak traffic at the counter.',
      'Staff confidence increases as they become experts in chemistry.',
      'Faster decision-making means higher throughput and shorter waits.'
    ],
    caption: 'Empower your team with data.',
    visual: 'unique',
    duration: 12
  },
  {
    title: 'Live Network Intelligence',
    narration: [
      'The platform generates an anonymized Live Network feed.',
      'Surface your store\'s intelligence publicly to build authority.',
      'Customers can explore successful outcomes from their community.',
      'Building trust through transparency and data-backed success.'
    ],
    caption: 'A Network of Reliable Intelligence.',
    visual: 'scan',
    duration: 12
  },
  {
    title: 'Revenue Impact',
    narration: [
      'One outcome recommendation typically includes 2 to 3 cultivars.',
      'This naturally increases average cart size (AOV).',
      'Repeat business grows as customers find reliable results.',
      'Turning chemistry into a predictable business asset.'
    ],
    caption: 'Drive loyalty and growth through data.',
    visual: 'cart',
    duration: 12
  },
  {
    title: 'The Result',
    narration: [
      'Predictable effects.',
      'Confident budtenders.',
      'Loyal, satisfied customers.'
    ],
    caption: 'Guidance. Consistency. Confidence.',
    visual: 'final',
    duration: 10
  }
];

type Props = {
  onComplete: () => void;
  onExit: () => void;
};

export function OperatorDemo({ onComplete, onExit }: Props) {
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const scene = DEMO_SCENES[currentScene];
  const totalScenes = DEMO_SCENES.length;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (scene.duration * 10); // Update every 100ms
        const newProgress = prev + increment;

        if (newProgress >= 100) {
          // Move to next scene
          if (currentScene < totalScenes - 1) {
            setCurrentScene((curr) => curr + 1);
            return 0;
          } else {
            // Demo complete
            setTimeout(onComplete, 500);
            return 100;
          }
        }

        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentScene, scene.duration, totalScenes, onComplete, isPaused]);

  const handleSkip = () => {
    if (currentScene < totalScenes - 1) {
      setCurrentScene((curr) => curr + 1);
      setProgress(0);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background subtle animation */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${COLORS.blend.primary}40, transparent 70%)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* IP Protection Badge - Persistent overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-20 right-6 z-30 px-3 py-1.5 rounded-full border backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderColor: `${COLORS.blend.primary}40`,
        }}
      >
        <div
          className="text-xs font-light tracking-wide"
          style={{ color: COLORS.neutral.text.tertiary, opacity: 0.7 }}
        >
          Demo content — proprietary system preview
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header controls */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo/Branding */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: COLORS.blend.gradient,
                  boxShadow: `0 0 20px ${COLORS.blend.primary}40`,
                }}
              >
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                  <path
                    d="M8 0L0 4.5V13.5L8 18L16 13.5V4.5L8 0Z"
                    fill={COLORS.background}
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.foreground }}>
                  Operator Demo
                </div>
                <div className="text-xs text-[#ffd700]">
                  Powered by <span className="serif">StrainMath</span>™
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
              }}
            >
              {isMuted ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 4L6 7H3V13H6L10 16V4Z"
                    stroke={COLORS.foreground}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                  <path
                    d="M16 7L13 10M13 7L16 10"
                    stroke={COLORS.foreground}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 4L6 7H3V13H6L10 16V4Z"
                    stroke={COLORS.foreground}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 7C15 8 15 10 14 11M16 5C18 7 18 11 16 13"
                    stroke={COLORS.foreground}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            {/* Pause/Play button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
              }}
            >
              {isPaused ? (
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                  <path d="M0 0L12 7L0 14V0Z" fill={COLORS.foreground} />
                </svg>
              ) : (
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                  <rect width="4" height="14" fill={COLORS.foreground} />
                  <rect x="8" width="4" height="14" fill={COLORS.foreground} />
                </svg>
              )}
            </button>

            {/* Exit button */}
            <button
              onClick={onExit}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke={COLORS.foreground}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-shrink-0 px-6">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: COLORS.blend.gradient,
                width: `${progress}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs" style={{ color: COLORS.neutral.text.tertiary }}>
              Scene {currentScene + 1} of {totalScenes}
            </div>
            <button
              onClick={handleSkip}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.foreground }}
            >
              Next ❯
            </button>
          </div>
        </div>

        {/* Scene content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-2xl"
            >
              {/* Visual representation */}
              <div className="mb-8 flex items-center justify-center">
                <SceneVisual visual={scene.visual} />
              </div>

              {/* Caption */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2
                  className="text-4xl font-light mb-6 leading-tight"
                  style={{ color: COLORS.foreground }}
                >
                  {scene.caption}
                </h2>

                {/* Narration text (simulating captions) */}
                <div
                  className="text-lg leading-relaxed space-y-3 max-w-xl mx-auto font-medium"
                  style={{ color: COLORS.foreground }}
                >
                  {scene.narration.map((line, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="drop-shadow-md"
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scene title (small, bottom) */}
        <div className="flex-shrink-0 px-6 pb-6 text-center">
          <div
            className="text-xs uppercase tracking-widest"
            style={{ color: COLORS.neutral.text.tertiary }}
          >
            {scene.title}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Visual component for each scene type
function SceneVisual({ visual }: { visual: DemoScene['visual'] }) {
  const renderVisual = () => {
    switch (visual) {
      case 'problem':
        // VISUAL: Inconsistency / Confusion
        // Three bars that change height/color randomly
        return (
          <div className="flex gap-4 items-end h-32">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  height: ['40%', '80%', '30%', '90%'],
                  backgroundColor: [COLORS.blend.primary, COLORS.warning, COLORS.blend.primary, COLORS.warning],
                  opacity: [1, 0.5, 1, 0.6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
                className="w-12 rounded-t-xl"
                style={{
                  border: `1px solid ${COLORS.foreground}20`
                }}
              />
            ))}
          </div>
        );

      case 'business':
        // VISUAL: Broken Loyalty / Drop
        // A line chart dipping down
        return (
          <div className="relative w-40 h-32 border-l border-b border-white/20">
            <motion.svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="overflow-visible">
              <motion.path
                d="M0 20 Q 30 20, 40 50 T 100 90"
                stroke={COLORS.warning}
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <motion.circle
                cx="100" cy="90" r="4" fill={COLORS.warning}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              />
            </motion.svg>
          </div>
        );

      case 'scan':
        // VISUAL: System / COA Data
        // Scanning effect over a grid
        return (
          <div className="relative w-32 h-40 border border-white/20 rounded-xl overflow-hidden bg-white/5">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-5 gap-1 p-2 opacity-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="bg-white/40 rounded-sm" />
              ))}
            </div>
            <motion.div
              className="absolute left-0 right-0 h-1 bg-[#00FFD1] blur-[2px]"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ boxShadow: '0 0 10px #00FFD1' }}
            />
          </div>
        );

      case 'recommendation':
        // VISUAL: The Solution / Stack
        return (
          <div className="space-y-1 w-48">
            <motion.div
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest relative overflow-hidden"
              style={{
                background: 'rgba(0, 255, 209, 0.2)',
                borderColor: 'rgba(0, 255, 209, 0.5)',
                borderWidth: '1px',
                color: '#00FFD1'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FFD1]/20 to-transparent animate-shimmer" />
              Accent
            </motion.div>
            <motion.div
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="h-10 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: 'rgba(16, 185, 129, 0.2)', // Emerald-500
                borderColor: 'rgba(16, 185, 129, 0.5)',
                borderWidth: '1px',
                color: '#6EE7B7' // Emerald-300
              }}
            >
              Balance
            </motion.div>
            <motion.div
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="h-12 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: 'rgba(6, 95, 70, 0.3)', // Emerald-900
                borderColor: 'rgba(6, 95, 70, 0.6)',
                borderWidth: '1px',
                color: '#34D399' // Emerald-400
              }}
            >
              Foundation
            </motion.div>
          </div>
        );

      case 'cart':
        // VISUAL: Basket Size
        // Items animating into a container
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute bottom-0 w-24 h-24 border-2 border-white/20 rounded-b-xl border-t-0" />
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full border border-white/40 bg-white/10"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0 + (i * 10), x: (i - 1) * 10, opacity: 1 }}
                transition={{ delay: i * 0.5, duration: 0.5, type: 'spring' }}
              />
            ))}
            <motion.div
              className="absolute -top-4 right-0 bg-[#00FFD1] text-black text-xs font-bold px-2 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: 'spring' }}
            >
              +35%
            </motion.div>
          </div>
        );

      case 'unique':
        // VISUAL: Star / Badge / Premium
        return (
          <div className="relative">
            <motion.svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={COLORS.blend.primary} strokeWidth="1">
              <motion.path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                initial={{ pathLength: 0, fill: "transparent" }}
                animate={{ pathLength: 1, fill: `${COLORS.blend.primary}20` }}
                transition={{ duration: 2 }}
              />
            </motion.svg>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 40px ${COLORS.blend.primary}40` }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        );

      case 'final':
        // VISUAL: Checkmark / Success
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full border-2 border-[#00FFD1] flex items-center justify-center bg-[#00FFD1]/10"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00FFD1" strokeWidth="2">
              <motion.path
                d="M20 6L9 17L4 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </svg>
          </motion.div>
        );

      default:
        return (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: `${COLORS.blend.primary}20`,
              borderWidth: 2,
              borderColor: COLORS.blend.primary,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl"
              style={{
                backgroundColor: COLORS.blend.primary,
                boxShadow: `0 0 20px ${COLORS.blend.primary}60`,
              }}
            />
          </motion.div>
        );
    }
  };

  return <div className="flex items-center justify-center p-8">{renderVisual()}</div>;
}