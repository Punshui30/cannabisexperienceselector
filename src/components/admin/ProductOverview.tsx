import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../../lib/colors';

type Props = {
  onComplete: () => void;
};

type Scene = 1 | 2 | 3 | 4;

const SCENE_DURATION = 4000; // 4 seconds per scene
const TOTAL_SCENES = 4;

export function ProductOverview({ onComplete }: Props) {
  const [currentScene, setCurrentScene] = useState<Scene>(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScene < TOTAL_SCENES) {
        setCurrentScene((prev) => (prev + 1) as Scene);
      } else {
        // Auto-exit after final scene
        setTimeout(onComplete, 1000);
      }
    }, SCENE_DURATION);

    return () => clearTimeout(timer);
  }, [currentScene, onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Subtle ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: COLORS.blend.primary }}
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: COLORS.stack.primary }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* SCENE 1: The Problem */}
        {currentScene === 1 && (
          <motion.div
            key="scene-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 max-w-2xl px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              {/* Visual: Problem Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -3, 3, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center"
                  style={{
                    borderColor: `${COLORS.warning}60`,
                    backgroundColor: `${COLORS.warning}10`,
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 14V22M20 26H20.02" stroke={COLORS.warning} strokeWidth="3" strokeLinecap="round" />
                    <circle cx="20" cy="20" r="14" stroke={COLORS.warning} strokeWidth="2.5" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl md:text-5xl font-light mb-6 leading-tight"
              style={{ color: COLORS.foreground }}
            >
              Single strains aren't consistent.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-xl font-light leading-relaxed"
              style={{ color: COLORS.neutral.text.secondary }}
            >
              Results change from batch to batch.
            </motion.p>
          </motion.div>
        )}

        {/* SCENE 2: The Insight */}
        {currentScene === 2 && (
          <motion.div
            key="scene-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 max-w-2xl px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              {/* Visual: Dual Control Metaphor */}
              <div className="flex justify-center gap-4 mb-6">
                {/* Gas Pedal (THC/CBD) */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div 
                    className="w-16 h-20 rounded-xl border-2 flex items-center justify-center mb-2"
                    style={{
                      borderColor: `${COLORS.energy}60`,
                      backgroundColor: `${COLORS.energy}10`,
                    }}
                  >
                    <div className="text-2xl">⚡</div>
                  </div>
                  <div className="text-xs font-medium" style={{ color: COLORS.neutral.text.tertiary }}>
                    Intensity
                  </div>
                </motion.div>

                {/* Steering Wheel (Terpenes) */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div 
                    className="w-16 h-20 rounded-xl border-2 flex items-center justify-center mb-2"
                    style={{
                      borderColor: `${COLORS.blend.primary}60`,
                      backgroundColor: `${COLORS.blend.primary}10`,
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="10" stroke={COLORS.blend.primary} strokeWidth="2" />
                      <circle cx="16" cy="16" r="3" fill={COLORS.blend.primary} />
                    </svg>
                  </div>
                  <div className="text-xs font-medium" style={{ color: COLORS.neutral.text.tertiary }}>
                    Direction
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-4xl md:text-5xl font-light mb-6 leading-tight"
              style={{ color: COLORS.foreground }}
            >
              THC and CBD control intensity.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-xl font-light leading-relaxed"
              style={{ color: COLORS.neutral.text.secondary }}
            >
              Terpenes control direction.
            </motion.p>
          </motion.div>
        )}

        {/* SCENE 3: The Solution */}
        {currentScene === 3 && (
          <motion.div
            key="scene-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 max-w-2xl px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              {/* Visual: Blending System Assembling */}
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-24">
                  {/* Layer 1 */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-6 rounded-lg"
                    style={{
                      background: COLORS.blend.gradient,
                    }}
                  />
                  {/* Layer 2 */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute bottom-8 left-0 right-0 h-6 rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.stack.primary}, ${COLORS.stack.secondary})`,
                    }}
                  />
                  {/* Layer 3 */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute bottom-16 left-0 right-0 h-6 rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.blend.accent}, #d946ef)`,
                    }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-4xl md:text-5xl font-light mb-6 leading-tight"
              style={{ color: COLORS.foreground }}
            >
              Guided Outcomes blends products
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-xl font-light leading-relaxed"
              style={{ color: COLORS.neutral.text.secondary }}
            >
              to create predictable experiences.
            </motion.p>
          </motion.div>
        )}

        {/* SCENE 4: The Business Value */}
        {currentScene === 4 && (
          <motion.div
            key="scene-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 max-w-2xl px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              {/* Visual: Three Clean Metrics */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: `${COLORS.blend.primary}10`,
                    borderColor: `${COLORS.blend.primary}40`,
                  }}
                >
                  <div className="text-3xl font-light mb-1" style={{ color: COLORS.blend.primary }}>↑</div>
                  <div className="text-xs font-medium" style={{ color: COLORS.neutral.text.secondary }}>
                    Cart Size
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: `${COLORS.stack.primary}10`,
                    borderColor: `${COLORS.stack.primary}40`,
                  }}
                >
                  <div className="text-3xl font-light mb-1" style={{ color: COLORS.stack.primary }}>✓</div>
                  <div className="text-xs font-medium" style={{ color: COLORS.neutral.text.secondary }}>
                    Confidence
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: `${COLORS.blend.accent}10`,
                    borderColor: `${COLORS.blend.accent}40`,
                  }}
                >
                  <div className="text-3xl font-light mb-1" style={{ color: COLORS.blend.accent }}>↻</div>
                  <div className="text-xs font-medium" style={{ color: COLORS.neutral.text.secondary }}>
                    Repeat
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-4xl md:text-5xl font-light mb-6 leading-tight"
              style={{ color: COLORS.foreground }}
            >
              Higher cart sizes.
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="space-y-2"
            >
              <p className="text-xl font-light" style={{ color: COLORS.neutral.text.secondary }}>
                Better recommendations.
              </p>
              <p className="text-xl font-light" style={{ color: COLORS.neutral.text.secondary }}>
                More repeat customers.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator - Minimal */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4].map((scene) => (
          <motion.div
            key={scene}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: currentScene >= scene ? COLORS.blend.primary : 'rgba(255, 255, 255, 0.2)',
            }}
            animate={{
              scale: currentScene === scene ? 1.2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        ))}
      </div>
    </div>
  );
}
