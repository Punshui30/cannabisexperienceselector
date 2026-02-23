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
    mood?: string;
    energy?: string;
    bodyFeel?: string;
    timeContext?: string;
    className?: string;
    onGenerated?: (url: string) => void;
}

export function MusicVibeButton({
    terpenes,
    narration,
    cultivars,
    mood,
    energy,
    bodyFeel,
    timeContext,
    className = '',
    onGenerated
}: MusicVibeButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [compositionPhase, setCompositionPhase] = useState<'idle' | 'writing' | 'recording'>('idle');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [lastLyrics, setLastLyrics] = useState<string | null>(null);
    const [showLyrics, setShowLyrics] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<VibeGenre>('Ambient');
    const [genreOpen, setGenreOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const generationIdRef = useRef(0);

    // Reset when inputs change
    useEffect(() => {
        if (audioUrl) {
            stopPlayback(true);
            setAudioUrl(null);
            setLastLyrics(null);
            setCompositionPhase('idle');
            setErrorMessage(null);
        }
    }, [JSON.stringify(terpenes), selectedGenre, narration]);

    const stopPlayback = (releaseRef = false) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            if (releaseRef) audioRef.current = null;
        }
        setIsPlaying(false);
    };

    const pollPrediction = async (predictionId: string, generationId: number) => {
        const poll = async () => {
            if (generationId !== generationIdRef.current) return;

            try {
                const res = await fetch(`/api/vibe-music?id=${predictionId}`);
                const text = await res.text();
                let data: any;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error("[MusicVibe] Poll parse error:", text.substring(0, 100));
                    setErrorMessage("Connection error. Please try again.");
                    setIsLoading(false);
                    return;
                }

                if (!data.ok) {
                    setErrorMessage(data.error?.message || "Generation failed.");
                    setIsLoading(false);
                    return;
                }

                if (data.status === "succeeded") {
                    if (generationId !== generationIdRef.current) return;
                    setAudioUrl(data.audioUrl);
                    onGenerated?.(data.audioUrl);

                    const audio = new Audio(data.audioUrl);
                    audioRef.current = audio;
                    audio.onended = () => setIsPlaying(false);
                    audio.play().catch(console.error);

                    setIsPlaying(true);
                    setIsLoading(false);
                    setCompositionPhase('idle');
                } else if (data.status === "failed" || data.status === "canceled") {
                    setErrorMessage("The AI model reached a limit. Please try another genre.");
                    setIsLoading(false);
                } else {
                    // Continue polling
                    setTimeout(poll, 2000);
                }
            } catch (err) {
                console.error("[MusicVibe] Poll error:", err);
                setIsLoading(false);
            }
        };

        poll();
    };

    const generateVibe = async () => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (audioUrl) {
            audioRef.current?.play().catch(console.error);
            setIsPlaying(true);
            return;
        }

        setErrorMessage(null);
        stopPlayback(true);
        const thisGeneration = ++generationIdRef.current;
        setIsLoading(true);
        setCompositionPhase('writing');

        try {
            const response = await fetch('/api/vibe-music', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terpenes,
                    genre: selectedGenre,
                    narration,
                    mood,
                    energy,
                    bodyFeel,
                    timeContext,
                    cultivars: cultivars?.map(c => c.name) ?? [],
                }),
            });

            const text = await response.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("[MusicVibe] Start parse error:", text.substring(0, 100));
                setErrorMessage("The server is busy. Please try again in a moment.");
                setIsLoading(false);
                return;
            }

            if (thisGeneration !== generationIdRef.current) return;

            if (data.ok && data.predictionId) {
                if (data.lyrics) setLastLyrics(data.lyrics.replace(/##/g, ''));
                setCompositionPhase('recording');
                pollPrediction(data.predictionId, thisGeneration);
            } else {
                setErrorMessage(data.error?.message || "Failed to start AI generation.");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("[MusicVibe] Start error:", err);
            setErrorMessage("Network error.");
            setIsLoading(false);
        }
    };

    // Genre outside click
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
                {/* PRIMARY ACTION ONLY */}
                <button
                    onClick={() => generateVibe()}
                    disabled={isLoading}
                    className={`group min-w-[180px] flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all border
                        ${isPlaying
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                            : 'bg-white/10 border-white/20 text-white hover:text-[#00FFD1] hover:border-[#00FFD1]/50 hover:bg-[#00FFD1]/10'}
                        ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    style={{
                        boxShadow: isLoading ? '0 0 20px rgba(0, 255, 209, 0.2)' : 'none'
                    }}
                >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <Loader2 size={14} className="animate-spin text-[#00FFD1]" />
                            ) : isPlaying ? (
                                <Pause size={14} fill="currentColor" />
                            ) : (
                                <Music size={14} fill="currentColor" />
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                            {compositionPhase === 'writing' ? 'Writing...' :
                                compositionPhase === 'recording' ? 'Recording...' :
                                    audioUrl ? 'Play Again' : 'Play Track'}
                        </span>
                        <span className="text-[8px] opacity-40 uppercase tracking-tighter">
                            {compositionPhase === 'writing' ? 'AI composing lyrics' : compositionPhase === 'recording' ? 'Rendering audio' : 'Vocals · ' + selectedGenre}
                        </span>
                    </div>
                </button>

                {/* Genre Selector */}
                <div className="relative" ref={genreDropdownRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setGenreOpen((o) => !o);
                        }}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5 transition-all text-[10px] font-bold uppercase tracking-wider h-full"
                    >
                        <span className="max-w-[80px] truncate">{selectedGenre}</span>
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

            {/* Error Message */}
            {errorMessage && (
                <span className="text-[9px] text-red-400/80 uppercase tracking-tighter animate-pulse">{errorMessage}</span>
            )}

            {/* Lyrics */}
            <AnimatePresence>
                {lastLyrics && !errorMessage && (
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
                                    <pre className="text-[11px] text-white/50 leading-relaxed font-serif whitespace-pre-wrap italic">
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
                    ? compositionPhase === 'writing' ? 'Drafting + refining lyrics in two passes...' : 'Rendering audio from the lyric sheet...'
                    : `AI-generated ${selectedGenre} · lyrics matched to this blend`}
            </p>
        </div>
    );
}
