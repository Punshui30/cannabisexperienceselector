import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Sparkles, Share2 } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { EngineQRCode } from './EngineQRCode';
import { ResolvedSessionService } from '../services/ResolvedSessionService';

interface ResolutionScreenProps {
  recommendations: UIBlendRecommendation[];
  onContinue: () => void;
  onShare?: () => void;
}

export function ResolutionScreen({ recommendations, onContinue, onShare }: ResolutionScreenProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createSessions = async () => {
      try {
        // Create checkout session (staff-facing, expires in 24h)
        const checkoutSession = ResolvedSessionService.createSession(recommendations, 'checkout');
        const checkoutPath = `/session/checkout/${checkoutSession.sessionId}`;
        setCheckoutUrl(`${window.location.origin}${checkoutPath}`);

        // Create share session (public, no expiration)
        const shareSession = ResolvedSessionService.createSession(recommendations, 'share');
        const sharePath = `/session/share/${shareSession.sessionId}`;
        setShareUrl(`${window.location.origin}${sharePath}`);

        console.log('[Resolution] Created sessions:', {
          checkout: checkoutSession.sessionId,
          share: shareSession.sessionId
        });
      } catch (error) {
        console.error('[Resolution] Failed to create sessions:', error);
        // Fallback: continue without QR codes
      } finally {
        setLoading(false);
      }
    };

    createSessions();
  }, [recommendations]);

  const primaryRecommendation = recommendations[0];

  if (!primaryRecommendation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative h-32 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FFD1]/10 to-transparent" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 15 }}
          className="relative z-10"
        >
          <CheckCircle size={48} className="mx-auto text-[#00FFD1] mb-2" />
        </motion.div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-lg font-serif text-white tracking-tight">
            Resolution Complete
          </h1>
          <p className="text-xs text-white/60 uppercase tracking-widest mt-1">
            Engine Core V3 Terminal State
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto space-y-8">

          {/* Blend Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center space-y-4"
          >
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-serif text-white mb-2">
                {primaryRecommendation.name}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Sparkles size={16} />
                <span>StrainMath™ Generated</span>
              </div>
            </div>
          </motion.div>

          {/* QR Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-sm font-medium uppercase tracking-wider text-white/80 mb-6">
                Session Artifacts
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {/* Primary: Checkout QR */}
                <div className="flex flex-col items-center space-y-4">
                  {checkoutUrl && (
                    <EngineQRCode
                      url={checkoutUrl}
                      type="checkout"
                      recommendation={primaryRecommendation}
                      size={160}
                    />
                  )}
                  <div className="text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest">
                      Present at checkout
                    </p>
                  </div>
                </div>

                {/* Secondary: Share QR */}
                {shareUrl && (
                  <div className="flex flex-col items-center space-y-4 border-t border-white/10 pt-8">
                    <EngineQRCode
                      url={shareUrl}
                      type="share"
                      recommendation={primaryRecommendation}
                      size={120}
                    />
                    <div className="text-center">
                      <p className="text-xs text-white/40 uppercase tracking-widest">
                        Save or share this blend
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Future Intelligence Preview (STAGED ONLY) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/30 uppercase tracking-widest">
                  Future Intelligence Preview
                </span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
              </div>

              <p className="text-xs text-white/40 leading-relaxed">
                "Want us to remember this for next time?"
                <br />
                <span className="text-[10px] text-white/20">Coming soon</span>
              </p>

              <p className="text-xs text-white/40 leading-relaxed">
                "When similar blends are available, you'll be notified."
                <br />
                <span className="text-[10px] text-white/20">Preview only - not functional</span>
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-4"
          >
            <button
              onClick={onContinue}
              className="w-full bg-[#00FFD1] text-black rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium hover:bg-[#00FFD1]/90 transition-all active:scale-95"
            >
              <CheckCircle size={20} />
              View Results
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-6 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <Share2 size={16} />
                <span className="text-sm">Share Options</span>
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}