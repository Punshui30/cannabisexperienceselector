import React from 'react';
import { motion } from 'motion/react';
import { UIBlendRecommendation } from '../../types/domain';

interface BlendCompositionBarProps {
    blend: UIBlendRecommendation;
}

export function BlendCompositionBar({ blend }: BlendCompositionBarProps) {
    if (!blend || !blend.cultivars) return null;

    // Normalize
    const totalRatio = blend.cultivars.reduce((sum, c) => sum + (c.ratio || 0), 0);

    // Sort by ratio
    const segments = [...blend.cultivars]
        .sort((a, b) => (b.ratio || 0) - (a.ratio || 0))
        .map(c => ({
            ...c,
            percent: ((c.ratio || 0) / (totalRatio || 1)) * 100
        }));

    return (
        <div className="w-full flex flex-col gap-3 py-4">
            {/* The Bar */}
            <div className="w-full h-6 flex rounded-lg overflow-hidden bg-white/5 border border-white/10">
                {segments.map((segment, idx) => (
                    <motion.div
                        key={`${segment.name}-${idx}`}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${segment.percent}%`, opacity: 1 }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: "circOut" }}
                        className="h-full relative group"
                        style={{ backgroundColor: segment.color }} // Color from Source of Truth (via Adapter)
                    >
                        {/* Hover Tooltip - Minimal */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    </motion.div>
                ))}
            </div>

            {/* The Legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                {segments.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: segment.color }}
                        />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] uppercase tracking-wider text-white font-medium">
                                {segment.name}
                            </span>
                            <span className="text-[9px] text-white/40 font-mono">
                                {Math.round(segment.percent)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
