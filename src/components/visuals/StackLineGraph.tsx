import { motion } from 'motion/react';
import { getCultivarVisuals } from '../../lib/cultivarData';
import { UIStackRecommendation } from '../../types/domain';

export function StackLineGraph({ stack }: { stack: UIStackRecommendation }) {
    if (!stack.layers || stack.layers.length === 0) return null;

    // We assume 3 layers for a full stack (Tip, Core, Base).
    // Dimensions
    const width = 300;
    const height = 80;

    // Create 3 curves offset in time
    // Layer 0: Peak at 20%
    // Layer 1: Peak at 50%
    // Layer 2: Peak at 80%

    // Helper to generate a bell-like curve path
    const createPath = (peakX: number, amplitude: number) => {
        // Simple quadratic bezier or cubic
        // Start low, peak, end low
        // Spread (width of the bell)
        const spread = 120; // 40% of 300
        const startX = Math.max(0, peakX - spread);
        const endX = Math.min(width, peakX + spread);

        // M startY Q peakX peakY endX endY
        return `M ${startX} ${height} Q ${peakX} ${height - amplitude} ${endX} ${height}`;
    };

    return (
        <div className="w-full h-24 flex items-center justify-center opacity-80 pointer-events-none">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {stack.layers.map((layer, idx) => {
                    // Identify primary cultivar for this layer
                    const cultivarName = layer.cultivars[0]?.name || 'Unknown';
                    const visuals = getCultivarVisuals(cultivarName);

                    // Position logic
                    const peakX = (width * (idx + 1)) / (stack.layers.length + 1); // 1/4, 2/4, 3/4 or similar? 
                    // Actually better: 1/6, 3/6, 5/6 for centered in 3rds
                    const centeredPeak = (width * ((idx * 2) + 1)) / (stack.layers.length * 2);

                    return (
                        <motion.path
                            key={idx}
                            d={createPath(centeredPeak, 60)} // height 60
                            fill="none"
                            stroke={visuals.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1.5, delay: idx * 0.3 }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
