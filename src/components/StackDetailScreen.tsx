import { motion } from 'motion/react';
import { UIStackRecommendation, UIPhase } from '../types/domain';
import { TerpeneDisplay } from './visuals/TerpeneDisplay';
import { getCultivarVisuals } from '../lib/cultivarData';
import { cn } from './ui/utils';

interface StackDetailScreenProps {
    stack: UIStackRecommendation;
    onBack: () => void;
}

export function StackDetailScreen({ stack, onBack }: StackDetailScreenProps) {
    // Use first cultivar color as fallback accent/theme
    const primaryColor = getCultivarVisuals(stack.layers[0]?.cultivars[0]?.name || "Unknown").color;

    return (
        <div className="fixed inset-0 z-40 bg-black flex flex-col font-sans">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-white/5 bg-black/50 backdrop-blur-md z-10 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-white/60 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                    <span>←</span> Back
                </button>
                <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Stack Detail</div>
            </div>

            {/* Scrollable Content - Single Vertical Column */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8 pb-20">

                    {/* 1. OVERVIEW SECTION */}
                    <section className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-widest text-[#00FFD1]"
                        >
                            Curated Experience
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl font-light text-white tracking-tight"
                        >
                            {stack.name}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60 leading-relaxed max-w-lg mx-auto"
                        >
                            {stack.description}
                        </motion.p>
                    </section>

                    {/* 2. TERPENES SECTION (Visuals only, no graphs) */}
                    <section className="flex justify-center border-t border-b border-white/5 py-8">
                        <TerpeneDisplay stack={stack} />
                    </section>

                    {/* 3. PHASES (Tip -> Core -> Base) */}
                    <div className="space-y-6 relative">
                        {/* Vertical Connector Line */}
                        <div className="absolute left-6 top-10 bottom-10 w-px bg-white/10 z-0 hidden md:block" />

                        {stack.layers.map((layer, idx) => {
                            const phaseCultivar = layer.cultivars[0]?.name || "Unknown";
                            const visual = getCultivarVisuals(phaseCultivar);

                            return (
                                <PhaseCard
                                    key={idx}
                                    phase={layer}
                                    color={visual.color}
                                    delay={0.3 + (idx * 0.1)}
                                    isLast={idx === stack.layers.length - 1}
                                />
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}

function PhaseCard({ phase, color, delay, isLast }: { phase: UIPhase; color: string; delay: number; isLast: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group relative z-10"
        >
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.07] transition-all overflow-hidden">
                {/* Color Accent Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }} />

                <div className="pl-4 flex flex-col md:flex-row gap-6 md:items-start">
                    {/* Header Info */}
                    <div className="md:w-1/3 space-y-2">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{phase.onsetEstimate}</div>
                        <h3 className="text-xl font-medium text-white">{phase.layerName.split(':')[0]}</h3>
                        <div className="text-xs text-white/50">{phase.layerName.split(':')[1]}</div>

                        {/* Cultivar Tag */}
                        <div className="pt-2">
                            <div className="flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-[11px] text-white/80 font-medium">
                                    {phase.cultivars.map(c => c.name).join(' + ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Text */}
                    <div className="flex-1 space-y-4 pt-2 md:pt-0">
                        <div>
                            <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-bold">Experience</div>
                            <p className="text-white/80 text-sm leading-relaxed border-l border-white/10 pl-3">
                                {phase.phaseIntent}
                            </p>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-bold">Process</div>
                            <p className="text-white/60 text-xs italic pl-3">
                                {phase.consumptionGuidance}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
