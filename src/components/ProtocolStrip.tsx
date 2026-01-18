import { UIStackRecommendation, UIBlendRecommendation, EngineResult } from '../types/domain';
import { getCultivarVisuals } from '../lib/cultivarData';
import { motion } from 'motion/react';

interface ProtocolStripProps {
    data: EngineResult;
}

export function ProtocolStrip({ data }: ProtocolStripProps) {
    const isStack = data.kind === 'stack';
    const stack = isStack ? (data as UIStackRecommendation) : null;
    const blend = !isStack ? (data as UIBlendRecommendation) : null;

    // Normalize data into "Phases" for rendering
    const phases = isStack
        ? stack!.layers
        : [{
            layerName: "Composite Blend",
            cultivars: blend!.components,
            description: "A harmonized combination of selected chemotypes.",
            phaseIntent: "Targeted Effect",
            timing: "0:00"
        }];

    return (
        <div className="w-full flex flex-col items-center">
            {/* --- STRIP VISUAL --- */}
            <div className="relative w-16 h-64 my-6 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col-reverse">
                {phases.map((phase, phaseIdx) => {
                    const phaseGenerics = isStack ? phase : { cultivars: blend!.components };

                    return (
                        <div key={phaseIdx} className="flex-1 w-full relative group">
                            {/* Phase Separator (Gold Hairline) */}
                            {phaseIdx > 0 && (
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#FFD700] z-20 opacity-50 shadow-[0_0_5px_#FFD700]" />
                            )}

                            {/* Cultivar Layers */}
                            {phase.cultivars.map((cultivar, cIdx) => {
                                const visuals = getCultivarVisuals(cultivar.name);
                                return (
                                    <div
                                        key={cIdx}
                                        className="absolute inset-0 transition-opacity duration-500"
                                        style={{
                                            backgroundColor: visuals.color,
                                            opacity: 0.8 / phase.cultivars.length, // Layered translucency
                                            mixBlendMode: 'screen'
                                        }}
                                    />
                                );
                            })}

                            {/* Subtle Pulse/Glow */}
                            <motion.div
                                className="absolute inset-0 bg-white opacity-0"
                                animate={{ opacity: [0, 0.1, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: phaseIdx * 1 }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* --- TEXT EXPLANATION --- */}
            <div className="w-full max-w-sm px-4 space-y-6">
                {phases.map((phase, idx) => (
                    <div key={idx} className="flex flex-col text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {isStack && (
                                <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-widest">0{idx + 1}</span>
                            )}
                            <h4 className="text-sm font-serif text-white">{phase.layerName}</h4>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed italic mb-2">
                            "{phase.phaseIntent || phase.description}"
                        </p>

                        {/* Explicit Blending Text */}
                        {phase.cultivars.length > 1 && (
                            <p className="text-[10px] text-white/40 uppercase tracking-wide">
                                Blends {phase.cultivars.map(c => c.name).join(' + ')}
                            </p>
                        )}

                        {/* Single Cultivar Indicator */}
                        {phase.cultivars.length === 1 && (
                            <p className="text-[10px] text-white/40 uppercase tracking-wide">
                                {phase.cultivars[0].name}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
