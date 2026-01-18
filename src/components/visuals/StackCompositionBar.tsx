import React from 'react';
import { motion } from 'motion/react';
import { getCultivarVisuals } from '../../lib/cultivarData';
import { UIStackRecommendation } from '../../types/domain';

interface StackCompositionBarProps {
    stack: UIStackRecommendation;
}

export function StackCompositionBar({ stack }: StackCompositionBarProps) {
    if (!stack || !stack.layers) return null;

    // 1. Flatten all cultivars from all layers
    const allCultivars = stack.layers.flatMap(layer =>
        layer.cultivars.map(c => ({
            name: c.name,
            // Calculate effective weight: (Cultivar Ratio) * (Layer Weight)
            weight: (c.ratio || 1) * (1 / stack.layers.length)
        }))
    );

    // 2. Normalize to percentages
    const totalWeight = allCultivars.reduce((sum, c) => sum + c.weight, 0);
    const segments = allCultivars.map(c => ({
        ...c,
        percent: (c.weight / totalWeight) * 100,
        visuals: getCultivarVisuals(c.name)
    })).sort((a, b) => b.percent - a.percent); // Sort strictly by size

    return (
        <div className="w-full flex flex-col gap-2">
            {/* The Bar */}
            <div className="w-full h-4 flex rounded-full overflow-hidden bg-white/5">
                {segments.map((segment, idx) => (
                    <motion.div
                        key={`${segment.name}-${idx}`}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${segment.percent}%`, opacity: 1 }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: "circOut" }}
                        className="h-full relative group"
                        style={{ backgroundColor: segment.visuals.color }}
                    >
                        {/* Hover Tooltip via Browser Native Title for now, or Custom if needed */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity" />
                    </motion.div>
                ))}
            </div>

            {/* The Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                {segments.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: segment.visuals.color }}
                        />
                        <span className="text-[10px] uppercase tracking-wider text-white/60">
                            {segment.name} <span className="text-white/40">{Math.round(segment.percent)}%</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
