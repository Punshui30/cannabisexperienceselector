import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
// Minimal imports - pure visual
import { COLORS } from '../lib/colors';

// Renamed and simplified to ensure no legacy cache issues
type Props = {
    onComplete: () => void;
};

export function BootLoader({ onComplete }: Props) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        // Phase 0: Start
        const t1 = setTimeout(() => setPhase(1), 500);
        // Phase 1: Logo Pulse
        const t2 = setTimeout(() => setPhase(2), 2000); // Title
        // Phase 2: Powered By
        const t3 = setTimeout(() => setPhase(3), 4000); // Exit

        const exitTimer = setTimeout(onComplete, 4500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(exitTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none pointer-events-none">
            <div className="absolute inset-0 bg-black">
                <motion.div
                    animate={{ opacity: phase === 3 ? 0 : 0.4 }}
                    transition={{ duration: 1 }}
                    className="absolute w-[500px] h-[500px] bg-purple-900/40 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>

            <motion.div
                animate={{ opacity: phase === 3 ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Simple Text Logo instead of Image to avoid import errors */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: phase >= 1 ? 1 : 0, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="text-4xl font-bold tracking-[0.2em] text-white text-center mb-4"
                >
                    ANTIGRAVITY
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase >= 2 ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center"
                >
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                        Experience Engine
                    </p>
                    <p className="text-[#d4a259] text-[10px] uppercase tracking-[0.3em] font-bold">
                        Powered by StrainMath
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
