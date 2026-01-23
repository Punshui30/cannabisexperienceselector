import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { EnginePhase } from '../types/domain'

interface EngineCore3DProps {
    phase: EnginePhase
}

function CoreDisc({ phase }: { phase: EnginePhase }) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const initialRotationRef = useRef({ y: 0, z: 0 })

    useFrame((state) => {
        const t = state.clock.getElapsedTime()

        // Phase-aware rotation - stop continuous orbital motion
        if (phase === 'idle') {
            // Gentle idle rotation
            meshRef.current.rotation.y = t * 0.1
            meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.02
        } else {
            // Fixed rotation during active phases - no continuous orbiting
            meshRef.current.rotation.y = initialRotationRef.current.y
            meshRef.current.rotation.z = initialRotationRef.current.z
        }

        // Subtle pulse during active phases
        const pulse = phase === 'idle' ? 1 : 1 + Math.sin(t * 1.5) * 0.03
        meshRef.current.scale.set(pulse, pulse, pulse)
    })

    return (
        <mesh ref={meshRef} castShadow receiveShadow>
            <cylinderGeometry args={[2, 2, 0.2, 32]} />
            <meshPhysicalMaterial
                color="#ffffff"
                metalness={0.9}
                roughness={0.1}
                transmission={0.5}
                thickness={1}
                envMapIntensity={2}
            />
        </mesh>
    )
}

function LogicRing({ radius, color, speed, phase, activePhase }: {
    radius: number,
    color: string,
    speed: number,
    phase: EnginePhase,
    activePhase: EnginePhase | EnginePhase[]
}) {
    const ref = useRef<THREE.Group>(null!)
    const isActive = Array.isArray(activePhase) ? activePhase.includes(phase) : phase === activePhase
    const baseRotationRef = useRef({ x: 0, y: 0 })

    useFrame((state) => {
        const t = state.clock.getElapsedTime()

        // Controlled rotation - not continuous orbiting
        if (isActive) {
            // Smooth activation animation
            const activationProgress = Math.min(t * 2, 1)
            ref.current.rotation.x = baseRotationRef.current.x + t * speed * 0.5 * activationProgress
            ref.current.rotation.y = baseRotationRef.current.y + t * speed * 0.3 * activationProgress
        } else {
            // Maintain base rotation when inactive
            ref.current.rotation.x = baseRotationRef.current.x
            ref.current.rotation.y = baseRotationRef.current.y
        }

        // Subtle jitter only during validation phase
        if (phase === 'validation' && isActive) {
            ref.current.position.x = Math.sin(t * 30) * 0.01
            ref.current.position.y = Math.cos(t * 30) * 0.01
        } else {
            ref.current.position.set(0, 0, 0)
        }
    })

    return (
        <group ref={ref}>
            <mesh>
                <torusGeometry args={[radius, 0.03, 16, 100]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={isActive ? 0.8 : 0.2}
                    toneMapped={false}
                />
            </mesh>
            {/* Glow path */}
            {isActive && (
                <mesh scale={1.05}>
                    <torusGeometry args={[radius, 0.05, 8, 50]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.15}
                        toneMapped={false}
                    />
                </mesh>
            )}
        </group>
    )
}

export const EngineCore3D: React.FC<EngineCore3DProps> = ({ phase }) => {
    return (
        <div className="w-full h-[300px] relative pointer-events-none">
            <Canvas
                shadows
                camera={{ position: [0, 0, 10], fov: 35 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="city" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <CoreDisc phase={phase} />

                    {/* Ring A: Intent (Emerald) */}
                    <LogicRing
                        radius={2.8}
                        color="#00FFD1"
                        speed={0.5}
                        phase={phase}
                        activePhase={['intent', 'engine', 'validation', 'tier1', 'tier2']}
                    />

                    {/* Ring B: Engine (Gold) */}
                    <LogicRing
                        radius={3.4}
                        color="#D4AF6A"
                        speed={-0.3}
                        phase={phase}
                        activePhase={['engine', 'validation', 'tier1', 'tier2']}
                    />

                    {/* Ring C: Narrative (Violet) */}
                    <LogicRing
                        radius={4.0}
                        color="#8B5CF6"
                        speed={0.2}
                        phase={phase}
                        activePhase={['tier2']}
                    />
                </Float>
            </Canvas>
        </div>
    )
}
