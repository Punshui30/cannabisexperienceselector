
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'motion/react';
import { MoveLeft } from 'lucide-react';

interface SwipeDeckProps<T> {
    items: T[];
    renderItem: (item: T, isActive: boolean) => React.ReactNode;
    onSwipe?: (index: number) => void;
    className?: string;
    enableGuidance?: boolean;
}

const SWIPE_THRESHOLD = 50;

export function SwipeDeck<T>({ items, renderItem, onSwipe, className = "", enableGuidance = true }: SwipeDeckProps<T>) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const controls = useAnimation();
    const [showGuidance, setShowGuidance] = useState(false);

    // Session storage key for guidance
    const GUIDANCE_KEY = "go_swipe_hint_shown";

    useEffect(() => {
        if (enableGuidance) {
            const hasShown = sessionStorage.getItem(GUIDANCE_KEY);
            if (!hasShown && items.length > 1) {
                setShowGuidance(true);
                // Auto-dismiss after 3s
                const timer = setTimeout(() => {
                    setShowGuidance(false);
                    sessionStorage.setItem(GUIDANCE_KEY, "true");
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [enableGuidance, items.length]);

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

                // Dismiss guidance on interaction
                if (showGuidance) {
                    setShowGuidance(false);
                    sessionStorage.setItem(GUIDANCE_KEY, "true");
                }
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
        <div className={`relative w-full h-full ${className}`}> {/* Removed overflow-hidden */}
            {/* Current Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2} // Linear resistance
                dragDirectionLock={true} // STRICT HORIZONTAL LOCK
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full h-full absolute inset-0" // Removed touch-pan-y
                style={{ x: 0 }}
            >
                {renderItem(activeItem, true)}
            </motion.div>

            {/* Guidance Overlay */}
            <AnimatePresence>
                {showGuidance && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center p-12"
                    >
                        {/* Curved arrow graphic using SVG */}
                        <div className="relative w-32 h-32 opacity-80">
                            {/* Abstract Gesture Icon */}
                            {/* Hand Gesture Icon */}
                            <motion.div
                                animate={{ x: [0, -40, 0], rotate: [0, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-0 left-8"
                            >
                                <MoveLeft className="w-16 h-16 text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] fill-white/10" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination Indicators (Optional but helpful for context) */}
            {items.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
                    {items.map((_, idx) => (
                        <div
                            key={idx}
                            className={`transition-all duration-300 rounded-full h-1 ${idx === currentIndex ? 'w-6 bg-white shadow-[0_0_10px_white]' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
