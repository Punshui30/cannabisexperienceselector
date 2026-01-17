
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'motion/react';

interface SwipeDeckProps<T> {
    items: T[];
    renderItem: (item: T, isActive: boolean) => React.ReactNode;
    onSwipe?: (index: number) => void;
    className?: string;
    enableGuidance?: boolean;
}

const SWIPE_THRESHOLD = 50;

export function SwipeDeck<T>({ items, renderItem, onSwipe, className = "", enableGuidance = true }: SwipeDeckProps<T>) {
    // RUNTIME SAFETY: Filter invalid items immediately
    // This handles holes, undefineds, and non-objects that might slip through
    const safeItems = Array.isArray(items)
        ? items.filter((i): i is T & object => !!i && typeof i === 'object')
        : [];

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
            if (currentIndex < safeItems.length - 1) {
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

    const activeItem = safeItems[currentIndex];

    if (!activeItem) return null;

    const activeKey = activeItem
        ? ('id' in activeItem ? (activeItem as any).id
            : 'data' in activeItem && (activeItem as any).data?.id ? (activeItem as any).data.id
                : `fallback-${currentIndex}`)
        : `empty-${currentIndex}`;

    // SHAPE VALIDATION: Ensure item matches one of our known contracts
    // We allow 'kind' (OutcomeExemplar) OR 'visualProfile' (BlendScenario)
    if (activeItem && !('kind' in activeItem) && !('visualProfile' in activeItem)) {
        console.warn('SwipeDeck: Item does not match known shape (missing kind/visualProfile)', activeItem);
        // We don't return null here to avoid invisible failures, but ideally we should.
        // For now, allow renderItem to handle it or fail gracefully.
    }

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Current Card */}
            <motion.div
                key={activeKey} // FORCE REMOUNT ON IDENTITY CHANGE
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2} // Linear resistance
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full h-full absolute inset-0 touch-pan-y"
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
                            <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="drop-shadow-lg animate-pulse">
                                <path d="M20 50 Q 50 20 80 50" strokeDasharray="4 4" className="opacity-50" />
                                <path d="M20 50 Q 50 20 80 50" pathLength="1" strokeDasharray="1" strokeDashoffset="0">
                                    <animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                                </path>
                                <path d="M75 45 L80 50 L75 55" />
                            </svg>
                            {/* Hand icon hinting swipe */}
                            <motion.div
                                animate={{ x: [0, 40, 0], y: [0, -10, 0], rotate: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-0 left-0 text-white/80"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C13.1 2 14 2.9 14 4V11.53C14.3 11.23 14.63 11.05 14.97 11.05C15.93 11.05 16.79 11.75 16.96 12.71L17.65 16.63C17.78 17.38 17.62 18.15 17.21 18.79L14.77 22.58C14.53 22.95 14.12 23.17 13.68 23.17H8.86C8.24 23.17 7.7 22.76 7.54 22.16L6.08 16.63C6 16.32 6.07 16 6.27 15.75L8 13.59V4C8 2.9 8.9 2 10 2C11.1 2 12 2 12 2ZM12 4H10V11H12V4Z" />
                                </svg>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination Indicators (Optional but helpful for context) */}
            {safeItems.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
                    {safeItems.map((_, idx) => (
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
