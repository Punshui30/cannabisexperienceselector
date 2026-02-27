import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Layers } from 'lucide-react';
import { CultivarCard } from './shared/CultivarCard';

interface BlendDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    cultivars: any[];
    effects?: {
        onset: string;
        peak: string;
        duration: string;
    };
    blendName: string;
    initialTab?: 'composition' | 'timeline';
}

const MotionDiv = motion.div as any;

export function BlendDetailOverlay({
    isOpen,
    onClose,
    cultivars,
    effects,
    blendName,
    initialTab = 'composition'
}: BlendDetailOverlayProps) {
    const [activeTab, setActiveTab] = useState<'composition' | 'timeline'>(initialTab);

    // Sync activeTab with initialTab when overlay opens
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

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
                        className="relative w-full max-w-md bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl glass-card flex flex-col"
                        style={{ maxHeight: '85vh' }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* Header Highlight */}
                        <div
                            className="absolute top-0 left-[10%] right-[10%] h-[1px] shrink-0"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, #00FFD1 50%, transparent 100%)',
                                boxShadow: '0 0 10px #00FFD180'
                            }}
                        />

                        {/* Header Area */}
                        <div className="p-6 pb-0 shrink-0">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] mb-1">
                                        Blend Details
                                    </h3>
                                    <h2 className="text-xl font-serif text-white">{blendName}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-10 -mr-2 -mt-2 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                    aria-label="Close details"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs Trigger UI */}
                            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
                                <button
                                    onClick={() => setActiveTab('composition')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'composition' ? 'bg-[#00FFD1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Layers size={14} />
                                    <span>Composition</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'timeline' ? 'bg-[#00FFD1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Clock size={14} />
                                    <span>Timeline</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Area (Scrollable) */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 pr-1 scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {activeTab === 'composition' ? (
                                    <MotionDiv
                                        key="composition"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-3"
                                    >
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
                                    </MotionDiv>
                                ) : (
                                    <MotionDiv
                                        key="timeline"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Onset</span>
                                                <span className="text-sm text-white font-medium">{effects?.onset || '10-15 mins'}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Peak</span>
                                                <span className="text-sm text-white font-medium">{effects?.peak || '45-60 mins'}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Duration</span>
                                                <span className="text-sm text-white font-medium">{effects?.duration || '2-3 hours'}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-[#00FFD1]/5 border border-[#00FFD1]/10">
                                            <p className="text-[10px] text-white/70 leading-relaxed italic">
                                                Timeline estimates based on StrainMath™ chemistry projections for this specific ratio. Actual timing may vary by metabolism and consumption method.
                                            </p>
                                        </div>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Area */}
                        <div className="p-6 pt-0 mt-3 border-t border-white/5 text-center shrink-0">
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] py-4">
                                Guided Outcomes™ Verified
                            </p>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
}
