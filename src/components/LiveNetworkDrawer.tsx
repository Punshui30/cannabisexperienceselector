import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'motion/react';
import { PublicFeed } from './PublicFeed';
import { Globe, X, ChevronUp } from 'lucide-react';

export function LiveNetworkDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const controls = useAnimation();
    const constraintsRef = useRef(null);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
            setIsOpen(false);
        } else if (info.offset.y < -50) {
            setIsOpen(true);
        }
    };

    return (
        <>
            {/* The Trigger / Collapsed State */}
            {!isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 right-4 z-[100] pointer-events-none"
                >
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full transition-all shadow-lg shadow-black/50 group pointer-events-auto"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFD1]"></span>
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide uppercase group-hover:text-[#00FFD1] transition-colors">
                                Live Network
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider">
                            <span>View Activity</span>
                            <ChevronUp size={14} />
                        </div>
                    </button>
                </motion.div>
            )}

            {/* The Expanded Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-40 flex flex-col">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer Panel - Opens from TOP */}
                        <motion.div
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
                            className="relative w-full bg-[#0a0a0a] border-b border-white/10 rounded-b-3xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col"
                        >
                            {/* Drag Handle */}
                            <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                                <div className="w-12 h-1 bg-white/20 rounded-full" />
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
                                <PublicFeed />
                                <div className="h-4" /> {/* Spacer */}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
