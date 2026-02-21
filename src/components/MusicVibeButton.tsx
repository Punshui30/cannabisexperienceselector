import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MotionDiv = motion.div as any;

const VIBE_GENRES = [
    'Ambient',
    'Hip Hop',
    'Lo-Fi',
    'R&B',
    'Electronic',
    'Indie / Alternative',
    'Acoustic',
    'Folk',
    'Bluegrass',
    'Jazz',
    'Cinematic',
    'Soul',
    'Chillwave',
    'Downtempo',
] as const;
export type VibeGenre = (typeof VIBE_GENRES)[number];

interface MusicVibeButtonProps {
    terpenes: { name: string; percent: number }[];
    className?: string;
    /** Called when a track is successfully generated (so share flow can show it). */
    onGenerated?: (url: string) => void;
}

export function MusicVibeButton({ terpenes, className = '', onGenerated }: MusicVibeButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<VibeGenre>('Ambient');
    const [genreOpen, setGenreOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const generationIdRef = useRef(0);

    // Reset when terpenes or genre change so next generation is fresh (no layering)
    useEffect(() => {
        if (audioUrl) {
            stopPlayback(true);
            setAudioUrl(null);
        }
    }, [JSON.stringify(terpenes), selectedGenre]);

    const stopPlayback = (releaseRef = false) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            if (releaseRef) audioRef.current = null;
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

        // Generate new music — stop any existing track first so new one doesn't layer on top
        stopPlayback(true);
        setAudioUrl(null);
        const thisGeneration = ++generationIdRef.current;
        setIsLoading(true);
        try {
            const response = await fetch('/api/vibe-music', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terpenes,
                    genre: selectedGenre,
                }),
            });

            const data = await response.json();
            const url = typeof data.audio === 'string' && data.audio.startsWith('http') ? data.audio : null;

            // Ignore result if user already started another generation (prevents layering from out-of-order responses)
            if (thisGeneration !== generationIdRef.current) return;

            if (url) {
                // Stop any audio that might have started from a previous request before playing this one
                stopPlayback(true);
                setAudioUrl(url);
                onGenerated?.(url);
                const audio = new Audio(url);
                audioRef.current = audio;
                audio.onended = () => setIsPlaying(false);
                audio.onerror = () => {
                    console.error('Audio load error');
                    setIsPlaying(false);
                };
                audio.play();
                setIsPlaying(true);
            } else {
                console.error('Failed to generate audio:', data.error || 'No playable URL returned');
            }
        } catch (err) {
            if (thisGeneration === generationIdRef.current) {
                console.error('Error calling vibe-music API:', err);
            }
        } finally {
            if (thisGeneration === generationIdRef.current) {
                setIsLoading(false);
            }
        }
    };

    // Close genre dropdown on outside click
    useEffect(() => {
        if (!genreOpen) return;
        const onOutside = (e: MouseEvent) => {
            if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target as Node)) {
                setGenreOpen(false);
            }
        };
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, [genreOpen]);

    return (
        <div className={`flex flex-col items-start gap-2 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
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

                {/* Genre selector */}
                <div className="relative" ref={genreDropdownRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setGenreOpen((o) => !o);
                        }}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5 transition-all text-[10px] font-bold uppercase tracking-wider"
                    >
                        <span className="max-w-[72px] truncate">{selectedGenre}</span>
                        <ChevronDown size={12} className={`shrink-0 transition-transform ${genreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {genreOpen && (
                            <MotionDiv
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 top-full mt-1 z-50 min-w-[160px] py-1 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-xl max-h-[220px] overflow-y-auto"
                            >
                                {VIBE_GENRES.map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedGenre(g);
                                            setGenreOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${selectedGenre === g ? 'bg-[#00FFD1]/20 text-[#00FFD1]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            <p className="text-[9px] text-white/30 italic">
                {isLoading
                    ? "Consulting the music model for this profile..."
                    : `Generate unique music from this blend in ${selectedGenre.toLowerCase()} style.`}
            </p>
        </div>
    );
}
