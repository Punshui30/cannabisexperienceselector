import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BAR_COUNT = 13;
const EMERALD = '#10B981';
const VIOLET = '#8B5CF6';
const GOLD = '#C9A24D';

export function SignalAlignmentVisual({ onComplete }: { onComplete?: () => void }) {
    const [isResolved, setIsResolved] = useState(false);

    // Initial random heights for jitter
    const randomHeight = () => 20 + Math.random() * 60;

    // Timing sequence
    useEffect(() => {
        const resolveTimer = setTimeout(() => {
            setIsResolved(true);
            if (onComplete) {
                // Slight delay to allow snap to finish before signalling complete
                setTimeout(onComplete, 800);
            }
        }, 2000); // 2 second seeking/jitter phase

        return () => clearTimeout(resolveTimer);
    }, [onComplete]);

    return (
        <div className="flex items-center justify-center gap-1.5 h-full w-full max-w-[300px] mx-auto overflow-hidden">
            {Array.from({ length: BAR_COUNT }).map((_, i) => {
                // Alternate colors with spare gold accents
                const color = i % 5 === 0 ? GOLD : i % 2 === 0 ? EMERALD : VIOLET;
                const opacity = i % 5 === 0 ? 0.6 : 1;

                // Target height: uniform when resolved, random when not
                // We use a predefined "aligned" pattern or just flat?
                // "Snap into precise alignment" -> Flat or symmetrical. Let's do a subtle wave or flat bar.
                // Request says "Parallel vertical bars... snap into clean alignment". 
                // Let's go for a unified height or a very clean curve. Flat is most "mechanical/locked".
                const resolvedHeight = 70; // 70% height

                return (
                    <motion.div
                        key={i}
                        className="w-2 rounded-full"
                        style={{ backgroundColor: color, opacity }}
                        initial={{ height: randomHeight() + "%" }}
                        animate={isResolved ? {
                            height: "60%", // Unified locked height
                            y: 0,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                            }
                        } : {
                            height: [20 + Math.random() * 40 + "%", 60 + Math.random() * 40 + "%"],
                            y: [0, -5, 5, 0],
                            transition: {
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 0.1 + Math.random() * 0.2, // Fast jitter
                                ease: "linear"
                            }
                        }}
                    />
                );
            })}
        </div>
    );
}
