import { resolveCultivarVisuals, resolveTerpeneVisuals } from '../../lib/visuals';
import { useGlobalCultivar } from '../../context/GlobalCultivarContext';

interface CultivarCardProps {
    name: string;
    profile?: string;
    ratio?: number;
    prominentTerpenes?: string[];
    characteristics?: string[];
    context?: {
        density?: 'compact' | 'default' | 'spacious';
        showPercentage?: boolean;
    };
}

/**
 * THE CANONICAL CULTIVAR COMPONENT
 * 
 * Rules:
 * - Same color dot, same typography, same terpene pill style everywhere
 * - Context may ONLY affect: density (padding), percentage visibility
 * - Context may NOT change: visual language, interaction affordances
 * - Always clickable → Opens Global COA Modal
 */
export function CultivarCard({
    name,
    profile = 'Hybrid',
    ratio,
    prominentTerpenes = [],
    characteristics = [],
    context = {}
}: CultivarCardProps) {
    const { density = 'default', showPercentage = true } = context;
    const { openCultivar } = useGlobalCultivar();

    const visuals = resolveCultivarVisuals(name, profile);

    // Density mapping
    const paddingClass = {
        compact: 'p-3',
        default: 'p-4',
        spacious: 'p-5'
    }[density];

    return (
        <div
            onClick={() => openCultivar(name)}
            className={`${paddingClass} rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {/* CANONICAL COLOR DOT */}
                    <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                            backgroundColor: visuals.primaryColor,
                            boxShadow: visuals.glowStyle
                        }}
                    />
                    <div>
                        {/* CANONICAL TYPOGRAPHY */}
                        <div className="text-sm font-medium text-white group-hover:text-[#00FFD1] transition-colors">
                            {name}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">
                            {profile}
                        </div>
                    </div>
                </div>

                {/* PERCENTAGE (conditional) */}
                {showPercentage && ratio !== undefined && (
                    <div className="text-lg font-bold text-[#00FFD1]">
                        {Math.round(ratio * 100)}%
                    </div>
                )}
            </div>

            {/* CANONICAL TERPENE PILLS */}
            {prominentTerpenes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {prominentTerpenes.map(t => {
                        const tVis = resolveTerpeneVisuals(t);
                        return (
                            <span
                                key={t}
                                className="text-[9px] px-2 py-0.5 rounded-full"
                                style={tVis.badgeStyle}
                            >
                                {t}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* CHARACTERISTICS (optional metadata) */}
            {characteristics.length > 0 && (
                <div className="mt-2 text-[10px] text-white/50">
                    {characteristics.join(' • ')}
                </div>
            )}
        </div>
    );
}
