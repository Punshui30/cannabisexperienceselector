import { useEffect, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Clock, Users, Target, AlertCircle } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { ResolvedSessionService } from '../services/ResolvedSessionService';

type MotionDivProps = HTMLMotionProps<"div"> & {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
};
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

export function CheckoutScreen() {
  const [recommendation, setRecommendation] = useState<UIBlendRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      // Extract sessionId from URL path: /session/checkout/:sessionId OR /share/:sessionId OR query
      const pathMatch = window.location.pathname.match(/\/(?:session\/checkout|share)\/([A-Z0-9a-z-]+)$/);
      const urlSessionId = pathMatch ? pathMatch[1] : null;

      // Fallback to query param
      const querySessionId = new URLSearchParams(window.location.search).get('checkout') || new URLSearchParams(window.location.search).get('s');

      const finalSessionId = urlSessionId || querySessionId;

      if (!finalSessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      setSessionId(finalSessionId);

      try {
        const res = await fetch(`/api/shares/${finalSessionId}`);
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        const data = await res.json();

        // Supabase returns { payload: { blend: UIBlendRecommendation, ... } }
        if (data && data.payload && data.payload.blend) {
          setRecommendation(data.payload.blend);
        } else {
          setError('Share payload format invalid');
        }

      } catch (err) {
        console.error('Failed to load session:', err);
        setError('Failed to load session');
      }
      setLoading(false);
    };

    loadSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <MotionDiv
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (error || !recommendation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <h1 className="text-xl font-serif">Session Error</h1>
          <p className="text-white/60">{error || 'Invalid session'}</p>
        </div>
      </div>
    );
  }

  // Category color mapping
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial - gradient(circle at 50 % 100 %, ${themeColor}20 0 %, transparent 100 %)`
          }}
        />

        <MotionDiv
          initial={{ opacity: 0, y: 20 } as any}
          animate={{ opacity: 1, y: 0 } as any}
          transition={{ duration: 0.6 } as any}
          className="relative z-10 text-center px-6"
        >
          <span className="text-xs uppercase tracking-widest font-black block mb-2" style={{ color: themeColor }}>
            Checkout Session
          </span>
          <h1 className="text-3xl font-serif text-white tracking-tight leading-tight">
            {recommendation.name}
          </h1>
          <p className="text-sm text-white/60 mt-2">
            StrainMath™ Engine Generated Blend
          </p>
        </MotionDiv>
      </div>

      <div className="max-w-md mx-auto px-6 pb-8 space-y-8">
        {/* Blend Info */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 } as any}
          animate={{ opacity: 1, y: 0 } as any}
          transition={{ duration: 0.6, delay: 0.1 } as any}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} style={{ color: themeColor }} />
            <span className="text-sm font-medium uppercase tracking-wider">Blend Profile</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Category</span>
              <span className="font-medium" style={{ color: themeColor }}>{category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Confidence</span>
              <span className="font-medium">{Math.round((recommendation.confidence || 0.85) * 100)}%</span>
            </div>
            {recommendation.matchScore && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Match Score</span>
                <span className="font-medium">{Math.round(recommendation.matchScore * 100)}%</span>
              </div>
            )}
          </div>
        </MotionDiv>

        {/* Cultivar Breakdown */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 } as any}
          animate={{ opacity: 1, y: 0 } as any}
          transition={{ duration: 0.6, delay: 0.2 } as any}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Users size={20} style={{ color: themeColor }} />
            <span className="text-sm font-medium uppercase tracking-wider">Cultivar Composition</span>
          </div>

          {recommendation.cultivars.map((cultivar: any, idx) => (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, x: -10 } as any}
              animate={{ opacity: 1, x: 0 } as any}
              transition={{ delay: 0.3 + idx * 0.1 } as any}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}40` }}
                  />
                  <div>
                    <span className="text-sm font-medium text-white">{cultivar.name}</span>
                    <p className="text-xs text-white/50">{cultivar.profile}</p>
                  </div>
                </div>
                <span className="text-lg font-mono font-medium">
                  {Math.round(cultivar.ratio * 100)}%
                </span>
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>

        {/* Effects Timeline */}
        {recommendation.timeline && recommendation.timeline.length > 0 && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 } as any}
            animate={{ opacity: 1, y: 0 } as any}
            transition={{ duration: 0.6, delay: 0.4 } as any}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} style={{ color: themeColor }} />
              <span className="text-sm font-medium uppercase tracking-wider">Expected Timeline</span>
            </div>

            <div className="space-y-3">
              {recommendation.timeline.map((point: any, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: themeColor }} />
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-wider">{point.time}</span>
                    <p className="text-sm text-white/80 mt-1">{point.feeling}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionDiv>
        )}

        {/* Footer */}
        <MotionDiv
          initial={{ opacity: 0 } as any}
          animate={{ opacity: 1 } as any}
          transition={{ duration: 0.6, delay: 0.6 } as any}
          className="text-center pt-8 border-t border-white/10"
        >
          <p className="text-xs text-white/30 uppercase tracking-widest">
            StrainMath™ Engine Core V3
          </p>
          <p className="text-[10px] text-white/20 mt-1">
            Session ID: {sessionId}
          </p>
        </MotionDiv>
      </div>
    </div>
  );
}