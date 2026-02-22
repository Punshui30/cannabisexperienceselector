import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Share2, Twitter, Facebook, Link as LinkIcon, Check, Tv, Clock, Music, Play, Pause, Zap } from 'lucide-react';
import { resolveCultivarVisuals } from '../lib/visuals';
import { useState, useEffect, useRef } from 'react';
import { ResolvedSessionService } from '../services/ResolvedSessionService';
import { EngineQRCode } from './EngineQRCode';

// Typed motion components
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
    initial?: object;
    animate?: object;
    exit?: object;
    transition?: object;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
};
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

interface NetworkDetailModalProps {
    event: any;
    onClose: () => void;
    isTvMode?: boolean;
}

export function NetworkDetailModal({ event, onClose, isTvMode = false }: NetworkDetailModalProps) {
    // Determine category theme color
    const categoryColors: Record<string, string> = {
        'Focus': '#00FFD1',
        'Relax': '#BF5AF2',
        'Sleep': '#6366F1',
        'Social': '#EAB308',
        'Relief': '#34D399',
        'Other': '#ffffff'
    };
    const themeColor = categoryColors[event.outcomeCategory] || '#00FFD1';

    // State
    const [copied, setCopied] = useState(false);
    const [dismissProgress, setDismissProgress] = useState(100);
    const [vibePlaying, setVibePlaying] = useState(false);
    const vibeAudioRef = useRef<HTMLAudioElement | null>(null);

    // QR Links
    const [shareUrl, setShareUrl] = useState('');
    const [checkoutUrl, setCheckoutUrl] = useState('');

    useEffect(() => {
        // Prepare recommendation object for QR generation
        const rec = {
            id: event.id || Math.random().toString(36).substr(2, 9),
            name: event.blendName,
            cultivars: event.componentSkus?.map((s: string) => ({ name: s, ratio: 1 / event.componentSkus.length })) || [],
            reasoning: event.commentary,
            visuals: resolveCultivarVisuals(event.blendName)
        };

        try {
            // Create sessions for this network event so visitors can take it with them
            const sSession = ResolvedSessionService.createSession([rec as any], 'share', event.vibeTrackUrl);
            const cSession = ResolvedSessionService.createSession([rec as any], 'checkout');

            let sUrl = `${window.location.origin}/session/share/${sSession.sessionId}`;
            if (event.vibeTrackUrl) sUrl += `?audio=${encodeURIComponent(event.vibeTrackUrl)}`;

            setShareUrl(sUrl);
            setCheckoutUrl(`${window.location.origin}/session/checkout/${cSession.sessionId}`);
        } catch (e) {
            console.error('Failed to prepare network QRs', e);
        }
    }, [event]);

    // TV Mode: Auto-dismiss logic
    useEffect(() => {
        if (!isTvMode) return;

        const duration = 15000; // 15 seconds for network events
        const step = 100;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += step;
            setDismissProgress(100 - (elapsed / duration) * 100);

            if (elapsed >= duration) {
                onClose();
            }
        }, step);

        return () => {
            clearInterval(timer);
            if (vibeAudioRef.current) vibeAudioRef.current.pause();
        };
    }, [isTvMode, onClose]);

    const handleShare = (platform: 'twitter' | 'facebook' | 'copy') => {
        const text = `Check out this ${event.blendName} experience on StrainMath.`;
        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const getCommentaryChunks = (text: string) => {
        if (!text) return ["Resolving experience profile..."];
        if (!isTvMode) return [text];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        return sentences.map(s => s.trim());
    };

    const chunks = getCommentaryChunks(event.commentary);

    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-3xl"
                onClick={onClose}
            />

            <MotionDiv
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm bg-[#0a0a0a]/90 border border-white/10 ${isTvMode ? 'rounded-[3rem]' : 'rounded-[2.5rem]'} overflow-hidden shadow-[0_50px_120px_-20px_rgba(0,0,0,1)] relative backdrop-blur-md my-4 flex flex-col max-h-[90vh]`}
            >
                {/* Header Glow */}
                <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-70 z-50"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)`
                    }}
                />

                {/* Dismiss Bar */}
                {isTvMode && (
                    <div className="absolute top-0 left-0 right-0 h-1 z-[60]">
                        <div
                            className="h-full bg-white/40 transition-all duration-100 ease-linear"
                            style={{ width: `${dismissProgress}%` }}
                        />
                    </div>
                )}

                {/* Header Mesh */}
                <div
                    className="relative h-44 flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                        background: `radial-gradient(circle at 50% 100%, ${themeColor}30 0%, #000 100%)`
                    }}
                >
                    <MotionDiv
                        className="absolute top-[-40%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[80px]"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        style={{ backgroundColor: themeColor }}
                    />
                    <div className="absolute top-6 right-6 z-50">
                        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
                            <X size={16} className="text-white/40" />
                        </button>
                    </div>

                    <div className="relative z-10 w-20 h-20 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-xl">
                        <Activity size={32} style={{ color: themeColor, filter: `drop-shadow(0 0 10px ${themeColor})` }} />
                    </div>
                </div>

                {/* Scroll Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
                    <div className="text-center">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black mb-2 block" style={{ color: themeColor }}>
                            {isTvMode && <Tv size={10} className="inline mr-2 align-middle opacity-50" />}
                            Network Propagation
                        </span>
                        <h2 className={`font-serif text-white tracking-tight leading-loose ${isTvMode ? 'text-4xl' : 'text-3xl'}`}>
                            {event.blendName}
                        </h2>
                    </div>

                    {/* 1. VIBE AUDIO (New Sharing Feature for Live Feed) */}
                    {event.vibeTrackUrl && (
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Music size={14} style={{ color: themeColor }} />
                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Ambient Vibe</span>
                                </div>
                                <Zap size={12} className="text-[#00FFD1] fill-[#00FFD1] animate-pulse" />
                            </div>
                            <button
                                onClick={() => {
                                    if (vibePlaying && vibeAudioRef.current) {
                                        vibeAudioRef.current.pause();
                                        setVibePlaying(false);
                                        return;
                                    }
                                    const audio = new Audio(event.vibeTrackUrl);
                                    vibeAudioRef.current = audio;
                                    audio.onended = () => setVibePlaying(false);
                                    audio.play().catch(console.error);
                                    setVibePlaying(true);
                                }}
                                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                            >
                                {vibePlaying ? <Pause size={14} /> : <Play size={14} />}
                                {vibePlaying ? 'Mute Stream' : 'Listen to Vibe'}
                            </button>
                        </div>
                    )}

                    {/* 2. NARRATIVE */}
                    <div className="space-y-4">
                        {chunks.map((chunk, i) => (
                            <MotionDiv
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.2 }}
                                className="pl-4 border-l-2 border-white/10 font-light italic leading-relaxed text-white/80"
                            >
                                &ldquo;{chunk}&rdquo;
                            </MotionDiv>
                        ))}
                    </div>

                    {/* 3. QR PORTAL (扫描进入体验) */}
                    <div className="space-y-6 pt-4 border-t border-white/10">
                        <span className="text-[9px] uppercase tracking-[0.3em] font-black text-center block text-white/20">Experience Portals</span>

                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col items-center space-y-3">
                                <div className="w-full aspect-square bg-white rounded-3xl p-3 flex items-center justify-center shadow-xl relative overflow-hidden">
                                    <EngineQRCode
                                        url={checkoutUrl}
                                        type="checkout"
                                        recommendation={{
                                            name: event.blendName,
                                            cultivars: event.componentSkus?.map((s: string) => ({ name: s, ratio: 1 })),
                                            reasoning: event.commentary,
                                            id: event.id || 'network-event',
                                            visuals: resolveCultivarVisuals(event.blendName)
                                        } as any}
                                        size={isTvMode ? 140 : 120}
                                    />
                                    <div className="absolute inset-0 border-[8px] border-black/[0.03] rounded-3xl pointer-events-none" />
                                </div>
                                <span className="text-[9px] uppercase tracking-[0.25em] font-black text-white/40 block text-center">Try Blend</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center space-y-3">
                                <div className="w-full aspect-square bg-white rounded-3xl p-3 flex items-center justify-center shadow-xl relative overflow-hidden">
                                    <EngineQRCode
                                        url={shareUrl}
                                        type="share"
                                        recommendation={{
                                            name: event.blendName,
                                            cultivars: event.componentSkus?.map((s: string) => ({ name: s, ratio: 1 })),
                                            reasoning: event.commentary,
                                            id: event.id || 'network-event',
                                            visuals: resolveCultivarVisuals(event.blendName)
                                        } as any}
                                        size={isTvMode ? 140 : 120}
                                    />
                                    <div className="absolute inset-0 border-[8px] border-black/[0.03] rounded-3xl pointer-events-none" />
                                </div>
                                <span className="text-[9px] uppercase tracking-[0.25em] font-black text-white/40 block text-center">Share Profile</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. SOCIAL FAST SHARE */}
                    <div className="flex gap-2">
                        <button onClick={() => handleShare('twitter')} className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Twitter size={18} className="text-white/40" />
                        </button>
                        <button onClick={() => handleShare('facebook')} className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Facebook size={18} className="text-white/40" />
                        </button>
                        <button onClick={() => handleShare('copy')} className="flex-[2] h-12 rounded-2xl bg-white/5 border border-[#00FFD1]/20 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors" title="Copy experience URL">
                            {copied ? <Check size={16} className="text-[#00FFD1]" /> : <LinkIcon size={16} className="text-white/20" />}
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{copied ? 'Copied' : 'Copy URL'}</span>
                        </button>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="shrink-0 p-6 pt-0">
                    <button onClick={onClose} className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 active:scale-95 transition-all">
                        {isTvMode ? 'Broadcasting...' : 'Close Detail'}
                    </button>
                </div>
            </MotionDiv>
        </MotionDiv>
    );
}
