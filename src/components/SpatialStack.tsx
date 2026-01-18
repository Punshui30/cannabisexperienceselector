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
                    // Fix: UIStackRecommendation does not typically have visualProfile on the top level in this domain, 
                    // and cultivar objects in layers don't have color properties directly.
                    const color = visuals?.color || '#ffffff';

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
                                    relative w-full py-4 px-6
                                    flex flex-col gap-4
                                    border-l-4 border-r-4 border-y border-white/5
                                    transition-all duration-300
                                    hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]
                                    ${isFirst ? 'rounded-t-xl' : ''}
                                    ${isLast ? 'rounded-b-xl' : ''}
                                `}
                                style={{
                                    background: `linear-gradient(180deg, ${color}15, ${color}05)`,
                                    borderColor: `${color}40`,
                                    boxShadow: `0 4px 20px -5px rgba(0, 0, 0, 0.5)`
                                }}
                            >
                                {/* Header: Phase Name */}
                                <div className="flex justify-between items-baseline border-b border-white/5 pb-2 mb-1">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold mb-0.5">
                                            Phase {index + 1}
                                        </span>
                                        <span className="text-xl text-white font-serif tracking-wide">
                                            {layer.layerName}
                                        </span>
                                    </div>
                                    {/* Optional: Phase timing or type indicator if needed */}
                                </div>

                                {/* Content: Strain/Cultivar list (Full Width) */}
                                <div className="flex flex-col gap-3">
                                    {layer.cultivars.map((c, i) => {
                                        // Resolve colors
                                        let cColor = '#10B981';
                                        if (c.profile?.toLowerCase().includes('sativa')) cColor = '#F59E0B';
                                        if (c.profile?.toLowerCase().includes('indica')) cColor = '#8B5CF6';

                                        const cVis = getCultivarVisuals(c.name);
                                        if (cVis && cVis.color) cColor = cVis.color;

                                        // Ratio for visual bar (default to equal split if missing)
                                        const ratio = c.ratio || (1 / layer.cultivars.length);
                                        const percent = Math.round(ratio * 100);

                                        return (
                                            <div key={i} className="relative py-1">
                                                {/* Text Row */}
                                                <div className="flex justify-between items-end relative z-10 mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                                                            style={{ backgroundColor: cColor, color: cColor }}
                                                        />
                                                        <span className="text-sm font-medium text-white/90">
                                                            {c.name}
                                                        </span>
                                                    </div>
                                                    {/* Hide % if singular, show if blend */}
                                                    {layer.cultivars.length > 1 && (
                                                        <span className="text-[10px] font-mono text-white/40">
                                                            {percent}%
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Visual Progress Bar (Contribution) */}
                                                {layer.cultivars.length > 1 && (
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percent}%` }}
                                                            transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                                                            className="h-full rounded-full opacity-60"
                                                            style={{ backgroundColor: cColor }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Color Glint on Right Edge */}
                                <div
                                    className="absolute inset-y-0 right-0 w-8 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(to left, ${color}20, transparent)`
                                    }}
                                />
                            </div>

                            {/* Connecting Line (if not last) */}
                            {!isLast && (
                                <div className="h-1 w-[90%] mx-auto border-x border-white/5 bg-black/20" />
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
