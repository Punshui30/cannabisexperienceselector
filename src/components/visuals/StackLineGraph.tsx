import { motion } from 'motion/react';
import { getStackTerpeneProfile } from '../../lib/cultivarData';
import { UIStackRecommendation } from '../../types/domain';

export function StackLineGraph({ stack }: { stack: UIStackRecommendation }) {
    if (!stack.layers || stack.layers.length === 0) return null;

    // SEMANTIC BINDING: Graph visualizes TERPENE BALANCE
    const topTerpenes = getStackTerpeneProfile(stack);

    // Mandate: "If fewer than 3 terpenes exist -> do not render"
    if (topTerpenes.length < 3) return null;

    const width = 120;
    const height = 64;
    const barWidth = 12;
    const gap = 24;

    const totalGroupWidth = (3 * barWidth) + (2 * gap);
    const startX = (width - totalGroupWidth) / 2;

    // Normalize relative to the dominant terpene
    const maxWeight = topTerpenes[0].weight;

    return (
        <div className="w-full h-full flex items-end justify-center pb-4 opacity-90 pointer-events-none">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMax meet">
                {topTerpenes.map((item, idx) => {
                    const normalizedHeight = (item.weight / maxWeight) * height;
                    const x = startX + (idx * (barWidth + gap));
                    const y = height - normalizedHeight;

                    return (
                        <motion.rect
                            key={item.name}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={normalizedHeight}
                            rx={2}
                            fill={item.color}
                            initial={{ height: 0, y: height }}
                            animate={{ height: normalizedHeight, y }}
                            transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
