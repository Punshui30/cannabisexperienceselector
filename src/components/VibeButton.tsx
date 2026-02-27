import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createVibeSoundscape, VibeController, VibeParams } from '../audio/vibeAudio';

const MotionDiv = motion.div as any;

interface VibeButtonProps {
    params: VibeParams;
    className?: string;
}

export function VibeButton({ params, className = '' }: VibeButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const controllerRef = useRef<VibeController | null>(null);

    // Update mix when params change if already playing
    useEffect(() => {
        if (isPlaying && controllerRef.current) {
            controllerRef.current.setMix(params);
        }
    }, [params, isPlaying]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (controllerRef.current) {
                controllerRef.current.stop();
            }
        };
    }, []);

    const togglePlayback = async () => {
        if (isPlaying) {
            controllerRef.current?.stop();
            setIsPlaying(false);
        } else {
            if (!controllerRef.current) {
                controllerRef.current = createVibeSoundscape(params);
            }
            try {
                await controllerRef.current.start();
                setIsPlaying(true);
            } catch (err) {
                console.error('[VIBE_AUDIO_FAIL]', err);
            }
        }
    };

    return (
        <div className={`flex flex-col items-start gap-1.5 ${className}`}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                }}
                className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all border
                    ${isPlaying
                        ? 'bg-[#00FFD1]/20 border-[#00FFD1]/40 text-[#00FFD1] shadow-[0_0_15px_rgba(0,255,209,0.15)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5'}`}
            >
                <div className="relative w-4 h-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isPlaying ? (
                            <MotionDiv
                                key="pause"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Pause size={14} fill="currentColor" />
                            </MotionDiv>
                        ) : (
                            <MotionDiv
                                key="play"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Play size={14} fill="currentColor" />
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
                        {isPlaying ? 'Pause Vibe' : 'Play Vibe'}
                    </span>
                    <div className="flex gap-[2px] items-center h-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <MotionDiv
                                key={i}
                                className="w-[2px] bg-currentColor rounded-full"
                                animate={isPlaying ? {
                                    height: [2, 8, 4, 10, 3][i % 5],
                                } : {
                                    height: 2
                                }}
                                transition={isPlaying ? {
                                    duration: 0.4 + (i * 0.1),
                                    repeat: Infinity,
                                    repeatType: 'reverse'
                                } : {}}
                                style={{ backgroundColor: isPlaying ? '#00FFD1' : 'rgba(255,255,255,0.2)' }}
                            />
                        ))}
                    </div>
                </div>
            </button>
            <p className="text-[9px] text-white/30 italic">
                Ambient audio generated from this profile.
            </p>
        </div>
    );
}
