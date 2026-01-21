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

        </div>
    );
}
