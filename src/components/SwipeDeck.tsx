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

    // Mount Animation for Pagination Pills
    // We want them to light up sequentially to indicate more content
    const [hasAnimatedHint, setHasAnimatedHint] = useState(false);

    useEffect(() => {
        if (!hasAnimatedHint && items.length > 1) {
            setHasAnimatedHint(true);
        }
    }, [items.length]);

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
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
                    {items.map((_, idx) => (
                        <motion.div
                            key={idx}
                            // Initial State based on active index
                            animate={
                                hasAnimatedHint
                                    ? {
                                        width: idx === currentIndex ? 24 : 6,
                                        backgroundColor: idx === currentIndex ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                                        boxShadow: idx === currentIndex ? "0 0 10px rgba(255,255,255,0.8)" : "none"
                                    }
                                    : {}
                            }
                            // The "Ripple" Hint Animation on Mount
                            // We animate opacity/brightness briefly in sequence
                            whileInView={!hasAnimatedHint ? {
                                backgroundColor: ["rgba(255,255,255,0.2)", "#ffffff", "rgba(255,255,255,0.2)"],
                            } : undefined}
                            transition={{
                                duration: 0.3, // Fast duration for state changes
                                // For the hint ripple:
                                backgroundColor: {
                                    duration: 0.6,
                                    times: [0, 0.5, 1],
                                    delay: idx * 0.2 + 0.5, // Staggered delay
                                    repeat: 1, // Run twice
                                    repeatDelay: 0.5
                                }
                            }}

                            className={`rounded-full h-1`}
                            style={{
                                width: idx === currentIndex ? 24 : 6,
                                backgroundColor: idx === currentIndex ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                                boxShadow: idx === currentIndex ? "0 0 10px rgba(255,255,255,0.8)" : "none"
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
