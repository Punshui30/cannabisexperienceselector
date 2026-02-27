import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, AlertCircle, ExternalLink, Play, Pause, Music, Volume2, VolumeX, Tv } from 'lucide-react';
import type { UIBlendRecommendation } from '../types/domain';
import { ResolvedSessionService } from '../services/ResolvedSessionService';
import { EngineCore3D } from './EngineCore3D';

// Typed motion div so TS accepts initial/animate/exit
type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
};
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

const STORAGE_KEY_AUDIO = 'strainmath_user_audio_enabled';

export function ShareScreen() {
  const [recommendation, setRecommendation] = useState<UIBlendRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [vibeTrackUrl, setVibeTrackUrl] = useState<string | null>(null);
  const [isTvMode, setIsTvMode] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const isTv = params.get('mode') === 'tv' || params.get('tv') === 'true';
      setIsTvMode(isTv);

      // Extract sessionId from URL path: /session/share/:sessionId
      const pathMatch = window.location.pathname.match(/^\/session\/share\/([A-Z0-9]+)$/);
      const urlSessionId = pathMatch ? pathMatch[1] : null;

      // Fallback to query param for backward compatibility
      const querySessionId = params.get('share') || params.get('s');

      const finalSessionId = urlSessionId || querySessionId;

      // Audio track from URL or Session
      const trackParam = params.get('track') || params.get('audio');
      if (trackParam) {
        setVibeTrackUrl(decodeURIComponent(trackParam));
      }

      if (!finalSessionId) {
        if (!trackParam) {
          setError('No session ID provided');
          setLoading(false);
        } else {
          // If we have a track but no session ID, we might be in a direct-audio share mode
          setLoading(false);
        }
        return;
      }

      setSessionId(finalSessionId);

      try {
        const session = ResolvedSessionService.getSession(finalSessionId);
        if (session && session.type === 'share') {
          // For share sessions, use the first blend
          setRecommendation(session.blends[0] || null);
          if (session.vibeTrackUrl && !trackParam) {
            setVibeTrackUrl(session.vibeTrackUrl);
          }
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

  // Autoplay and Persistent Audio Logic
  useEffect(() => {
    if (!loading && vibeTrackUrl && audioRef.current) {
      const userEnabled = localStorage.getItem(STORAGE_KEY_AUDIO) === 'true';
      const shouldAutoplay = isTvMode || userEnabled;

      if (shouldAutoplay) {
        audioRef.current.play().then(() => {
          setAudioPlaying(true);
        }).catch(err => {
          console.log('[ShareScreen] Autoplay blocked:', err);
          setAudioPlaying(false);
        });
      }
    }
  }, [loading, vibeTrackUrl, isTvMode]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
        localStorage.setItem(STORAGE_KEY_AUDIO, 'true');
      }).catch(console.error);
    }
  };

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
    <div className="min-h-screen bg-black text-white selection:bg-[#00FFD1] selection:text-black">
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

        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <MotionDiv
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={32} className="mx-auto mb-4" style={{ color: themeColor }} />
          </MotionDiv>

          <span className="text-xs uppercase tracking-widest font-black block mb-2" style={{ color: themeColor }}>
            {category} Experience
          </span>
          <h1 className="text-3xl font-serif text-white tracking-tight leading-tight mb-2">
            {recommendation.name}
          </h1>
          <p className="text-sm text-white/60">
            A unique blend crafted by StrainMath™ Engine
          </p>

          {/* Audio Control (Prompt 2) */}
          {vibeTrackUrl && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex justify-center"
            >
              <button
                onClick={toggleAudio}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl hover:bg-white/20 transition-all active:scale-95 shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#00FFD1]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {audioPlaying ? (
                  <Pause size={24} className="text-[#00FFD1]" fill="currentColor" />
                ) : (
                  <Play size={24} className="text-white translate-x-0.5" fill="currentColor" />
                )}

                {/* Vinyl Spinner Effect */}
                {audioPlaying && (
                  <MotionDiv
                    className="absolute inset-0 border-2 border-dashed border-[#00FFD1]/40 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </button>

              <audio
                ref={audioRef}
                src={vibeTrackUrl}
                loop
                muted={audioMuted}
                onPlay={() => setAudioPlaying(true)}
                onPause={() => setAudioPlaying(false)}
              />
            </MotionDiv>
          )}
        </MotionDiv>
      </div>

      <div className={`max-w-md mx-auto px-6 pb-8 space-y-8 ${isTvMode ? 'pt-12' : ''}`}>

        {/* TV Mode Header (Prompt 4) */}
        {isTvMode && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tv size={16} className="text-[#00FFD1]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Presentation Mode</span>
          </div>
        )}

        {/* Blend Overview */}
        <MotionDiv
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
              <p className="text-sm text-white/80 leading-relaxed font-light italic">
                &ldquo;{recommendation.reasoning}&rdquo;
              </p>
            </div>
          )}
        </MotionDiv>

        {/* Cultivar Highlights */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 text-center">Blend Composition</h3>

          {recommendation.cultivars.map((cultivar, idx) => (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-gradient-to-r from-white/[0.02] to-white/[0.01] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                  />
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-[#00FFD1] transition-colors">{cultivar.name}</span>
                    <p className="text-[10px] text-white/40 uppercase tracking-tighter">{cultivar.profile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-medium text-white/90">
                    {Math.round(cultivar.ratio * 100)}%
                  </span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>

        {/* CTA Section */}
        {!isTvMode && (
          <MotionDiv
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
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: recommendation.name,
                      text: `Check out this custom cannabis blend: ${recommendation.name}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                aria-label="Share this blend"
              >
                <Share2 size={20} />
              </button>
            </div>
          </MotionDiv>
        )}

        {/* Footer */}
        <MotionDiv
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
        </MotionDiv>
      </div>
    </div>
  );
}