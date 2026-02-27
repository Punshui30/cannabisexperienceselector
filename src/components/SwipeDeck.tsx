import { useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface SwipeDeckProps<T> {
    items: T[];
    renderItem: (item: T, isActive: boolean) => React.ReactNode;
    currentIndex: number;
    onIndexChange: (index: number) => void;
    className?: string;
}

const SWIPE_THRESHOLD = 50;

export function SwipeDeck<T>({ items, renderItem, currentIndex, onIndexChange, className = "" }: SwipeDeckProps<T>) {
    const controls = useAnimation();
    const prevIndexRef = useRef(currentIndex);

    useEffect(() => {
        if (currentIndex !== prevIndexRef.current) {
            const direction = currentIndex > prevIndexRef.current ? 1 : -1;
            animateToIndex(currentIndex, direction);
            prevIndexRef.current = currentIndex;
        }
    }, [currentIndex]);

    const animateToIndex = async (index: number, direction: number) => {
        // Swipe out
        await controls.start({
            x: -direction * window.innerWidth,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" }
        });

        // Reset to opposite side
        controls.set({ x: direction * window.innerWidth });

        // Swipe in
        await controls.start({
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        });
    };

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -SWIPE_THRESHOLD || velocity < -500) {
            if (currentIndex < items.length - 1) {
                onIndexChange(currentIndex + 1);
            } else {
                controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
            }
        } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
            if (currentIndex > 0) {
                onIndexChange(currentIndex - 1);
            } else {
                controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
            }
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
        }
    };

    const activeItem = items[currentIndex];

    if (!activeItem) return null;

    return (
        <div className={`relative w-full h-full ${className}`}>
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                dragDirectionLock={true}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ x: 0 }}
            >
                {renderItem(activeItem, true)}
            </motion.div>
        </div>
    );
}
