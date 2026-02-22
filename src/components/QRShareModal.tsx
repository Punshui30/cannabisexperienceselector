import { motion, AnimatePresence } from 'motion/react';
import { Twitter, Facebook, Link as LinkIcon, X, Check, Play, Pause, Music, Video, Zap } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { useState, useEffect, useRef } from 'react';
import { ResolvedSessionService } from '../services/ResolvedSessionService';
import { EngineQRCode } from './EngineQRCode';
import logoImg from '../assets/logo.png';

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
        setCheckoutUrl(`${window.location.origin}/session/checkout/${checkoutSession.sessionId}`);

        const shareSession = ResolvedSessionService.createSession([recommendation], 'share', vibeTrackUrl || undefined);
        let sharePath = `/session/share/${shareSession.sessionId}`;
        if (vibeTrackUrl) sharePath += `?audio=${encodeURIComponent(vibeTrackUrl)}`;
        setShareUrl(`${window.location.origin}${sharePath}`);
      } catch (error) {
        console.error('Failed to generate QR links:', error);
      } finally {
        setLoading(false);
      }
    };
    if (recommendation) generateLinks();
  }, [recommendation, vibeTrackUrl]);

  if (!recommendation) return null;

  const categoryColors: Record<string, string> = {
    'Focus': '#00FFD1', 'Relax': '#BF5AF2', 'Sleep': '#6366F1', 'Social': '#EAB308', 'Relief': '#34D399', 'Other': '#ffffff'
  };

  let category = 'Other';
  const text = (recommendation.reasoning || '').toLowerCase();
  if (text.includes('focus') || text.includes('energy')) category = 'Focus';
  else if (text.includes('relax') || text.includes('calm')) category = 'Relax';
  else if (text.includes('sleep') || text.includes('night')) category = 'Sleep';
  else if (text.includes('social') || text.includes('fun')) category = 'Social';
  else if (text.includes('pain') || text.includes('relief')) category = 'Relief';

  const themeColor = categoryColors[category] || '#00FFD1';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />

      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_60px_150px_-30px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] z-50 opacity-80" style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)` }} />

        {/* 1. Header */}
        <div className="relative h-40 flex flex-col items-center justify-center shrink-0 overflow-hidden" style={{ background: `radial-gradient(circle at 50% 120%, ${themeColor}20 0%, transparent 80%)` }}>
          <div className="absolute top-8 right-8 z-50">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><X size={18} className="text-white/30" /></button>
          </div>
          <img src={logoImg} className="w-8 h-8 object-contain opacity-40 mb-4" alt="Engine Logo" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-black mb-1" style={{ color: themeColor }}>{category} Protocol</span>
          <h2 className="text-3xl font-serif text-white text-center leading-tight px-10 truncate w-full">{recommendation.name}</h2>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold mt-2">Resolution Complete</p>
        </div>

        {/* 2. Body Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 scrollbar-hide">

          {/* Composition */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">Composition Matrix</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {recommendation.cultivars.map((cultivar, idx) => (
              <MotionDiv key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                  <span className="text-xs text-white/80 font-medium">{cultivar.name}</span>
                </div>
                <span className="text-[10px] text-white/30 font-mono italic">{Math.round(cultivar.ratio * 100)}%</span>
              </MotionDiv>
            ))}
          </div>

          {/* Vibe Tools */}
          {vibeTrackUrl && (
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music size={14} style={{ color: themeColor }} />
                  <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Atmospherics</span>
                </div>
                <Zap size={10} className="text-[#00FFD1] fill-[#00FFD1]" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (vibePlaying && vibeAudioRef.current) { vibeAudioRef.current.pause(); setVibePlaying(false); return; }
                    const audio = new Audio(vibeTrackUrl);
                    vibeAudioRef.current = audio;
                    audio.onended = () => setVibePlaying(false);
                    audio.play(); setVibePlaying(true);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  {vibePlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  {vibePlaying ? 'Mute Stream' : 'Listen to Vibe'}
                </button>

                <button onClick={() => alert("MP4 Export: Coming Soon.")} className="w-16 h-14 rounded-2xl bg-gradient-to-br from-[#00FFD1]/20 to-[#BF5AF2]/20 border border-white/10 flex items-center justify-center hover:scale-105 transition-all text-[#00FFD1]">
                  <Video size={18} />
                </button>
              </div>
            </div>
          )}

          {/* QR Matrix (SYMMETRICAL) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">Digital Portals</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="flex gap-6">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                  {loading ? <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" /> : (
                    <EngineQRCode url={checkoutUrl} type="checkout" recommendation={recommendation} size={150} />
                  )}
                  <div className="absolute inset-0 border-[8px] border-black/[0.03] rounded-3xl" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-white/40 mt-3">Checkout</span>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                  {loading ? <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" /> : (
                    <EngineQRCode url={shareUrl} type="share" recommendation={recommendation} size={150} />
                  )}
                  <div className="absolute inset-0 border-[8px] border-black/[0.03] rounded-3xl" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-white/40 mt-3">Share</span>
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div className="space-y-5">
            <div className="flex gap-3">
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')} className="flex-1 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter size={20} className="text-white/20" />
              </button>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')} className="flex-1 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Facebook size={20} className="text-white/20" />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex-[2.5] h-14 rounded-2xl bg-[#00FFD1]/5 border border-[#00FFD1]/10 flex items-center justify-center gap-3 hover:bg-[#00FFD1]/10 transition-colors"
              >
                {copied ? <Check size={18} className="text-[#00FFD1]" /> : <LinkIcon size={18} className="text-[#00FFD1]/40" />}
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00FFD1]/70">{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 py-8 text-center bg-black/40 border-t border-white/5">
          <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.5em]">StrainMath™ Resolution Engine</p>
        </div>
      </MotionDiv>
    </div>
  );
}