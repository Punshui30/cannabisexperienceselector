import React from 'react'
import { EnginePhase } from '../types/domain'

interface EngineCore3DProps {
    phase: EnginePhase
}

// CSS-only fallback replacing the Three.js 3D implementation to eliminate
// the three-stdlib/three peer-dep conflicts with Vite 6.
export const EngineCore3D: React.FC<EngineCore3DProps> = ({ phase }) => {
    const isActive = phase !== 'idle'

    return (
        <div className="w-full h-[300px] relative flex items-center justify-center pointer-events-none">
            <div className="relative w-32 h-32">
                {/* Core disc */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,209,0.15) 0%, transparent 70%)',
                        border: '1px solid rgba(0,255,209,0.3)',
                        animation: isActive ? 'spin 3s linear infinite' : 'spin 8s linear infinite',
                    }}
                />
                {/* Ring A */}
                <div
                    className="absolute rounded-full"
                    style={{
                        inset: '-16px',
                        border: `1px solid ${isActive ? 'rgba(0,255,209,0.6)' : 'rgba(0,255,209,0.15)'}`,
                        animation: 'spin 6s linear infinite',
                    }}
                />
                {/* Ring B */}
                <div
                    className="absolute rounded-full"
                    style={{
                        inset: '-32px',
                        border: `1px solid ${isActive ? 'rgba(212,175,106,0.5)' : 'rgba(212,175,106,0.1)'}`,
                        animation: 'spin 10s linear infinite reverse',
                    }}
                />
                {/* Ring C */}
                <div
                    className="absolute rounded-full"
                    style={{
                        inset: '-48px',
                        border: `1px solid ${phase === 'tier2' ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.1)'}`,
                        animation: 'spin 14s linear infinite',
                    }}
                />
                {/* Center glow */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,209,0.3) 0%, transparent 60%)',
                        animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'pulse 3s ease-in-out infinite',
                    }}
                />
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
            `}</style>
        </div>
    )
}
