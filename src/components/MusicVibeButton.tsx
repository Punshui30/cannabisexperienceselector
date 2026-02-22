import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, ChevronDown, Music } from 'lucide-react';
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
    narration?: string;
    cultivars?: { name: string; ratio: number }[];
    className?: string;
    /** Called when a track is successfully generated (so share flow can show it). */
    onGenerated?: (url: string) => void;
}

export function MusicVibeButton({ terpenes, narration, cultivars, className = '', onGenerated }: MusicVibeButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [compositionPhase, setCompositionPhase] = useState<'idle' | 'writing' | 'recording'>('idle');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [lastLyrics, setLastLyrics] = useState<string | null>(null);
    const [showLyrics, setShowLyrics] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<VibeGenre>('Ambient');
    const [genreOpen, setGenreOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const generationIdRef = useRef(0);

    // Reset when terpenes or genre change
    useEffect(() => {
        if (audioUrl) {
            stopPlayback(true);
            setAudioUrl(null);
            setLastLyrics(null);
            setCompositionPhase('idle');
        }
    }, [JSON.stringify(terpenes), selectedGenre, narration, JSON.stringify(cultivars)]);

    const stopPlayback = (releaseRef = false) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            if (releaseRef) audioRef.current = null;
        }
        setIsPlaying(false);
    };

    const generateVibe = async (mode: 'basic' | 'lyrics_song' = 'basic') => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (audioUrl && mode === 'basic') {
            audioRef.current?.play();
            setIsPlaying(true);
            return;
        }

        stopPlayback(true);
        setAudioUrl(null);
        const thisGeneration = ++generationIdRef.current;
        setIsLoading(true);
        if (mode === 'lyrics_song') setCompositionPhase('writing');

        try {
            const response = await fetch('/api/vibe-music', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    terpenes,
                    genre: selectedGenre,
                    narration,
                    cultivars,
                    durationSeconds: 30
                }),
            });

            if (mode === 'lyrics_song') {
                // Heuristic for phase shift (no real SSE here, so we fake it based on response arrival or just switch halfway)
                setCompositionPhase('recording');
            }

            const data = await response.json();
            const url = typeof data.audio === 'string' && data.audio.startsWith('http') ? data.audio : null;

            if (thisGeneration !== generationIdRef.current) return;

            if (url) {
                stopPlayback(true);
                setAudioUrl(url);
                if (data.lyrics) setLastLyrics(data.lyrics);
                onGenerated?.(url);
                const audio = new Audio(url);
                audioRef.current = audio;
                audio.onended = () => setIsPlaying(false);
                audio.play();
                setIsPlaying(true);
            } else {
                console.error('Failed to generate audio:', data.error || 'No playable URL returned');
            }
        } catch (err) {
            console.error('Error calling vibe-music API:', err);
        } finally {
            if (thisGeneration === generationIdRef.current) {
                setIsLoading(false);
                setCompositionPhase('idle');
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
        <div className={`flex flex-col items-center gap-4 w-full ${className}`}>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {/* BASIC VIBE BUTTON */}
                <button
                    onClick={() => generateVibe('basic')}
                    disabled={isLoading}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all border
                        ${isPlaying && !lastLyrics
                            ? 'bg-[#00FFD1]/20 border-[#00FFD1]/40 text-[#00FFD1] shadow-[0_0_15px_rgba(0,255,209,0.15)]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5'}
                        ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isLoading && compositionPhase === 'idle' ? (
                                <Loader2 size={14} className="animate-spin text-[#00FFD1]" />
                            ) : isPlaying && !lastLyrics ? (
                                <Pause size={14} fill="currentColor" />
                            ) : (
                                <Play size={14} fill="currentColor" />
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                            {isLoading && compositionPhase === 'idle' ? 'Composing...' : 'AI Ambient Vibe'}
                        </span>
                    </div>
                </button>

                {/* MAKE A SONG BUTTON */}
                <button
                    onClick={() => generateVibe('lyrics_song')}
                    disabled={isLoading}
                    className={`group flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all border
                        ${isPlaying && lastLyrics
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                            : 'bg-white/10 border-white/20 text-white hover:text-[#00FFD1] hover:border-[#00FFD1]/50 hover:bg-[#00FFD1]/10'}
                        ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    style={{
                        boxShadow: isLoading && compositionPhase !== 'idle' ? '0 0 20px rgba(0, 255, 209, 0.2)' : 'none'
                    }}
                >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isLoading && compositionPhase !== 'idle' ? (
                                <Loader2 size={14} className="animate-spin text-[#00FFD1]" />
                            ) : isPlaying && lastLyrics ? (
                                <Pause size={14} fill="currentColor" />
                            ) : (
                                <Music size={14} fill="currentColor" />
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                            {compositionPhase === 'writing' ? 'Writing Lyrics...' :
                                compositionPhase === 'recording' ? 'Recording Track...' :
                                    'Make A Song'}
                        </span>
                        <span className="text-[8px] opacity-40 uppercase tracking-tighter">Vocals + Lyrics</span>
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
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5 transition-all text-[10px] font-bold uppercase tracking-wider h-full"
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

            {/* LYRICS DISPLAY */}
            <AnimatePresence>
                {lastLyrics && (
                    <MotionDiv
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-md overflow-hidden"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => setShowLyrics(!showLyrics)}
                                className="text-[9px] uppercase tracking-widest text-[#00FFD1]/60 hover:text-[#00FFD1] flex items-center gap-2"
                            >
                                {showLyrics ? 'Hide Lyrics ▲' : 'Show Lyrics ▼'}
                            </button>

                            {showLyrics && (
                                <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                                    <pre className="text-[11px] text-white/60 leading-relaxed font-serif whitespace-pre-wrap italic">
                                        {lastLyrics}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <p className="text-[9px] text-white/20 italic text-center max-w-xs">
                {isLoading
                    ? "Our AI is analyzing the profile to compose a unique soundtrack..."
                    : `Switch to ${selectedGenre} and create an AI-powered track with custom lyrics.`}
            </p>
        </div>
    );
}
