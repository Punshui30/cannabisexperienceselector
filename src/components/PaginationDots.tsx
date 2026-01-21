import { motion } from 'motion/react';

interface PaginationDotsProps {
    currentIndex: number;
    totalItems: number;
    className?: string;
}

export function PaginationDots({ currentIndex, totalItems, className = "" }: PaginationDotsProps) {
    if (totalItems <= 1) return null;

    return (
        <div className={`flex justify-center gap-2 pointer-events-none ${className}`}>
            {Array.from({ length: totalItems }).map((_, idx) => (
                <motion.div
                    key={idx}
                    initial={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        width: 6,
                        boxShadow: "none",
                        opacity: 0
                    }}
                    animate={{
                        width: idx === currentIndex ? 24 : 6,
                        boxShadow: idx === currentIndex ? "0 0 10px rgba(255,255,255,0.8)" : "none",
                        backgroundColor: idx === currentIndex ? "#ffffff" : "rgba(255,255,255,0.2)",
                        opacity: 1
                    }}
                    transition={{
                        width: { duration: 0.3 },
                        boxShadow: { duration: 0.3 },
                        backgroundColor: { duration: 0.3 },
                        // Cascade animation on mount
                        opacity: {
                            duration: 0.4,
                            delay: idx * 0.15,
                            ease: "easeOut"
                        }
                    }}
                    className="rounded-full h-1.5"
                />
            ))}
        </div>
    );
}
