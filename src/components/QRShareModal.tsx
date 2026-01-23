import { motion, AnimatePresence } from 'motion/react';
import { Twitter, Facebook, Link as LinkIcon, X, Share2, Check } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { useState, useEffect } from 'react';
import { ResolvedSessionService } from '../services/ResolvedSessionService';
import { EngineQRCode } from './EngineQRCode';
import logoImg from '../assets/logo.png';

type Props = {
  recommendation: UIBlendRecommendation;
  onClose: () => void;
};

export function QRShareModal({ recommendation, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateLinks = () => {
      try {
        // Create checkout session (staff-facing, expires in 24h)
        const checkoutSession = ResolvedSessionService.createSession([recommendation], 'checkout');
        const checkoutPath = `/session/checkout/${checkoutSession.sessionId}`;
        setCheckoutUrl(`${window.location.origin}${checkoutPath}`);

        // Create share session (public, no expiration)
        const shareSession = ResolvedSessionService.createSession([recommendation], 'share');
        const sharePath = `/session/share/${shareSession.sessionId}`;
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
  }, [recommendation]);

  if (!recommendation) return null;

  // Determine category theme color (Shared logic with BlendCard)
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

  const publicShareUrl = shareUrl.split('&')[0]; // Remove share param for public sharing
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative backdrop-blur-md flex flex-col"
      >
        {/* IRIDESCENT BORDER GLOW */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] opacity-70"
          style={{
            background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)`
          }}
        />

        {/* Header - Vibrant Gradient */}
        <div
          className="relative h-40 flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${themeColor}30 0%, #000 100%)`
          }}
        >
          {/* Animated Mesh Blurs */}
          <motion.div
            className="absolute top-[-40%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[80px]"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 120, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ backgroundColor: themeColor }}
          />

          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={onClose}
              title="Close"
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={16} className="text-white/70" />
            </button>
          </div>

          {/* GO Logo */}
          <div className="relative z-10 flex justify-center mb-4">
            <img
              src={logoImg}
              alt="GO"
              className="w-8 h-8 object-contain opacity-60"
            />
          </div>

          <div className="relative z-10 text-center px-6">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black block mb-2" style={{ color: themeColor }}>
              {category} Experience
            </span>
            <h2 className="text-2xl font-serif text-white tracking-tight leading-tight">
              {recommendation.name}
            </h2>

            {/* StrainMath Branding */}
            <div className="mt-3">
              <p className="text-xs text-white/40 font-light tracking-wider">
                Powered by StrainMath™
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">

          {/* Strain List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Blend Composition</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            {recommendation.cultivars.map((cultivar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/[0.04] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentcolor]"
                    style={{ backgroundColor: themeColor, color: themeColor }}
                  />
                  <span className="text-xs text-white/90 font-medium tracking-wide">{cultivar.name}</span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  {Math.round(cultivar.ratio * 100)}%
                </span>
              </motion.div>
            ))}
          </div>

          {/* QR Codes */}
          <div className="pt-2 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Checkout QR */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
                    <EngineQRCode
                      url={checkoutUrl}
                      type="checkout"
                      recommendation={recommendation}
                      size={120}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/50 uppercase tracking-widest">
                      Present at Checkout
                    </p>
                  </div>
                </div>

                {/* Share QR */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
                    <EngineQRCode
                      url={shareUrl}
                      type="share"
                      recommendation={recommendation}
                      size={120}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/50 uppercase tracking-widest">
                      Save or Share
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Sharing Fallback */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-center mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Or share via</span>
              </div>
              <div className="flex justify-center gap-2">
                {[
                  {
                    id: 'twitter',
                    icon: Twitter,
                    label: 'Twitter',
                    color: '#1DA1F2',
                    onClick: () => handleSocialShare('twitter')
                  },
                  {
                    id: 'facebook',
                    icon: Facebook,
                    label: 'Facebook',
                    color: '#4267B2',
                    onClick: () => handleSocialShare('facebook')
                  },
                  {
                    id: 'copy',
                    icon: copied ? Check : LinkIcon,
                    label: copied ? 'Copied' : 'Copy Link',
                    color: copied ? '#00FFD1' : '#ffffff',
                    onClick: handleCopyLink
                  }
                ].map((item, i) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="flex-1 max-w-[80px] aspect-square rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-1 text-white/40 hover:text-white transition-all active:scale-95 group relative overflow-hidden"
                  aria-label={item.label}
                  title={item.label}
                >
                    <item.icon
                      size={16}
                      className="group-hover:scale-110 transition-transform duration-300 z-10"
                      style={{
                        color: item.id === 'copy' && copied ? '#00FFD1' : undefined,
                        filter: `drop-shadow(0 0 6px ${item.color}40)`
                      }}
                    />

                    <span className="text-[8px] uppercase tracking-wider font-medium opacity-50 group-hover:opacity-100 transition-opacity leading-tight">
                      {item.label}
                    </span>

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"
                      style={{ backgroundColor: item.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-widest">
            Stop Guessing. Start Feeling.
          </p>
        </div>

      </motion.div>
    </motion.div>
  );
}