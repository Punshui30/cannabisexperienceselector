import { motion } from 'motion/react';
import { UIStackRecommendation } from '../types/domain';
import { getGlassCardStyles } from '../lib/glassStyles';
import { getCultivarVisuals } from '../lib/cultivarData';

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

                    // Determine Color via Lookup
                    const mainCultivar = layer.cultivars?.[0];
                    // Fallback heirarchy: 
                    // 1. Explicit color on cultivar object (if any)
                    // 2. Lookup via name (Primary Method)
                    // 3. Stack profile color
                    // 4. White fallback
                    const visuals = mainCultivar ? getCultivarVisuals(mainCultivar.name) : null;
                    const color = mainCultivar?.color || visuals?.color || data.visualProfile?.color || '#ffffff';

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
                                    relative w-full min-h-[80px] py-3
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
                                <div className="flex flex-col items-start min-w-[30%]">
                                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
                                        Phase {index + 1}
                                    </span>
                                    <span className="text-lg font-light text-white serif tracking-wide leading-tight">
                                        {layer.layerName}
                                    </span>
                                </div>

                                {/* Right: Strain/Cultivar list */}
                                <div className="flex flex-col items-end gap-1.5 flex-1 max-w-[65%]">
                                    {layer.type === 'blend' ? (
                                        <div className="flex flex-col items-end gap-1 w-full">
                                            <span className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5 self-end">Blend Composition</span>
                                            {layer.cultivars.map((c, i) => {
                                                // Resolve color for this specific cultivar
                                                // Fallback: Check profile (sativa/indica/hybrid) string match
                                                let cColor = '#10B981'; // Default hybrid/green
                                                if (c.profile?.toLowerCase().includes('sativa')) cColor = '#F59E0B';
                                                if (c.profile?.toLowerCase().includes('indica')) cColor = '#8B5CF6';

                                                // Check if explicit visuals exist (overrides profile)
                                                const cVis = getCultivarVisuals(c.name);
                                                if (cVis && cVis.color) cColor = cVis.color;

                                                return (
                                                    <div key={i} className="flex items-center gap-2 bg-black/20 rounded-full px-3 py-1 border border-white/5 w-fit ml-auto">
                                                        <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: cColor, color: cColor }} />
                                                        <span className="text-xs font-bold tracking-wide text-white leading-none">
                                                            {c.name}
                                                        </span>
                                                        {c.ratio && (
                                                            <span className="text-[9px] text-white/40 font-mono ml-1 border-l border-white/10 pl-2">
                                                                {c.ratio}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // Single Cultivar (Stacks)
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest text-right"
                                            style={{
                                                color: color,
                                                textShadow: `0 0 10px ${color}40`
                                            }}
                                        >
                                            {mainCultivar?.name}
                                        </span>
                                    )}
                                    <span className="text-[9px] text-white/40 italic mt-1">
                                        {layer.onsetEstimate}
                                    </span>
                                </div>

                                {/* Depth/Side Glint - Colorized */}
                                <div
                                    className="absolute inset-y-0 right-0 w-8 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(to left, ${color}20, transparent)`
                                    }}
                                />
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
