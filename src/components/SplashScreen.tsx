import { useEffect } from 'react';
import { motion } from 'motion/react';

type Props = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
        className="text-white text-4xl font-bold tracking-widest"
      >
        Guided Outcomes
      </motion.div>
    </div>
  );
}