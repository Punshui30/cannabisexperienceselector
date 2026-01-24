import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';

/**
 * V3 CINEMATIC INTELLIGENCE LAYER
 * -------------------------------
 * A visual-only semantic layer that makes the system feel alive.
 * Features: Drifting Fields, Color Convergence, Breathing Modulation, and Resolution Click.
 */

interface CinematicBackgroundProps {
    isAnalyzing?: boolean;
    isResolved?: boolean;
}

const SEMANTIC_COLORS = [
    '#00FFD1', // Focus (Neon Green)
    '#BF5AF2', // Secondary (Neon Purple)
    '#22D3EE', // Cruise (Cyan)
    '#FB923C', // Social (Orange)
    '#F472B6', // Creative (Pink)
];

export function CinematicBackground({ isAnalyzing = false, isResolved = false }: CinematicBackgroundProps) {
    // Single-shot trigger for the "Click" moment
    const [showClick, setShowClick] = useState(false);

    useEffect(() => {
        if (isResolved) {
            setShowClick(true);
            const timer = setTimeout(() => setShowClick(false), 120);
            return () => clearTimeout(timer);
        }
    }, [isResolved]);

    // Generate random field configurations once
    const fields = useMemo(() => {
        return [
            { color: SEMANTIC_COLORS[0], size: '50%', top: '10%', left: '10%', duration: 18 },
            { color: SEMANTIC_COLORS[1], size: '45%', top: '40%', left: '50%', duration: 20 },
            { color: SEMANTIC_COLORS[2], size: '55%', top: '60%', left: '15%', duration: 16 },
            { color: SEMANTIC_COLORS[3], size: '40%', top: '20%', left: '60%', duration: 19 },
            { color: SEMANTIC_COLORS[4], size: '48%', top: '70%', left: '70%', duration: 17 },
        ];
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
            {/* BREATHING INTELLIGENCE LAYER */}
            <motion.div
                className="absolute inset-0 w-full h-full"
                animate={{
                    opacity: [0.92, 1, 0.92],
                    scale: [1, 1.015, 1],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {/* SEMANTIC COLOR FIELDS */}
                {fields.map((field, idx) => (
                    <motion.div
                        key={idx}
                        className="absolute rounded-full"
                        style={{
                            width: field.size,
                            height: field.size,
                            top: field.top,
                            left: field.left,
                            background: `radial-gradient(circle, ${field.color}22 0%, ${field.color}00 70%)`,
                            filter: 'blur(100px)',
                            mixBlendMode: 'screen',
                        }}
                        // DRIFT & CONVERGENCE BEHAVIOR
                        animate={{
                            x: isAnalyzing ? [0, 8, 0] : [-12, 12, -12],
                            y: isAnalyzing ? [0, -8, 0] : [10, -10, 10],
                            scale: isAnalyzing ? 0.9 : 1,
                            filter: isAnalyzing ? 'blur(120px) saturate(0.8)' : 'blur(100px) saturate(1)',
                            // Bias toward center during convergence
                            top: isAnalyzing ? '35%' : field.top,
                            left: isAnalyzing ? '35%' : field.left,
                        }}
                        transition={{
                            duration: isAnalyzing ? 22 : field.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </motion.div>

            {/* RESOLUTION "CLICK" ACCENT */}
            <AnimatePresence>
                {showClick && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.05 }}
                        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                    >
                        {/* Gold Wash / Border Accent */}
                        <div className="absolute inset-0 bg-[#C9A24D] opacity-10" />
                        <div className="w-full h-full border border-[#C9A24D]/20 animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grain Overlay for premium texture (Optional but adds to the cinematic feel) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>
        </div>
    );
}
