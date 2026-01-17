import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'motion/react';

interface SwipeDeckProps<T> {
    items: T[];
    renderItem: (item: T, isActive: boolean) => React.ReactNode;
    onSwipe?: (index: number) => void;
    className?: string;
}

const SWIPE_THRESHOLD = 50;

export function SwipeDeck<T>({
    items,
    renderItem,
    onSwipe,
    className = ''
}: SwipeDeckProps<T>) {

    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const [index, setIndex] = useState(0);
    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (info.offset.x < -SWIPE_THRESHOLD && index < safeItems.length - 1) {
            const next = index + 1;
            setIndex(next);
            onSwipe?.(next);
        }
        if (info.offset.x > SWIPE_THRESHOLD && index > 0) {
            const prev = index - 1;
            setIndex(prev);
            onSwipe?.(prev);
        }
        controls.start({ x: 0 });
    };

    const active = safeItems[index];
    if (!active) return null;

    return (
        <div className={`relative w-full h-full ${className}`}>
            <motion.div
                drag="x"
                onDragEnd={handleDragEnd}
                animate={controls}
                className="absolute inset-0"
            >
                {renderItem(active, true)}
            </motion.div>
        </div>
    );
}
