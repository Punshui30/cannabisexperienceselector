import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CultivarCard } from './shared/CultivarCard';

interface CultivarOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    cultivars: any[];
    blendName: string;
}

const MotionDiv = motion.div as any;

export function CultivarOverlay({ isOpen, onClose, cultivars, blendName }: CultivarOverlayProps) {
    // Escape key listener
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Scrim */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl glass-card p-6"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* Header Highlight */}
                        <div
                            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, #00FFD1 50%, transparent 100%)',
                                boxShadow: '0 0 10px #00FFD180'
                            }}
                        />

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] mb-1">
                                    Cultivar Composition
                                </h3>
                                <h2 className="text-xl font-serif text-white">{blendName}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-10 -mr-2 -mt-2 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                aria-label="Close cultivar details"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
                            {cultivars.map((cultivar, i) => (
                                <CultivarCard
                                    key={i}
                                    name={cultivar.name}
                                    profile={cultivar.profile}
                                    ratio={cultivar.ratio}
                                    prominentTerpenes={cultivar.prominentTerpenes}
                                    characteristics={cultivar.characteristics}
                                    context={{ density: 'default', showPercentage: true }}
                                />
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
                                Guided Outcomes™ Verified
                            </p>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
}
