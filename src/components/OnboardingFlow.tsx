import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from 'figma:asset/f7eabe4467f2f507507acb041076599c4b9fae68.png';

type Props = {
  onComplete: () => void;
};

type Screen = 'fork' | 'why-fail' | 'why-blend' | 'trust';

export function OnboardingFlow({ onComplete }: Props) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('fork');

  const handleReturningUser = () => {
    onComplete();
  };

  const handleNewUser = () => {
    setCurrentScreen('why-fail');
  };

  const handleNext = () => {
    if (currentScreen === 'why-fail') {
      setCurrentScreen('why-blend');
    } else if (currentScreen === 'why-blend') {
      setCurrentScreen('trust');
    } else if (currentScreen === 'trust') {
      onComplete();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-black">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 80%, rgba(184, 151, 90, 0.12) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/20 to-[#b8975a]/20 blur-3xl"
      />

      <div className="relative min-h-screen flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* Screen 1: Fork */}
          {currentScreen === 'fork' && (
            <motion.div
              key="fork"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              {/* Logo */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 1, delay: 0.2 }}
                  className="flex flex-col items-center mb-8"
                >
                  <img src={logo} alt="Logo" className="w-auto h-28 mb-6" />
                  <div className="text-white/60 text-lg font-normal tracking-wide">
                    Guided Outcomes powered by{' '}
                    <span className="italic font-serif text-xl" style={{ color: '#d4af6a' }}>StrainMath</span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl font-medium mb-4 tracking-tight text-white"
                  style={{ letterSpacing: '0.01em' }}
                >
                  Welcome
                </motion.h1>
              </div>

              {/* Action Cards */}
              <div className="space-y-4">
                <motion.button
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleReturningUser}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-2xl blur-lg" />
                    <div className="relative bg-[#0a0a0a] backdrop-blur-2xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-2xl font-medium text-white mb-2 tracking-tight">
                            I've used this before
                          </div>
                          <div className="text-white/50 font-normal">
                            Continue to calculator
                          </div>
                        </div>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          className="text-white/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                        >
                          <path
                            d="M12 8L20 16L12 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleNewUser}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl blur-lg" style={{ background: 'linear-gradient(135deg, rgba(184, 151, 90, 0.15), rgba(212, 175, 106, 0.1))' }} />
                    <div className="relative bg-[#0a0a0a] backdrop-blur-2xl rounded-2xl border p-8 hover:border-[#d4af6a]/40 transition-all shadow-xl" style={{ borderColor: 'rgba(184, 151, 90, 0.2)' }}>
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-2xl font-medium text-white mb-2 tracking-tight">
                            I'm new — explain blends
                          </div>
                          <div className="text-white/50 font-normal">
                            Quick intro to the approach
                          </div>
                        </div>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          className="group-hover:translate-x-1 transition-all"
                          style={{ color: '#b8975a' }}
                        >
                          <path
                            d="M12 8L20 16L12 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Screen 2: Why Single Strains Fail */}
          {currentScreen === 'why-fail' && (
            <motion.div
              key="why-fail"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#0a0a0a] border mb-8 shadow-lg"
                  style={{ borderColor: 'rgba(184, 151, 90, 0.2)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4af6a' }} />
                  <span className="text-sm font-medium" style={{ color: '#b8975a' }}>1 of 3</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl font-semibold mb-12 text-white tracking-tight leading-tight"
                  style={{ letterSpacing: '0.005em' }}
                >
                  The same strain doesn't
                  <br />
                  always feel the same.
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-2xl mx-auto"
                >
                  <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" style={{ background: 'linear-gradient(135deg, rgba(16, 40, 30, 0.4), rgba(20, 30, 25, 0.3))' }} />
                  <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-3xl p-12 shadow-2xl" style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <p className="text-2xl text-white font-normal leading-relaxed mb-5" style={{ opacity: 0.75, lineHeight: 1.65 }}>
                      Effects change from batch to batch.
                    </p>
                    <p className="text-2xl text-white font-normal leading-relaxed" style={{ opacity: 0.75, lineHeight: 1.65 }}>
                      What you feel can drift over time.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleNext}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                }}
              >
                <div className="relative px-10 py-6 flex items-center justify-center gap-3">
                  <span className="text-xl font-medium text-white">
                    Continue
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M7 4L13 10L7 16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Screen 3: Why Blends */}
          {currentScreen === 'why-blend' && (
            <motion.div
              key="why-blend"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#0a0a0a] border mb-8 shadow-lg"
                  style={{ borderColor: 'rgba(184, 151, 90, 0.2)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#d4af6a' }} />
                  <span className="text-sm font-medium" style={{ color: '#b8975a' }}>2 of 3</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl font-semibold mb-12 text-white tracking-tight leading-tight"
                  style={{ letterSpacing: '0.005em' }}
                >
                  Blends give control.
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-5 max-w-2xl mx-auto"
                >
                  {[
                    'Blends allow balance',
                    'Blends allow tuning',
                    'Blends create repeatable outcomes',
                  ].map((text, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-lg" />
                      <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-2xl border border-white/10 p-7 flex items-center gap-6 shadow-xl">
                        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <path
                              d="M4 11L9 16L18 7"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-2xl text-white font-normal" style={{ opacity: 0.8 }}>
                          {text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                onClick={handleNext}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                }}
              >
                <div className="relative px-10 py-6 flex items-center justify-center gap-3">
                  <span className="text-xl font-medium text-white">
                    Continue
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M7 4L13 10L7 16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Screen 4: Trust */}
          {currentScreen === 'trust' && (
            <motion.div
              key="trust"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#0a0a0a] border mb-8 shadow-lg"
                  style={{ borderColor: 'rgba(184, 151, 90, 0.2)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#d4af6a' }} />
                  <span className="text-sm font-medium" style={{ color: '#b8975a' }}>3 of 3</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl font-semibold mb-12 text-white tracking-tight leading-tight"
                  style={{ letterSpacing: '0.005em' }}
                >
                  You don't need the math
                  <br />
                  to get the result.
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-2xl mx-auto mb-12"
                >
                  <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: 'linear-gradient(135deg, rgba(30, 35, 30, 0.5), rgba(20, 25, 22, 0.4))' }} />
                  <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-3xl p-12 space-y-7 shadow-2xl" style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <p className="text-xl text-white font-normal leading-relaxed" style={{ opacity: 0.75, lineHeight: 1.7 }}>
                      The system is intentional.
                    </p>
                    <div className="w-16 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(184, 151, 90, 0.5), transparent)' }} />
                    <p className="text-xl text-white font-normal leading-relaxed" style={{ opacity: 0.75, lineHeight: 1.7 }}>
                      The complexity is handled for you.
                    </p>
                    <div className="w-16 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(184, 151, 90, 0.5), transparent)' }} />
                    <p className="text-xl text-white font-normal leading-relaxed" style={{ opacity: 0.75, lineHeight: 1.7 }}>
                      The method is protected by design.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleNext}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                }}
              >
                <div className="relative px-10 py-6 flex items-center justify-center gap-3">
                  <span className="text-xl font-medium text-white">
                    Continue to Guided Outcomes
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M7 4L13 10L7 16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
