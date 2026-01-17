import { motion } from 'motion/react';
import { UIStackRecommendation, assertStack, EngineResult } from '../types/domain';
import logoImg from '../assets/logo.png';

interface StackDetailScreenProps {
    stack: EngineResult;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    // Runtime Guard
    assertStack(stack);

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col font-sans">
            {/* Header */}
            <div className="flex-none flex items-center justify-between mb-8 z-20 relative">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40 group-hover:text-[#00FFD1] transition-colors">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs uppercase tracking-widest text-white/40">Back</span>
                </button>

                <div className="flex items-center gap-3">
                    <img src={logoImg} alt="GO logo" className="w-8 h-auto" />
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-normal text-white serif">Guided Outcomes</span>
                        <span className="text-[10px] text-white/40">Stack Mode</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full space-y-8 pb-12">
                {/* Title Card */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-light text-white serif tracking-tight">{stack.name}</h1>
                    <p className="text-white/60 max-w-lg mx-auto">{stack.reasoning}</p>
                    <div className="inline-block px-4 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-xs font-bold uppercase tracking-widest">
                        Multi-Phase • {stack.totalDuration}
                    </div>
                </div>

                {/* Layers */}
                <div className="relative border-l-2 border-white/10 ml-6 pl-8 space-y-12 py-4">
                    {stack.layers.map((layer, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="relative"
                        >
                            {/* Time Marker */}
                            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-black border-2 border-[#00FFD1] z-10" />
                            <span className="absolute -left-[120px] top-0 text-xs text-white/40 font-mono text-right w-16 pt-0.5">
                                {layer.timing}
                            </span>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#00FFD1]" />

                                <h3 className="text-xl text-white font-medium mb-1">{layer.layerName}</h3>
                                <p className="text-sm text-[#00FFD1] uppercase tracking-wider font-bold mb-4">{layer.purpose}</p>

                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                    {layer.cultivars.map((c, cIdx) => (
                                        <div key={cIdx} className="flex justify-between items-center">
                                            <span className="text-white/80 font-medium">{c.name}</span>
                                            <span className="text-white/40 text-sm italic">{Math.round(c.ratio * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
