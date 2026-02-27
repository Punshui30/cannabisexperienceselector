import { motion } from 'framer-motion';

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
                        boxShadow: [
                            "none",
                            "0 0 20px rgba(255,255,255,1)", // FLASH ON
                            idx === currentIndex ? "0 0 12px rgba(255,255,255,0.6)" : "none" // SETTLE
                        ],
                        backgroundColor: [
                            "rgba(255, 255, 255, 0.2)",
                            "#ffffff", // FLASH ON
                            idx === currentIndex ? "#ffffff" : "rgba(255, 255, 255, 0.4)" // SETTLE (slightly more visible)
                        ],
                        opacity: 1
                    }}
                    transition={{
                        width: { duration: 0.3 },
                        opacity: { duration: 0.4, delay: idx * 0.1 },
                        boxShadow: {
                            duration: 1.5,
                            times: [0, 0.5, 1],
                            delay: 0.8 + idx * 0.15 // Cascade delay starts after cards land
                        },
                        backgroundColor: {
                            duration: 1.5,
                            times: [0, 0.5, 1],
                            delay: 0.8 + idx * 0.15 // Cascade delay starts after cards land
                        }
                    }}
                    className="rounded-full h-1.5"
                />
            ))}
        </div>
    );
}
