import { motion } from 'motion/react';
import { getCultivarVisuals } from '../../lib/cultivarData';
import { UIStackRecommendation } from '../../types/domain';

export function StackLineGraph({ stack }: { stack: UIStackRecommendation }) {
    if (!stack.layers || stack.layers.length === 0) return null;

    // AGGREGATE COMPOSITION LOGIC
    // Calculate total weight for each cultivar across all layers.
    // Assumption: Each layer is equal length/weight (1/Length of Stack).
    // Inner Ratio splits that layer's weight.

    const totalLayers = stack.layers.length;
    const layerWeight = 1 / totalLayers; // e.g., 0.33 for 3 layers

    const compositionMap: Record<string, number> = {};

    stack.layers.forEach(layer => {
        layer.cultivars.forEach(cultivar => {
            const weight = (cultivar.ratio || 1) * layerWeight;
            if (!compositionMap[cultivar.name]) {
                compositionMap[cultivar.name] = 0;
            }
            compositionMap[cultivar.name] += weight;
        });
    });

    // Convert to array and sort by weight descending
    const composition = Object.entries(compositionMap)
        .map(([name, weight]) => ({ name, weight }))
        .sort((a, b) => b.weight - a.weight);

    // Take exact top 3 (or pad if fewer)
    const top3 = composition.slice(0, 3);

    // Normalize heights relative to the max bar (so max bar is always full height? Or absolute percentage?)
    // "Each bar height = percentage..." -> Absolute feels more scientific but might be small. 
    // Let's use Relative to Max but capped?
    // User said: "different heights if percentages differ".
    // If Split is 33/33/33 -> All equal.
    // If Split is 80/10/10 -> Big drop.
    // Max height = 100%. Max weight possible is 1.0 (100%).

    // Dimensions
    const width = 120; // Compact width
    const height = 64;
    const barWidth = 12; // Thin scientific bars
    const gap = 24;

    // Calculate X positions to center the group
    // Group width = (3 * barWidth) + (2 * gap) = 36 + 48 = 84.
    // Center in 120 width: (120 - 84) / 2 = 18 start offset.

    const totalGroupWidth = (3 * barWidth) + (2 * gap);
    const startX = (width - totalGroupWidth) / 2;

    // Pad to 3 items if needed for layout consistency (empty slots?)
    // "Exactly 3 vertical bars". If only 1 cultivar exist? (e.g. Mono stack).
    // Then 1 bar. But Layout allows 3. We render up to 3.
    // If fewer than 3, we just render those available? Or placeholders?
    // "Exactly 3 vertical bars" implies the slotting.
    // I will render actual data. If only 2, only 2 bars.

    return (
        <div className="w-full h-full flex items-end justify-center pb-4 opacity-90 pointer-events-none">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMax meet">
                {/* Optional Baseline */}
                {/* <line x1={0} y1={height} x2={width} y2={height} stroke="white" strokeOpacity={0.1} strokeWidth={1} /> */}

                {top3.map((item, idx) => {
                    const visuals = getCultivarVisuals(item.name);
                    // Height calculation: Weight is 0.0-1.0. 
                    // Scale it up. Max height 64px corresponds to 50%? or 100%?
                    // Most stacks split 33-33-33. So 0.33 should be significant height.
                    // Let's map 0.5 (50%) to Full Height (64px) to make bars visible? 
                    // Or strictly percentage? 
                    // If strictly percentage: 0.33 * 50px = ~16px. Very small.
                    // I will Normalize to the Highest Value component being 100% of the graph height?
                    // "visually encode relative proportion". Relative to EACH OTHER.
                    // Normalizing to Max makes distinctness clearer.
                    // BUT user said "height = percentage of stack contribution".
                    // If all are 33%, all are same height.
                    // I'll Normalize relative to the Maximum bar in the set = 100% Height.
                    // This ensures good visual usage of space.

                    const maxWeight = top3[0].weight; // Since sorted descending
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
                            rx={2} // Rounded top
                            fill={visuals.color}
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
