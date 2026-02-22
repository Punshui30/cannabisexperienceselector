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
        // Create checkout session (staff-facing, expires in 24h)
        const checkoutSession = ResolvedSessionService.createSession([recommendation], 'checkout');
        const checkoutPath = `/session/checkout/${checkoutSession.sessionId}`;
        setCheckoutUrl(`${window.location.origin}${checkoutPath}`);

        // Create share session (public, no expiration)
        const shareSession = ResolvedSessionService.createSession([recommendation], 'share', vibeTrackUrl || undefined);
        let sharePath = `/session/share/${shareSession.sessionId}`;

        // Append audio parameter if present for direct link sharing robustness
        if (vibeTrackUrl) {
          const encodedAudio = encodeURIComponent(vibeTrackUrl);
          sharePath += `?audio=${encodedAudio}`;
        }

        setShareUrl(`${window.location.origin}${sharePath}`);

        console.log('[QRShareModal] Created sessions:', {
          checkout: checkoutSession.sessionId,
          share: shareSession.sessionId
        });
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

  // Determine category theme color
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
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
      />

      {/* Modal Container */}
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col max-h-[85vh]"
      >
        {/* Iridescent Top Glow */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] z-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)`
          }}
        />

        {/* Dynamic Header Section */}
        <div
          className="relative h-44 flex flex-col items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: `radial-gradient(circle at 50% 120%, ${themeColor}25 0%, transparent 70%)`
          }}
        >
          {/* Animated Glows */}
          <MotionDiv
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/10 to-transparent blur-3xl opacity-20 pointer-events-none"
          />

          <div className="absolute top-6 right-6 z-50">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/40" />
            </button>
          </div>

          {/* Logo & Category */}
          <img src={logoImg} className="w-6 h-6 object-contain opacity-40 mb-3" alt="Logo" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-black mb-1" style={{ color: themeColor }}>
            {category} Protocol
          </span>
          <h2 className="text-2xl font-serif text-white text-center leading-tight px-8">
            {recommendation.name}
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">
            Engine Resolution
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 scrollbar-hide">

          {/* Vibe Track & Clip Section (Prompt 2 & 3) */}
          {vibeTrackUrl && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music size={14} style={{ color: themeColor }} />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Vibe Integration</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={10} className="text-[#00FFD1] fill-[#00FFD1]" />
                  <span className="text-[8px] uppercase font-black text-[#00FFD1]">Audio Generated</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (vibePlaying && vibeAudioRef.current) {
                      vibeAudioRef.current.pause();
                      vibeAudioRef.current.currentTime = 0;
                      vibeAudioRef.current = null;
                      setVibePlaying(false);
                      return;
                    }
                    const audio = new Audio(vibeTrackUrl);
                    vibeAudioRef.current = audio;
                    audio.onended = () => { setVibePlaying(false); vibeAudioRef.current = null; };
                    audio.play();
                    setVibePlaying(true);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/20 transition-all text-xs font-semibold"
                >
                  {vibePlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  {vibePlaying ? 'Playback active' : 'Play Vibe Clip'}
                </button>

                <button
                  onClick={() => alert("MP4 Video Export: Feature coming soon for Pro accounts.")}
                  className="w-14 h-11 rounded-2xl bg-gradient-to-br from-[#00FFD1]/20 to-[#BF5AF2]/20 border border-white/10 flex items-center justify-center hover:from-[#00FFD1]/30 hover:to-[#BF5AF2]/30 transition-all group"
                  title="Generate Video share clip"
                >
                  <Video size={16} className="text-[#00FFD1] group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* QR Grid (Prompt 1) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="aspect-square bg-white border border-white/10 rounded-3xl p-3 flex items-center justify-center shadow-lg">
                {loading ? <div className="animate-pulse w-full h-full bg-gray-200 rounded-xl" /> : (
                  <EngineQRCode url={checkoutUrl} type="checkout" recommendation={recommendation} size={110} />
                )}
              </div>
              <div className="text-center px-1">
                <span className="text-[9px] uppercase tracking-widest font-black text-white/40 block">In-Store</span>
                <span className="text-[8px] uppercase tracking-tighter text-white/20 truncate block">{recommendation.name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="aspect-square bg-white border border-white/10 rounded-3xl p-3 flex items-center justify-center shadow-lg">
                {loading ? <div className="animate-pulse w-full h-full bg-gray-200 rounded-xl" /> : (
                  <EngineQRCode url={shareUrl} type="share" recommendation={recommendation} size={110} />
                )}
              </div>
              <div className="text-center px-1">
                <span className="text-[9px] uppercase tracking-widest font-black text-white/40 block">Public Share</span>
                <span className="text-[8px] uppercase tracking-tighter text-white/20 truncate block">{recommendation.name}</span>
              </div>
            </div>
          </div>

          {/* Social Direct */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Fast Share</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex-1 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Twitter size={18} className="text-white/60" />
              </button>
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex-1 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Facebook size={18} className="text-white/60" />
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-[2] h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                {copied ? <Check size={16} className="text-[#00FFD1]" /> : <LinkIcon size={16} className="text-white/40" />}
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/70">
                  {copied ? 'Copied' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 py-6 text-center bg-black/50 backdrop-blur-md border-t border-white/5">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black">
            StrainMath™ Engine Core v3.0
          </p>
        </div>
      </MotionDiv>
    </div>
  );
}