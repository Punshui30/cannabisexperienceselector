import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Share2, AlertCircle, ExternalLink } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { ResolvedSessionService } from '../services/ResolvedSessionService';
import { EngineCore3D } from './EngineCore3D';

export function ShareScreen() {
  const [recommendation, setRecommendation] = useState<UIBlendRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      // Extract sessionId from URL path: /session/share/:sessionId
      const pathMatch = window.location.pathname.match(/^\/session\/share\/([A-Z0-9]+)$/);
      const urlSessionId = pathMatch ? pathMatch[1] : null;

      // Fallback to query param for backward compatibility
      const querySessionId = new URLSearchParams(window.location.search).get('share');

      const finalSessionId = urlSessionId || querySessionId;

      if (!finalSessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      setSessionId(finalSessionId);

      try {
        const session = ResolvedSessionService.getSession(finalSessionId);
        if (session && session.type === 'share') {
          // For share sessions, use the first blend
          setRecommendation(session.blends[0] || null);
        } else {
          setError('Session not found or expired');
        }
      } catch (err) {
        setError('Failed to load session');
      }
      setLoading(false);
    };

    loadSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
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
          <h1 className="text-xl font-serif">Session Not Found</h1>
          <p className="text-white/60">{error || 'This shared blend may have expired'}</p>
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
      {/* Hero Section */}
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[-10%] w-[120%] h-[80%] bg-[#7C3AED]/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-[10%] right-[-10%] w-[100%] h-[60%] bg-[#00FFD1]/10 rounded-full blur-[80px] animate-pulse-slow delay-1000" />
        </div>

        {/* Engine Core 3D */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48">
            <EngineCore3D phase="chat" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={32} className="mx-auto mb-4" style={{ color: themeColor }} />
          </motion.div>

          <span className="text-xs uppercase tracking-widest font-black block mb-2" style={{ color: themeColor }}>
            {category} Experience
          </span>
          <h1 className="text-3xl font-serif text-white tracking-tight leading-tight mb-2">
            {recommendation.name}
          </h1>
          <p className="text-sm text-white/60">
            A unique blend crafted by StrainMath™ Engine
          </p>
        </motion.div>
      </div>

      <div className="max-w-md mx-auto px-6 pb-8 space-y-8">
        {/* Blend Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
          <h2 className="text-lg font-serif mb-4 text-center">Your Perfect Match</h2>

          <div className="text-center space-y-3">
            <div className="text-4xl font-bold" style={{ color: themeColor }}>
              {Math.round((recommendation.confidence || 0.85) * 100)}%
            </div>
            <p className="text-sm text-white/60">Confidence Score</p>
          </div>

          {recommendation.reasoning && (
            <div className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <p className="text-sm text-white/80 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          )}
        </motion.div>

        {/* Cultivar Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-serif text-center">Premium Cultivars</h3>

          {recommendation.cultivars.map((cultivar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-gradient-to-r from-white/[0.02] to-white/[0.01] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}40` }}
                  />
                  <div>
                    <span className="text-base font-medium text-white">{cultivar.name}</span>
                    <p className="text-sm text-white/60">{cultivar.profile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-medium">
                    {Math.round(cultivar.ratio * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-lg font-serif mb-2">Experience This Blend</h3>
            <p className="text-sm text-white/60">
              Visit a StrainMath™ partner dispensary to try this personalized recommendation
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.open('https://guidedoutcomes.app', '_blank')}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
            >
              <ExternalLink size={20} />
              <span className="text-sm font-medium">Visit StrainMath™</span>
            </button>

            <button
              onClick={() => navigator.share?.({
                title: recommendation.name,
                text: `Check out this custom cannabis blend: ${recommendation.name}`,
                url: window.location.href
              })}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
              aria-label="Share this blend"
            >
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center pt-8 border-t border-white/10"
        >
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Powered by StrainMath™ Engine Core V3
          </p>
          <p className="text-[10px] text-white/20 mt-1">
            Shared Experience • {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}