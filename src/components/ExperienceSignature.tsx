import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface ExperienceSignatureProps {
    data: {
        id: string;
        name: string;
        matchScore: number;
        confidence: number;
        targetEffects?: string[];
        terpeneProfile?: Record<string, number>;
        effects?: {
            onset: string;
            peak: string;
            duration: string;
        };
    };
    size?: number;
    active?: boolean;
    onClick?: () => void;
}

/**
 * Deterministic visual artifact derived from engine output.
 */
export const ExperienceSignature: React.FC<ExperienceSignatureProps> = ({ data, size = 120, active, onClick }) => {
    // 1. DYNAMIC SEEDING (Determinism)
    const seed = useMemo(() => {
        const str = `${data.id}-${data.name}-${data.matchScore}-${data.confidence}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }, [data.id, data.name, data.matchScore, data.confidence]);

    // Pseudo-random helper anchored to seed
    const seededRandom = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    // 2. GEOMETRY LOGIC
    // Base shape determined by effect balance vs volatility
    const effectCount = data.targetEffects?.length || Object.keys(data.terpeneProfile || {}).length || 3;

    // Calculate polarization (simplified: variance in terpene weights or high effect diversity)
    const weights = Object.values(data.terpeneProfile || { default: 1 });
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const polarization = (maxWeight - minWeight) / (maxWeight || 1);

    let shapeType: 'circular' | 'faceted' | 'irregular' = 'circular';
    if (polarization > 0.6) shapeType = 'faceted';
    if (data.confidence < 0.5) shapeType = 'irregular';

    // Vertex count derived from dominant clusters - Minimum 5 to avoid "Play Button" / Triangle look
    const vertexCount = Math.max(5, Math.min(12, effectCount + (seed % 5)));

    const points = useMemo(() => {
        const pts: [number, number][] = [];
        const center = size / 2;
        const radius = size * 0.4;

        for (let i = 0; i < vertexCount; i++) {
            const angle = (i / vertexCount) * Math.PI * 2;
            let r = radius;

            if (shapeType === 'faceted') {
                r = radius * (0.7 + seededRandom(i) * 0.5);
            } else if (shapeType === 'irregular') {
                r = radius * (0.5 + seededRandom(i) * 0.7);
            } else {
                r = radius * (0.9 + seededRandom(i) * 0.2);
            }

            pts.push([
                center + r * Math.cos(angle),
                center + r * Math.sin(angle)
            ]);
        }
        return pts;
    }, [vertexCount, shapeType, size, seed]);

    const pathData = `M ${points[0][0]},${points[0][1]} ${points.slice(1).map(p => `L ${p[0]},${p[1]}`).join(' ')} Z`;

    // 3. COLOR LOGIC
    const outcomeColors: Record<string, string> = {
        'Focus': '#00FFD1',
        'Relax': '#A855F7',
        'Sleep': '#6366F1',
        'Social': '#EAB308',
        'Relief': '#34D399',
        'Other': '#ffffff'
    };

    const dominantEffect = data.targetEffects?.[0] || 'Other';
    const primaryHue = outcomeColors[dominantEffect] || outcomeColors['Other'];
    const secondaryHue = outcomeColors[data.targetEffects?.[1] || 'Other'] || '#ffffff';

    const intensity = (data.matchScore / 100);

    // 4. MOTION LOGIC
    const parseTime = (timeStr?: string) => {
        if (!timeStr) return 5;
        const match = timeStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : 5;
    };

    const onsetValue = parseTime(data.effects?.onset);
    const peakValue = parseTime(data.effects?.peak);

    const expansionDuration = Math.max(1, Math.min(10, (1 / (onsetValue || 1)) * 50));
    const pulseAmplitude = active ? 1.1 : (0.9 + (intensity * 0.1));
    const pulseDuration = active ? 1.5 : Math.max(2, Math.min(8, (1 / (peakValue || 1)) * 100));

    return (
        <div
            className={`flex flex-col items-center justify-center p-2 select-none group cursor-pointer transition-all duration-700 ${active ? 'scale-125 bg-[#00FFD1]/5 rounded-3xl border border-[#00FFD1]/20 shadow-[0_0_30px_rgba(0,255,209,0.2)]' : 'hover:scale-105'}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            <div className="relative" style={{ width: size, height: size }}>
                {/* GLOW LAYER */}
                <motion.div
                    className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: primaryHue }}
                    animate={{
                        scale: active ? [1.2, 1.5, 1.2] : [1, 1.2, 1],
                        opacity: active ? [0.3, 0.6, 0.3] : [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: pulseDuration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* SVG ARTIFACT */}
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="relative z-10"
                >
                    <defs>
                        <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={primaryHue} />
                            <stop offset="100%" stopColor={secondaryHue} />
                        </linearGradient>

                        {data.confidence < 0.6 && (
                            <filter id={`noise-${seed}`}>
                                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                                <feComposite operator="in" in="noise" in2="SourceGraphic" />
                            </filter>
                        )}
                    </defs>

                    <motion.path
                        d={pathData}
                        fill={`url(#grad-${seed})`}
                        fillOpacity={active ? 0.9 : 0.6}
                        stroke={primaryHue}
                        strokeWidth={active ? 3 : 2}
                        strokeOpacity={active ? 1 : 0.8}
                        filter={data.confidence < 0.6 ? `url(#noise-${seed})` : undefined}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [1, pulseAmplitude, 1],
                            opacity: 1,
                            rotate: active ? [0, 15, 0, -15, 0] : (shapeType === 'irregular' ? [0, 5, 0, -5, 0] : 0)
                        }}
                        transition={{
                            scale: {
                                duration: pulseDuration,
                                repeat: Infinity,
                                ease: "linear"
                            },
                            rotate: {
                                duration: active ? 2 : 10,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            opacity: {
                                duration: expansionDuration / 10,
                                ease: "easeOut"
                            }
                        }}
                        style={{ originX: '50%', originY: '50%' }}
                    />

                    {/* Confidence Orbitals */}
                    {(data.confidence > 0.8 || active) && (
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size * 0.45}
                            fill="none"
                            stroke={primaryHue}
                            strokeWidth={active ? 1 : 0.5}
                            strokeDasharray="4 8"
                            animate={{ rotate: 360 }}
                            transition={{ duration: active ? 10 : 20, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                </svg>
            </div>

            <span className={`text-[8px] uppercase tracking-[0.3em] mt-2 font-black italic transition-colors duration-500 ${active ? 'text-[#00FFD1]' : 'text-white/40'}`}>
                Experience Signature
            </span>
        </div>
    );
};
