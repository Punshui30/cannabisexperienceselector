// ... imports
import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'motion/react';

interface SwipeDeckProps<T> {
    items: T[];
    renderItem: (item: T, isActive: boolean) => React.ReactNode;
    onSwipe?: (index: number) => void;
    className?: string;
}

const SWIPE_THRESHOLD = 50;

export function SwipeDeck<T>({ items, renderItem, onSwipe, className = "" }: SwipeDeckProps<T>) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const controls = useAnimation();

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // Determine direction
        if (offset < -SWIPE_THRESHOLD || velocity < -500) {
            // Swipe Left (Next)
            if (currentIndex < items.length - 1) {
                await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.2 } });
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                onSwipe?.(nextIndex);
                controls.set({ x: window.innerWidth }); // Reset to right
                await controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } });
            } else {
                // Bounce back (Resistance)
                controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
            }
        } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
            // Swipe Right (Prev)
            if (currentIndex > 0) {
                await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.2 } });
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                onSwipe?.(prevIndex);
                controls.set({ x: -window.innerWidth }); // Reset to left
                await controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } });
            } else {
                // Bounce back (Resistance)
                controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
            }
        } else {
            // Return to center
            controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
        }
    };

    const activeItem = items[currentIndex];

    if (!activeItem) return null;

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Current Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2} // Linear resistance
                dragDirectionLock={true} // STRICT HORIZONTAL LOCK
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full h-full absolute inset-0"
                style={{ x: 0 }}
            >
                {renderItem(activeItem, true)}
            </motion.div>

            {/* Pagination Indicators - Animated Hint */}
            {items.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10 w-full">
                    {items.map((_, idx) => (
                        <motion.div
                            key={idx}
                            initial={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                width: 6,
                                boxShadow: "none"
                            }}
                            animate={{
                                width: idx === currentIndex ? 24 : 6,
                                backgroundColor: idx === currentIndex ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                                boxShadow: idx === currentIndex ? "0 0 10px rgba(255,255,255,0.8)" : "none",
                                opacity: [0.3, 1, 1, 0.3, 1, 1],
                            }}
                            transition={{
                                width: { duration: 0.3 },
                                backgroundColor: { duration: 0.3 },
                                boxShadow: { duration: 0.3 },
                                opacity: {
                                    duration: 3,
                                    times: [
                                        0,
                                        (idx * 0.15) / 3,
                                        ((idx * 0.15) + 0.1) / 3,
                                        0.45,
                                        0.5 + ((idx * 0.15) / 3),
                                        0.5 + (((idx * 0.15) + 0.1) / 3),
                                    ],
                                }
                            }}
                            className="rounded-full h-1.5"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
