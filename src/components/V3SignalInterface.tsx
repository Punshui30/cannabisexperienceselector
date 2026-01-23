import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnginePhase } from '../types/domain';

interface V3SignalInterfaceProps {
    phase: EnginePhase;
    onComplete: () => void;
    inputText?: string;
}

interface SignalNode {
    id: number;
    x: number;
    y: number;
    active: boolean;
    pulsing: boolean;
    color: string;
}

export function V3SignalInterface({ phase, onComplete, inputText }: V3SignalInterfaceProps) {
    const [activeNodes, setActiveNodes] = useState<number[]>([]);
    const [pulsingNode, setPulsingNode] = useState<number | null>(null);
    const [signalLines, setSignalLines] = useState<boolean>(false);
    const [statusText, setStatusText] = useState<string>("Initializing...");

    // Signal node positions (asymmetric constellation)
    const signalNodes: SignalNode[] = [
        { id: 1, x: 40, y: 35, active: false, pulsing: false, color: '#e5e5e5' },
        { id: 2, x: 60, y: 25, active: false, pulsing: false, color: '#94a3b8' },
        { id: 3, x: 25, y: 45, active: false, pulsing: false, color: '#64748b' },
        { id: 4, x: 75, y: 40, active: false, pulsing: false, color: '#475569' },
        { id: 5, x: 50, y: 60, active: false, pulsing: false, color: '#334155' },
        { id: 6, x: 35, y: 70, active: false, pulsing: false, color: '#1e293b' },
        { id: 7, x: 65, y: 75, active: false, pulsing: false, color: '#0f172a' },
    ];

    // Phase-to-visual mapping
    useEffect(() => {
        switch (phase) {
            case 'intent':
                setActiveNodes([1]);
                setPulsingNode(1);
                setStatusText("Aligning your outcome");
                // Single pulse after a brief delay
                setTimeout(() => setPulsingNode(null), 1200);
                break;

            case 'engine':
                setActiveNodes([1, 2, 3]);
                setPulsingNode(null);
                setSignalLines(true);
                setStatusText("Compounding your profile");
                // Signal line effect
                setTimeout(() => setSignalLines(false), 800);
                break;

            case 'tier1':
                setActiveNodes([1, 2, 3, 4]);
                setStatusText("Refining precision");
                break;

            case 'tier2':
                setActiveNodes([1, 2, 3, 4, 5]);
                setStatusText("Finalizing precision");
                // Subtle refinement sweep
                setTimeout(() => {
                    setPulsingNode(2);
                    setTimeout(() => setPulsingNode(3), 200);
                    setTimeout(() => setPulsingNode(4), 400);
                    setTimeout(() => setPulsingNode(null), 600);
                }, 500);
                break;

            case 'validation':
                setActiveNodes([1, 2, 3, 4, 5, 6]);
                setStatusText("Validating structure");
                // Tiny halo glint effect
                setTimeout(() => {
                    setPulsingNode(6);
                    setTimeout(() => setPulsingNode(null), 400);
                }, 300);
                break;

            case 'chat': // terminal phase
                setActiveNodes([1, 2, 3, 4, 5, 6, 7]);
                setStatusText("Complete");
                // Calm equilibrium, then transition
                setTimeout(() => {
                    onComplete();
                }, 1200);
                break;

            default:
                setActiveNodes([]);
                setPulsingNode(null);
                setStatusText("Initializing");
                break;
        }
    }, [phase, onComplete]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden">
            {/* Subtle vignette background */}
            <div className="absolute inset-0 bg-gradient-radial from-black via-black/95 to-black/80" />

            {/* Subtle GO geometric watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
                <svg width="400" height="400" viewBox="0 0 400 400" className="text-white">
                    {/* Geometric abstraction derived from GO brand - interconnected hexagonal pattern */}
                    <g transform="translate(200, 200)">
                        {/* Central hexagon */}
                        <polygon
                            points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            opacity="0.3"
                        />
                        {/* Outer connected elements */}
                        <circle cx="60" cy="0" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        <circle cx="-60" cy="0" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        <circle cx="30" cy="52" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        <circle cx="-30" cy="52" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        <circle cx="30" cy="-52" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        <circle cx="-30" cy="-52" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

                        {/* Connecting lines */}
                        <line x1="35" y1="-20" x2="60" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                        <line x1="-35" y1="-20" x2="-60" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                        <line x1="35" y1="20" x2="30" y2="52" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                        <line x1="-35" y1="20" x2="-30" y2="52" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                    </g>
                </svg>
            </div>

            {/* Central Signal Array */}
            <div className="relative flex items-center justify-center">
                <svg
                    width="280"
                    height="280"
                    viewBox="0 0 280 280"
                    className="drop-shadow-2xl"
                >
                    {/* Signal nodes */}
                    {signalNodes.map((node) => (
                        <g key={node.id} transform={`translate(${node.x * 2.8}, ${node.y * 2.8})`}>
                            {/* Halo glow */}
                            <AnimatePresence>
                                {activeNodes.includes(node.id) && (
                                    <motion.circle
                                        cx="0"
                                        cy="0"
                                        r={node.id === pulsingNode ? "16" : "12"}
                                        fill="none"
                                        stroke={node.color}
                                        strokeWidth="1"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: node.id === pulsingNode ? [0.3, 0.6, 0.3] : 0.4,
                                            scale: node.id === pulsingNode ? [1, 1.2, 1] : 1
                                        }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{
                                            duration: node.id === pulsingNode ? 1.2 : 0.8,
                                            ease: "easeInOut",
                                            repeat: node.id === pulsingNode ? 0 : 0
                                        }}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Core node */}
                            <motion.circle
                                cx="0"
                                cy="0"
                                r="6"
                                fill={activeNodes.includes(node.id) ? node.color : '#374151'}
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: activeNodes.includes(node.id) ? 1 : 0.7,
                                    fill: activeNodes.includes(node.id) ? node.color : '#374151'
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />

                            {/* Inner highlight */}
                            <motion.circle
                                cx="-1"
                                cy="-1"
                                r="2"
                                fill={activeNodes.includes(node.id) ? '#ffffff' : '#6b7280'}
                                fillOpacity={activeNodes.includes(node.id) ? 0.4 : 0.2}
                                initial={{ scale: 0 }}
                                animate={{ scale: activeNodes.includes(node.id) ? 1 : 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            />
                        </g>
                    ))}

                    {/* Signal connection lines */}
                    <AnimatePresence>
                        {signalLines && (
                            <motion.line
                                x1={signalNodes[0].x * 2.8}
                                y1={signalNodes[0].y * 2.8}
                                x2={signalNodes[1].x * 2.8}
                                y2={signalNodes[1].y * 2.8}
                                stroke="#94a3b8"
                                strokeWidth="1"
                                strokeOpacity="0.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                        )}
                    </AnimatePresence>
                </svg>
            </div>

            {/* Status Section */}
            <motion.div
                className="mt-16 text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <div className="space-y-2">
                    <p className="text-sm font-light text-white/70 tracking-wide">
                        {statusText}
                    </p>
                </div>

                {/* Secondary brand cue */}
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <p className="text-xs text-white/30 font-light tracking-wider">
                        Powered by StrainMath™
                    </p>
                </motion.div>
            </motion.div>

            {/* Input echo (very subtle) */}
            {inputText && (
                <motion.div
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-xs text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                >
                    <p className="text-xs text-white/20 italic font-light">
                        "{inputText}"
                    </p>
                </motion.div>
            )}
        </div>
    );
}