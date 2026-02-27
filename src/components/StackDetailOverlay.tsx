import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Activity, Info } from 'lucide-react';
import { CultivarCard } from './shared/CultivarCard';
import { UIStackRecommendation } from '../types/domain';
import { normalizeStackWeights } from '../lib/normalizeStackWeights';
import { resolveCultivarVisuals } from '../lib/visuals';

interface StackDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    stack: UIStackRecommendation;
    initialTab?: 'protocol' | 'cultivars' | 'info';
}

const MotionDiv = motion.div as any;

export function StackDetailOverlay({
    isOpen,
    onClose,
    stack,
    initialTab = 'protocol'
}: StackDetailOverlayProps) {
    const [activeTab, setActiveTab] = useState<'protocol' | 'cultivars' | 'info'>(initialTab);

    // Sync activeTab with initialTab when overlay opens
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // Escape key listener & Scroll lock
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

    if (!stack) return null;

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
                        className="relative w-full max-w-lg bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl glass-card flex flex-col"
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
                                        Stack Protocol
                                    </h3>
                                    <h2 className="text-xl font-serif text-white">{stack.name}</h2>
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
                                    onClick={() => setActiveTab('protocol')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === 'protocol' ? 'bg-[#00FFD1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Activity size={14} />
                                    <span>Protocol</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('cultivars')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === 'cultivars' ? 'bg-[#00FFD1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Layers size={14} />
                                    <span>Cultivars</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === 'info' ? 'bg-[#00FFD1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Info size={14} />
                                    <span>Info</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Area (Scrollable) */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 pr-1 scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {activeTab === 'protocol' && (
                                    <MotionDiv
                                        key="protocol"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-3">
                                            {stack.layers.map((layer, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold">{idx + 1}</span>
                                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{layer.layerName}</h4>
                                                        </div>
                                                        <span className="text-[10px] text-[#00FFD1] font-bold uppercase tracking-widest">{layer.phaseIntent}</span>
                                                    </div>
                                                    <p className="text-xs text-white/60 leading-relaxed italic mb-3">
                                                        "{layer.whyThisPhase}"
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {layer.cultivars.map((cv, cidx) => (
                                                            <div key={cidx} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/5">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: resolveCultivarVisuals(cv.name).primaryColor }} />
                                                                <span className="text-[9px] text-white/80 font-medium">{cv.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 rounded-xl bg-[#00FFD1]/5 border border-[#00FFD1]/10">
                                            <div className="flex items-center gap-2 mb-2 text-[#00FFD1]">
                                                <Activity size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Stack Dynamics</span>
                                            </div>
                                            <p className="text-[10px] text-white/70 leading-relaxed">
                                                Expected duration of {stack.totalDuration}. Each phase is designed to peak sequentially, creating a controlled {stack.layers.length}-stage progression.
                                            </p>
                                        </div>
                                    </MotionDiv>
                                )}

                                {activeTab === 'cultivars' && (
                                    <MotionDiv
                                        key="cultivars"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-3"
                                    >
                                        {normalizeStackWeights(stack.layers.flatMap(l => l.cultivars)).map((item, i) => (
                                            <CultivarCard
                                                key={i}
                                                name={item.name}
                                                profile={item.original.profile}
                                                ratio={item.percent / 100}
                                                prominentTerpenes={[]}
                                                characteristics={item.original.characteristics}
                                                context={{ density: 'default', showPercentage: true }}
                                            />
                                        ))}
                                    </MotionDiv>
                                )}

                                {activeTab === 'info' && (
                                    <MotionDiv
                                        key="info"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-1.5 flex-shrink-0" />
                                                <p className="text-xs text-white/70 leading-relaxed">
                                                    <span className="text-white font-bold uppercase tracking-widest block text-[10px] mb-0.5">Sequential Stacking</span>
                                                    Stacks are layered sequences designed for specific phases, ensuring chemistry peaks at different intervals.
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-1.5 flex-shrink-0" />
                                                <p className="text-xs text-white/70 leading-relaxed">
                                                    <span className="text-white font-bold uppercase tracking-widest block text-[10px] mb-0.5">Order of Consumption</span>
                                                    Layer 1 is always the foundation (tip of joint). Layer {stack.layers.length} is the finisher (base).
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] mt-1.5 flex-shrink-0" />
                                                <p className="text-xs text-white/70 leading-relaxed">
                                                    <span className="text-white font-bold uppercase tracking-widest block text-[10px] mb-0.5">Transition States</span>
                                                    As one layer tapers, the next engages, preventing "chemical fatigue" and maintaining experience clarity.
                                                </p>
                                            </div>
                                        </div>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Area */}
                        <div className="p-6 pt-0 mt-3 border-t border-white/5 text-center shrink-0">
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] py-4">
                                Guided Outcomes™ Protocol Verified
                            </p>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
}
