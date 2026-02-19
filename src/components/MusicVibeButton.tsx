import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MotionDiv = motion.div as any;

interface MusicVibeButtonProps {
    terpenes: { name: string; percent: number }[];
    className?: string;
}

export function MusicVibeButton({ terpenes, className = '' }: MusicVibeButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset when terpenes change significantly
    useEffect(() => {
        if (audioUrl) {
            stopPlayback();
            setAudioUrl(null);
        }
    }, [JSON.stringify(terpenes)]);

    const stopPlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    const togglePlayback = async () => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (audioUrl) {
            audioRef.current?.play();
            setIsPlaying(true);
            return;
        }

        // Generate new music
        setIsLoading(true);
        try {
            const response = await fetch('/api/vibe-music', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ terpenes }),
            });

            const data = await response.json();
            if (data.audio) {
                setAudioUrl(data.audio);
                const audio = new Audio(data.audio);
                audioRef.current = audio;
                audio.onended = () => setIsPlaying(false);
                audio.play();
                setIsPlaying(true);
            } else {
                console.error('Failed to generate audio:', data.error);
            }
        } catch (err) {
            console.error('Error calling vibe-music API:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex flex-col items-start gap-1.5 ${className}`}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                }}
                disabled={isLoading}
                className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all border
                    ${isPlaying
                        ? 'bg-[#00FFD1]/20 border-[#00FFD1]/40 text-[#00FFD1] shadow-[0_0_15px_rgba(0,255,209,0.15)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5'}
                    ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
                <div className="relative w-4 h-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <MotionDiv
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[#00FFD1]"
                            >
                                <Loader2 size={14} className="animate-spin" />
                            </MotionDiv>
                        ) : isPlaying ? (
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
                        {isLoading ? 'Composing...' : isPlaying ? 'Stop Vibe' : 'AI Vibe Music'}
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
                {isLoading
                    ? "Consulting the music model for this profile..."
                    : "Generate unique music from this terpene profile."}
            </p>
        </div>
    );
}
