import { motion, AnimatePresence } from 'motion/react';
import { Twitter, Facebook, Link as LinkIcon, X, Share2, Check, Play, Pause, Music, Video, Zap } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { useState, useEffect, useRef } from 'react';
import { ResolvedSessionService } from '../services/ResolvedSessionService';
import { EngineQRCode } from './EngineQRCode';
import logoImg from '../assets/logo.png';

// Typed motion div so TS accepts initial/animate/exit
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
};
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

type Props = {
  recommendation: UIBlendRecommendation;
  onClose: () => void;
  /** If user generated a vibe track for this blend, show a play control in the share tile. */
  vibeTrackUrl?: string | null;
};

export function QRShareModal({ recommendation, onClose, vibeTrackUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [vibePlaying, setVibePlaying] = useState(false);
  const vibeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (vibeAudioRef.current) {
        vibeAudioRef.current.pause();
        vibeAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const generateLinks = () => {
      try {
        const checkoutSession = ResolvedSessionService.createSession([recommendation], 'checkout');
        const checkoutPath = `/session/checkout/${checkoutSession.sessionId}`;
        setCheckoutUrl(`${window.location.origin}${checkoutPath}`);

        const shareSession = ResolvedSessionService.createSession([recommendation], 'share', vibeTrackUrl || undefined);
        let sharePath = `/session/share/${shareSession.sessionId}`;

        if (vibeTrackUrl) {
          const encodedAudio = encodeURIComponent(vibeTrackUrl);
          sharePath += `?audio=${encodedAudio}`;
        }

        setShareUrl(`${window.location.origin}${sharePath}`);
      } catch (error) {
        console.error('Failed to generate QR links:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recommendation) {
      generateLinks();
    }
  }, [recommendation, vibeTrackUrl]);

  if (!recommendation) return null;

  const categoryColors: Record<string, string> = {
    'Focus': '#00FFD1',
    'Relax': '#BF5AF2',
    'Sleep': '#6366F1',
    'Social': '#EAB308',
    'Relief': '#34D399',
    'Other': '#ffffff'
  };

  let category = 'Other';
  const text = (recommendation.reasoning || '').toLowerCase();
  if (text.includes('focus') || text.includes('energy')) category = 'Focus';
  else if (text.includes('relax') || text.includes('calm')) category = 'Relax';
  else if (text.includes('sleep') || text.includes('night')) category = 'Sleep';
  else if (text.includes('social') || text.includes('fun')) category = 'Social';
  else if (text.includes('pain') || text.includes('relief')) category = 'Relief';

  const themeColor = categoryColors[category] || '#00FFD1';
  const shareText = `Check out this custom cannabis blend: ${recommendation.name}. Powered by StrainMath™.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook') => {
    let url = '';
    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
      />

      {/* Modal Container */}
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_60px_150px_-30px_rgba(0,0,0,1)] relative flex flex-col max-h-[95vh] backdrop-blur-md"
      >
        {/* Glow Line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] z-50 opacity-80"
          style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)` }}
        />

        {/* 1. Header (Premium Style) */}
        <div
          className="relative h-44 flex flex-col items-center justify-center shrink-0 overflow-hidden"
          style={{ background: `radial-gradient(circle at 50% 120%, ${themeColor}20 0%, transparent 80%)` }}
        >
          <div className="absolute top-8 right-8 z-50">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <X size={18} className="text-white/30" />
            </button>
          </div>
          <img src={logoImg} className="w-8 h-8 object-contain opacity-40 mb-4" alt="Engine Logo" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-black mb-1" style={{ color: themeColor }}>{category} Protocol</span>
          <h2 className="text-3xl font-serif text-white text-center leading-tight px-10">{recommendation.name}</h2>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold mt-2">Resolution Complete</p>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 scrollbar-hide">

          {/* Composition Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">Blend Metrics</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {recommendation.cultivars.map((cultivar, idx) => (
              <MotionDiv
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                  <span className="text-sm text-white/80 font-medium">{cultivar.name}</span>
                </div>
                <span className="text-[11px] text-white/40 font-mono font-bold">{Math.round(cultivar.ratio * 100)}%</span>
              </MotionDiv>
            ))}
          </div>

          {/* Vibe & Video Tools */}
          {vibeTrackUrl && (
            <div className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 space-y-4 relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <Music size={14} style={{ color: themeColor }} />
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em]">Multimedia Suite</span>
                </div>
                <Zap size={10} className="text-[#00FFD1] fill-[#00FFD1]" />
              </div>

              <div className="flex gap-2 relative z-10">
                <button
                  onClick={() => {
                    if (vibePlaying && vibeAudioRef.current) {
                      vibeAudioRef.current.pause();
                      setVibePlaying(false);
                      return;
                    }
                    const audio = new Audio(vibeTrackUrl);
                    vibeAudioRef.current = audio;
                    audio.onended = () => setVibePlaying(false);
                    audio.play();
                    setVibePlaying(true);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/20 transition-all text-xs font-black uppercase tracking-widest"
                >
                  {vibePlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  {vibePlaying ? 'Mute' : 'Play Vibe'}
                </button>

                <button
                  onClick={() => alert("MP4 Video Export: Feature coming soon for Pro accounts.")}
                  className="w-16 h-14 rounded-2xl bg-gradient-to-br from-[#00FFD1]/20 to-[#BF5AF2]/20 border border-white/10 flex items-center justify-center hover:scale-105 transition-all text-[#00FFD1]"
                >
                  <Video size={18} />
                </button>
              </div>
            </div>
          )}

          {/* QR Matrix (Absolute Alignment) */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col items-center space-y-4">
              <div className="w-full aspect-square bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl relative">
                {loading ? <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" /> : (
                  <EngineQRCode url={checkoutUrl} type="checkout" recommendation={recommendation} size={120} />
                )}
                <div className="absolute inset-0 border-[8px] border-black/[0.03] rounded-3xl pointer-events-none" />
              </div>
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-[0.25em] font-black text-white/40 block mb-1">Present at Checkout</span>
                <span className="text-[7px] uppercase tracking-tighter text-white/10 block">{recommendation.name}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center space-y-4">
              <div className="w-full aspect-square bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl relative">
                {loading ? <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" /> : (
                  <EngineQRCode url={shareUrl} type="share" recommendation={recommendation} size={120} />
                )}
                <div className="absolute inset-0 border-[8px] border-black/[0.03] rounded-3xl pointer-events-none" />
              </div>
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-[0.25em] font-black text-white/40 block mb-1">Save or Share</span>
                <span className="text-[7px] uppercase tracking-tighter text-white/10 block">{recommendation.name}</span>
              </div>
            </div>
          </div>

          {/* Social Panel */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-black">Digital Propagation</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleSocialShare('twitter')} className="flex-1 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter size={20} className="text-white/20" />
              </button>
              <button onClick={() => handleSocialShare('facebook')} className="flex-1 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Facebook size={20} className="text-white/20" />
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-[2.5] h-14 rounded-2xl bg-[#00FFD1]/5 border border-[#00FFD1]/20 flex items-center justify-center gap-3 hover:bg-[#00FFD1]/10 transition-colors"
              >
                {copied ? <Check size={18} className="text-[#00FFD1]" /> : <LinkIcon size={18} className="text-[#00FFD1]/40" />}
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00FFD1]/70">
                  {copied ? 'Link Copied' : 'Copy Vault Link'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 py-8 text-center bg-black/40 border-t border-white/5">
          <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.5em]">
            StrainMath™ Resolution Engine
          </p>
        </div>
      </MotionDiv>
    </div>
  );
}