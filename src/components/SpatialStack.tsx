import { motion } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { getGlassCardStyles } from '../lib/glassStyles';

interface SpatialStackProps {
    data: UIStackRecommendation;
    compact?: boolean; // For card views vs detail views
}

export function SpatialStack({ data, compact = false }: SpatialStackProps) {
    // Determine layers
    const layers = data.layers || [];

    // Sort layers by timing if needed, or assume data order (Ignition -> Cruise -> Landing)
    // We want the "Base" (later phases) at the bottom? Or Top?
    // "Stacked" usually means Foundation at bottom.
    // Ignition (First) -> Top? Or Bottom?
    // User asked for "Layered Slabs". Usually time flows Top -> Bottom visually in lists,
    // but a physical stack builds Bottom -> Top.
    // Let's stick to the visual order: Top of the stack = First Phase (Ignition).

    return (
        <div className={`w-full flex flex-col items-center ${compact ? 'py-4' : 'py-8'}`}>
            {/* 3D Stack Container */}
            <div
                className="relative w-full max-w-[280px] perspective-[1000px] flex flex-col gap-1"
                style={{ perspective: '1000px' }}
            >
                {layers.map((layer, index) => {
                    const isFirst = index === 0;
                    const isLast = index === layers.length - 1;

                    // Determine Color
                    const mainCultivar = layer.cultivars?.[0];
                    const color = mainCultivar?.color || data.visualProfile?.color || '#ffffff';

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, rotateX: 10 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="relative group"
                        >
                            {/* The Slab */}
                            <div
                                className={`
                                    relative w-full h-16 sm:h-20
                                    flex items-center justify-between px-6
                                    border-l-4 border-r-4 border-y border-white/10
                                    transition-all duration-300
                                    hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]
                                    ${isFirst ? 'rounded-t-lg' : ''}
                                    ${isLast ? 'rounded-b-lg' : ''}
                                `}
                                style={{
                                    background: `linear-gradient(90deg, ${color}20, ${color}10)`,
                                    borderColor: `${color}60`,
                                    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.3)`
                                }}
                            >
                                {/* Left: Phase Name */}
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
                                        Phase {index + 1}
                                    </span>
                                    <span className="text-lg font-light text-white serif tracking-wide">
                                        {layer.layerName}
                                    </span>
                                </div>

                                {/* Right: Strain/Cultivar */}
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-[#00FFD1] uppercase tracking-widest">
                                        {mainCultivar?.name}
                                    </span>
                                    <span className="text-[9px] text-white/40 italic">
                                        {layer.onsetEstimate}
                                    </span>
                                </div>

                                {/* Depth/Side Glint */}
                                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                            </div>

                            {/* Connecting Line (if not last) */}
                            {!isLast && (
                                <div className="h-2 w-[90%] mx-auto border-x border-white/5 bg-black/20" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Total Duration Footnote */}
            {!compact && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2">
                        Total Protocol: {data.totalDuration}
                    </span>
                </div>
            )}
        </div>
    );
}
