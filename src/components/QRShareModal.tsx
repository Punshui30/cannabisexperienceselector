import { motion } from 'motion/react';
import type { BlendRecommendation } from '../App';

type Props = {
  recommendation: BlendRecommendation;
  onClose: () => void;
};

export function QRShareModal({ recommendation, onClose }: Props) {
  if (!recommendation) return null;

  const shareUrl = `https://guidedoutcomes.app/stack/${recommendation.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recommendation.name,
        text: `Check out this stack: ${recommendation.name}`,
        url: shareUrl,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-[#0a0a0a] rounded-t-3xl border-t border-white/10"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-medium text-white">Share</h2>
            <p className="text-sm text-white/50">{recommendation.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 active:bg-white/10 flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable if needed */}
        <div className="px-6 py-6 space-y-6" style={{ maxHeight: 'calc(85vh - 80px)', overflowY: 'auto' }}>
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl blur-xl" />
              <div className="relative bg-white p-4 rounded-2xl">
                {/* QR Code Placeholder */}
                <svg width="160" height="160" viewBox="0 0 160 160" className="text-black">
                  <rect x="0" y="0" width="160" height="160" fill="white" />
                  {/* Corner markers */}
                  <rect x="16" y="16" width="40" height="40" fill="black" />
                  <rect x="24" y="24" width="24" height="24" fill="white" />
                  <rect x="104" y="16" width="40" height="40" fill="black" />
                  <rect x="112" y="24" width="24" height="24" fill="white" />
                  <rect x="16" y="104" width="40" height="40" fill="black" />
                  <rect x="24" y="112" width="24" height="24" fill="white" />
                  {/* Data pattern */}
                  {Array.from({ length: 12 }).map((_, i) =>
                    Array.from({ length: 12 }).map((_, j) =>
                      (i + j) % 3 === 0 && i > 6 && j > 6 && (
                        <rect
                          key={`${i}-${j}`}
                          x={16 + i * 8}
                          y={16 + j * 8}
                          width="6"
                          height="6"
                          fill="black"
                        />
                      )
                    )
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-base font-medium text-white mb-2">{recommendation.name}</h3>
            <p className="text-sm text-white/60">
              {recommendation.cultivars.length} cultivars • {recommendation.effects.duration}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCopyLink}
              className="w-full px-6 py-3 bg-white/5 active:bg-white/10 text-white rounded-xl border border-white/10 flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6" y="6" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M12 6V4.5C12 3.67157 11.3284 3 10.5 3H4.5C3.67157 3 3 3.67157 3 4.5V10.5C3 11.3284 3.67157 12 4.5 12H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              Copy Link
            </button>

            <button
              onClick={handleShare}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 active:from-emerald-600 active:to-teal-600 text-white rounded-xl flex items-center justify-center gap-3 font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="4.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="13.5" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="13.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 8L12 5M6 10L12 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Share
            </button>
          </div>

          <p className="text-xs text-white/40 text-center">
            QR code links to a read-only view
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}