import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Twitter, Facebook, Link as LinkIcon, Check, Tv, Music, Play, Pause, Zap } from 'lucide-react';
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
    const categoryColors: Record<string, string> = {
        'Focus': '#00FFD1',
        'Relax': '#BF5AF2',
        'Sleep': '#6366F1',
        'Social': '#EAB308',
        'Relief': '#34D399',
        'Other': '#ffffff'
    };
    const themeColor = categoryColors[event.outcomeCategory] || '#00FFD1';

    const [copied, setCopied] = useState(false);
    const [dismissProgress, setDismissProgress] = useState(100);
    const [vibePlaying, setVibePlaying] = useState(false);
    const vibeAudioRef = useRef<HTMLAudioElement | null>(null);

    const [shareUrl, setShareUrl] = useState('');
    const [checkoutUrl, setCheckoutUrl] = useState('');

    useEffect(() => {
        const rec = {
            id: event.id || Math.random().toString(36).substr(2, 9),
            name: event.blendName,
            cultivars: event.componentSkus?.map((s: string) => ({ name: s, ratio: 1 / (event.componentSkus?.length || 1) })) || [],
            reasoning: event.commentary,
            visuals: resolveCultivarVisuals(event.blendName)
        };

        try {
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

    useEffect(() => {
        if (!isTvMode) return;
        const duration = 15000;
        const step = 100;
        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += step;
            setDismissProgress(100 - (elapsed / duration) * 100);
            if (elapsed >= duration) onClose();
        }, step);
        return () => {
            clearInterval(timer);
            if (vibeAudioRef.current) vibeAudioRef.current.pause();
        };
    }, [isTvMode, onClose]);

    const handleShare = (platform: 'twitter' | 'facebook' | 'copy') => {
        const text = `Check out this ${event.blendName} experience on StrainMath.`;
        if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        else if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const chunks = (event.commentary || "Resolving experience profile...").match(/[^.!?]+[.!?]+/g) || [event.commentary];

    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />

            <MotionDiv
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className={`w-full max-w-sm bg-[#0a0a0a] border border-white/10 ${isTvMode ? 'rounded-[3rem]' : 'rounded-[2.5rem]'} overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]`}
            >
                {/* Header Glow */}
                <div className="absolute inset-x-0 top-0 h-[2px] z-50 opacity-80" style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)` }} />

                {isTvMode && (
                    <div className="absolute top-0 left-0 right-0 h-1 z-[60]">
                        <div className="h-full bg-white/40 transition-all duration-100 ease-linear" style={{ width: `${dismissProgress}%` }} />
                    </div>
                )}

                {/* Header Mesh */}
                <div className="relative h-40 flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `radial-gradient(circle at 50% 120%, ${themeColor}30 0%, transparent 80%)` }}>
                    <div className="absolute top-8 right-8 z-50">
                        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"><X size={18} className="text-white/30" /></button>
                    </div>
                    <div className="relative z-10 w-20 h-20 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-xl">
                        <Activity size={32} style={{ color: themeColor, filter: `drop-shadow(0 0 10px ${themeColor})` }} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    <div className="text-center">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black mb-1 block" style={{ color: themeColor }}>{isTvMode && <Tv size={10} className="inline mr-2 align-middle opacity-50" />}Network Propagation</span>
                        <h2 className="text-4xl font-serif text-white leading-tight tracking-tight">{event.blendName}</h2>
                    </div>

                    {/* RESTORED: Composition List */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">Composition</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        {event.componentSkus?.map((sku: string, i: number) => {
                            const visuals = resolveCultivarVisuals(sku);
                            return (
                                <MotionDiv key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: visuals.primaryColor, boxShadow: `0 0 8px ${visuals.primaryColor}` }} />
                                        <span className="text-xs text-white/80 font-medium">{sku}</span>
                                    </div>
                                    <span className="text-[10px] text-white/30 font-mono">1.0g</span>
                                </MotionDiv>
                            );
                        })}
                    </div>

                    {/* RESTORED: Commentary */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">Experience Narrative</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="pl-4 border-l-2 border-white/10 py-1 space-y-3">
                            {chunks.map((chunk, i) => (
                                <p key={i} className={`${isTvMode ? 'text-lg' : 'text-sm'} font-light italic leading-relaxed text-white/60`}>&ldquo;{chunk.trim()}&rdquo;</p>
                            ))}
                        </div>
                    </div>

                    {/* Multimedia Section (TV & Shared Mode Both) */}
                    <div className="space-y-6 pt-4">
                        {event.vibeTrackUrl && (
                            <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Music size={14} style={{ color: themeColor }} />
                                        <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Ambient Vibe</span>
                                    </div>
                                    <Zap size={10} className="text-[#00FFD1] fill-[#00FFD1]" />
                                </div>
                                <button
                                    onClick={() => {
                                        if (vibePlaying && vibeAudioRef.current) { vibeAudioRef.current.pause(); setVibePlaying(false); return; }
                                        const audio = new Audio(event.vibeTrackUrl);
                                        vibeAudioRef.current = audio;
                                        audio.onended = () => setVibePlaying(false);
                                        audio.play(); setVibePlaying(true);
                                    }}
                                    className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {vibePlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                    {vibePlaying ? 'Mute' : 'Listen to Vibe'}
                                </button>
                            </div>
                        )}

                        {/* QR Grid - Scannable Area */}
                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col items-center space-y-3">
                                <div className="w-full aspect-square bg-white rounded-[2rem] p-3 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                    <EngineQRCode url={checkoutUrl} type="checkout" recommendation={{ name: event.blendName, cultivars: event.componentSkus?.map((s: any) => ({ name: s })), visuals: resolveCultivarVisuals(event.blendName) } as any} size={150} />
                                    <div className="absolute inset-0 border-[6px] border-black/[0.03] rounded-[2rem] pointer-events-none" />
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-black text-white/30 text-center">Try Blend</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center space-y-3">
                                <div className="w-full aspect-square bg-white rounded-[2rem] p-3 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                    <EngineQRCode url={shareUrl} type="share" recommendation={{ name: event.blendName, cultivars: event.componentSkus?.map((s: any) => ({ name: s })), visuals: resolveCultivarVisuals(event.blendName) } as any} size={150} />
                                    <div className="absolute inset-0 border-[6px] border-black/[0.03] rounded-[2rem] pointer-events-none" />
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-black text-white/30 text-center">Save Profile</span>
                            </div>
                        </div>

                        {/* Social Row */}
                        {!isTvMode && (
                            <div className="flex gap-2">
                                <button onClick={() => handleShare('twitter')} className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><Twitter size={18} className="text-white/40" /></button>
                                <button onClick={() => handleShare('facebook')} className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><Facebook size={18} className="text-white/40" /></button>
                                <button onClick={() => handleShare('copy')} className="flex-[2] h-12 rounded-2xl bg-[#00FFD1]/5 border border-[#00FFD1]/20 flex items-center justify-center gap-2 hover:bg-[#00FFD1]/10 transition-colors">
                                    {copied ? <Check size={16} className="text-[#00FFD1]" /> : <LinkIcon size={16} className="text-[#00FFD1]/40" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFD1]/70">{copied ? 'Copied' : 'Copy Link'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-0 bg-black/40 border-t border-white/5">
                    <button onClick={onClose} className="w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 active:scale-95 transition-all">Close Details</button>
                </div>
            </MotionDiv>
        </MotionDiv>
    );
}
