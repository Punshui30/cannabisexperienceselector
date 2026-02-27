import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { PublicFeed } from './PublicFeed';
import { Globe, X, ChevronUp } from 'lucide-react';

// Typed motion div so TS accepts initial/animate/exit
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
    initial?: object;
    animate?: object;
    exit?: object;
    transition?: object;
    drag?: string | boolean;
    dragConstraints?: object;
    dragElastic?: number;
    onDragEnd?: (event: any, info: any) => void;
};
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

export function LiveNetworkDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const params = new URLSearchParams(window.location.search);
    const isTvMode = params.get('mode') === 'tv' || params.get('tv') === 'true';

    // Auto-open if TV mode
    useEffect(() => {
        if (isTvMode) {
            setIsOpen(true);
        }
    }, [isTvMode]);

    return (
        <>
            {/* The Trigger / Collapsed State */}
            {!isOpen && (
                <MotionDiv
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fixed top-24 right-0 z-[100] flex justify-end group interact-visible"
                >
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 pl-3 pr-4 py-2 bg-black/90 hover:bg-black border-l border-y border-white/20 rounded-l-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out translate-x-[calc(100%-34px)] hover:translate-x-0"
                    >
                        {/* Status Dot */}
                        <div className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFD1]"></span>
                        </div>

                        {/* Text (Hidden until hover/expand) */}
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Live Network
                        </span>
                    </button>

                    {/* Collapsed view indicator (Always visible part) */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none" />
                </MotionDiv>
            )}

            {/* The Expanded Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-40 flex flex-col">
                        {/* Backdrop */}
                        <MotionDiv
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer Panel - Opens from TOP */}
                        <MotionDiv
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.y < -100 || info.velocity.y < -500) {
                                    setIsOpen(false);
                                }
                            }}
                            className="relative w-full bg-[#0a0a0a] border-b border-white/10 rounded-b-3xl shadow-2xl overflow-hidden max-h-[70%] flex flex-col"
                        >
                            {/* Drag Handle */}
                            <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                                <MotionDiv
                                    className="w-12 h-1 bg-white/20 rounded-full"
                                    animate={{ y: [0, 6, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <Globe size={16} className="text-[#00FFD1]" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                                        Live Network
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">
                                <PublicFeed isTvMode={isTvMode} />
                                <div className="h-4" /> {/* Spacer */}
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
