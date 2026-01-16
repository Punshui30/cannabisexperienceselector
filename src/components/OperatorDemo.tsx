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
    title: 'Demo Intro',
    narration: [
      'What you\'re about to see is not a strain recommender.',
      'This is a new category: outcome-based cannabis design.',
      'Guided Outcomes gives dispensaries a way to deliver consistent experiences, increase cart size, and differentiate — even when inventory changes.'
    ],
    caption: 'Outcome-based cannabis design',
    visual: 'intro',
    duration: 12
  },
  {
    title: 'Problem Statement',
    narration: [
      'Every dispensary faces the same problem.',
      'Strain names stay the same, but batches change.',
      'Growers vary. Terpene profiles drift. Customer expectations don\'t.',
      'Guided Outcomes solves this by shifting the value from single strains… to intentional blends.'
    ],
    caption: 'Batches change. Expectations don\'t.',
    visual: 'problem',
    duration: 14
  },
  {
    title: 'Core Positioning',
    narration: [
      'Instead of selling products, you sell results.',
      'Instead of hoping a cultivar delivers, you design the experience.'
    ],
    caption: 'Sell results, not products',
    visual: 'positioning',
    duration: 8
  },
  {
    title: 'Entry Gate',
    narration: [
      'The app begins with a required session gate for compliance.',
      'From there, operators can enter Consumer Mode or Admin Mode — clearly separated, with no accidental crossover.'
    ],
    caption: 'Compliance-first with clear mode separation',
    visual: 'gate',
    duration: 10
  },
  {
    title: 'Admin Mode',
    narration: [
      'Admin Mode is where the system becomes operational.',
      'This is where inventory is scanned, analyzed, and converted into usable components for blending.'
    ],
    caption: 'Inventory becomes blendable components',
    visual: 'admin',
    duration: 9
  },
  {
    title: 'Inventory Ingestion',
    narration: [
      'Products are added by scanning COAs.',
      'The system reads terpene profiles, cannabinoid ratios, and lab data — and normalizes everything into a consistent internal model.',
      'This means you are no longer dependent on strain names or grower descriptions to sell an experience.'
    ],
    caption: 'COA scan → normalized components',
    visual: 'scan',
    duration: 13
  },
  {
    title: 'Business Value',
    narration: [
      'When inventory changes, Guided Outcomes adapts automatically.',
      'You always have something to recommend — even when your shelves turn over.',
      'This reduces reliance on any single grower and stabilizes your customer experience.'
    ],
    caption: 'Inventory changes. Experience stays consistent.',
    visual: 'business',
    duration: 12
  },
  {
    title: 'Demo Mode',
    narration: [
      'For owners and staff, Demo Mode allows you to preview the full experience using representative data.',
      'This is ideal for training, pitches, and in-store demonstrations — without touching live inventory.'
    ],
    caption: 'Safe preview mode for training & pitches',
    visual: 'demo-mode',
    duration: 10
  },
  {
    title: 'Consumer Experience',
    narration: [
      'From the customer\'s perspective, the experience is simple.',
      'They don\'t browse strains. They describe intent.',
      'Focus. Calm. Energy. Social. Sleep.',
      'The system translates that intent into a designed outcome.'
    ],
    caption: 'Intent → designed outcome',
    visual: 'consumer',
    duration: 11
  },
  {
    title: 'Recommendation Output',
    narration: [
      'Each recommendation is a designed blend — not a guess.',
      'Every component plays a role:',
      'A foundation to set the baseline.',
      'A balance layer to smooth or stabilize.',
      'And an accent layer to fine-tune the experience.'
    ],
    caption: 'Foundation → Balance → Accent',
    visual: 'recommendation',
    duration: 13
  },
  {
    title: 'Why This Is Different',
    narration: [
      'This is not "strain matching."',
      'This is formulation logic applied at the retail level.',
      'The system explains why each component was chosen — without exposing proprietary formulas.'
    ],
    caption: 'Formulation logic, not strain matching',
    visual: 'different',
    duration: 11
  },
  {
    title: 'Built-In Explanation',
    narration: [
      'Every recommendation includes a plain-language explanation.',
      'This builds trust with customers and gives staff a confident story to tell — without needing deep product knowledge.'
    ],
    caption: 'Trust through transparent reasoning',
    visual: 'explanation',
    duration: 10
  },
  {
    title: 'Pre-Roll Calculation',
    narration: [
      'Once a blend is selected, the system calculates exact amounts based on pre-roll size.',
      'This enables custom blends, in-house pre-rolls, and premium offerings.',
      'No guessing. No math at the counter.'
    ],
    caption: 'Exact amounts. No guessing.',
    visual: 'preroll',
    duration: 11
  },
  {
    title: 'Revenue Multiplier',
    narration: [
      'Customers aren\'t choosing one item.',
      'They\'re choosing a designed experience — which naturally supports multi-product baskets.',
      'Blends increase average order value without upselling pressure.'
    ],
    caption: 'Multi-product baskets by design',
    visual: 'cart',
    duration: 11
  },
  {
    title: 'Feedback Loop',
    narration: [
      'Customers can optionally provide feedback by voice.',
      'If they don\'t like a component, the system explains the trade-offs before recalculating.',
      'This keeps customers engaged while protecting the integrity of the experience.'
    ],
    caption: 'Intelligent adjustment with trade-offs',
    visual: 'feedback',
    duration: 12
  },
  {
    title: 'Share & Return',
    narration: [
      'Every blend can be shared via QR code.',
      'In-store customers can scan it to revisit the same outcome later — or bring it back on their next visit.',
      'This turns a single purchase into a repeat pathway.',
      'Customers don\'t remember strain names. They remember how they felt.',
      'Guided Outcomes gives them a reason to come back asking for the same experience — even if the inventory has changed.'
    ],
    caption: 'Remember the feeling, not the strain',
    visual: 'share',
    duration: 16
  },
  {
    title: 'Unique Position',
    narration: [
      'There is no other system like this in cannabis retail.',
      'Blending as a first-class recommendation engine is unique to Guided Outcomes.',
      'This is a new product category — not a feature.'
    ],
    caption: 'New category, not a feature',
    visual: 'unique',
    duration: 10
  },
  {
    title: 'Monetization Expansion',
    narration: [
      'Guided Outcomes also opens new monetization paths:',
      'Sponsored outcome placements.',
      'Premium in-house blends.',
      'White-labeled experiences.',
      'Educational events built around designed outcomes.',
      'You control how far you take it.'
    ],
    caption: 'Multiple revenue streams',
    visual: 'monetization',
    duration: 12
  },
  {
    title: 'The Big Picture',
    narration: [
      'Guided Outcomes doesn\'t just help you sell cannabis.',
      'It helps you design consistency, confidence, and loyalty — in a market that desperately needs all three.',
      'This is how dispensaries move from selling products… to delivering experiences.'
    ],
    caption: 'Consistency. Confidence. Loyalty.',
    visual: 'big-picture',
    duration: 13
  },
  {
    title: 'Final',
    narration: [
      'Guided Outcomes is not the future of cannabis retail.',
      'It\'s the beginning of it.'
    ],
    caption: 'The beginning of a new category',
    visual: 'final',
    duration: 8
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
                <div className="text-xs" style={{ color: COLORS.neutral.text.tertiary }}>
                  Powered by StrainMath™
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
              className="text-xs"
              style={{ color: COLORS.blend.primary }}
            >
              Skip →
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
                  className="text-base leading-relaxed space-y-3 max-w-xl mx-auto"
                  style={{ color: COLORS.neutral.text.secondary }}
                >
                  {scene.narration.map((line, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isMuted ? 0.8 : 0.5 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
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
      case 'intro':
        return (
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="w-32 h-32 rounded-2xl"
              style={{
                background: COLORS.blend.gradient,
                boxShadow: `0 0 60px ${COLORS.blend.primary}60`,
              }}
            />
          </div>
        );

      case 'problem':
        return (
          <div className="flex gap-4">
            {[0.3, 0.6, 0.9].map((opacity, idx) => (
              <motion.div
                key={idx}
                animate={{
                  opacity: [opacity, opacity * 0.5, opacity],
                  scale: [1, 0.95, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: idx * 0.3,
                }}
                className="w-20 h-24 rounded-xl"
                style={{
                  backgroundColor: COLORS.blend.primary,
                  opacity,
                }}
              />
            ))}
          </div>
        );

      case 'positioning':
        return (
          <div className="flex items-center gap-6">
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: `${COLORS.blend.primary}40` }}
            />
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 16H24M24 16L18 10M24 16L18 22"
                stroke={COLORS.blend.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full"
              style={{
                backgroundColor: COLORS.blend.primary,
                boxShadow: `0 0 30px ${COLORS.blend.primary}60`,
              }}
            />
          </div>
        );

      case 'recommendation':
        return (
          <div className="space-y-2 w-64">
            {[
              { label: 'Foundation', opacity: 0.35 },
              { label: 'Balance', opacity: 0.55 },
              { label: 'Accent', opacity: 1.0 },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: idx * 0.2,
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: COLORS.blend.primary,
                  opacity: item.opacity,
                  transformOrigin: 'top',
                }}
              >
                <div
                  className="text-xs uppercase tracking-wider"
                  style={{ color: COLORS.foreground }}
                >
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'preroll':
        return (
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-8 h-32 rounded-full relative"
              style={{
                background: `linear-gradient(180deg, ${COLORS.blend.primary}20, ${COLORS.blend.primary}80)`,
              }}
            >
              <div
                className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full"
                style={{ backgroundColor: COLORS.blend.primary }}
              />
            </motion.div>
          </div>
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

  return <div className="flex items-center justify-center">{renderVisual()}</div>;
}