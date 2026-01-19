import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

type Props = {
    consultantText?: string;
    onClose: () => void;
};

/**
 * Live Consultant - Text-Only On-Screen Reasoning
 * No voice, no TTS, no audio. Just visual system commentary.
 */
export function LiveConsultant({ consultantText, onClose }: Props) {
    const [displayedText, setDisplayedText] = useState('');
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        const script = consultantText || "Analyzing your preferences. Comparing sixty cultivars. Calculating synergy.";

        let i = 0;
        setDisplayedText("");

        intervalRef.current = setInterval(() => {
            setDisplayedText(script.substring(0, i));
            i++;
            if (i > script.length) {
                clearInterval(intervalRef.current);
                // AUTO-CLOSE after brief pause
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        }, 30); // Faster typing for better UX

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [consultantText, onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl px-8 text-center"
            >
                {/* StrainMath AI Badge */}
                <div className="mb-8">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20">
                        <span className="text-[10px] font-bold text-[#00FFD1] uppercase tracking-widest">
                            StrainMath AI
                        </span>
                    </div>
                </div>

                {/* Live Consultation Heading */}
                <h2 className="text-2xl font-light text-white mb-6 serif">
                    Live Consultation
                </h2>

                {/* Animated Pulse Indicator */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00FFD1]/20 to-[#00FFD1]/5 flex items-center justify-center"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="w-8 h-8 rounded-full bg-[#00FFD1]/40" />
                    </motion.div>
                </div>

                {/* Consultant Text Display */}
                <div className="min-h-[120px] flex items-center justify-center">
                    <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                        {displayedText}
                        <span className="inline-block w-0.5 h-5 bg-[#00FFD1] ml-1 animate-pulse" />
                    </p>
                </div>

                {/* Consultant Analysis Label */}
                <div className="mt-8">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">
                        Consultant Analysis
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
