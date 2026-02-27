import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeFeedback, FeedbackAnalysis } from '../lib/feedbackLogic';
import { UIBlendRecommendation } from '../types/domain';

type Props = {
  recommendationName: string;
  currentRecommendation?: any;
  onClose: () => void;
  onRecalculate?: (constraints: string) => void;
  mode?: 'consultation' | 'feedback'; // New prop
};

type FeedbackState = 'idle' | 'listening' | 'processing' | 'speaking' | 'choice';

export function VoiceFeedback({ recommendationName, currentRecommendation, onClose, onRecalculate, mode = 'feedback' }: Props) {
  const [state, setState] = useState<FeedbackState>(mode === 'consultation' ? 'speaking' : 'listening');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null); // Track interval to clear it

  // Initialize Logic
  useEffect(() => {
    // Cleanup helper
    const cleanup = () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // CONSULTATION MODE (Visual Only, No Mic)
    if (mode === 'consultation') {
      const script = "I am analyzing your preferences. Comparing sixty cultivars. Calculating synergy.";
      setState('speaking');

      let i = 0;
      setTranscript(""); // Reset

      intervalRef.current = setInterval(() => {
        setTranscript(script.substring(0, i));
        i++;
        if (i > script.length) {
          clearInterval(intervalRef.current);
          // AUTO-CLOSE after a brief pause
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }, 50);

      return cleanup;
    }

    // FEEDBACK MODE (Mic Active)
    // Only load voices/mic if in feedback mode
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    startListening();

    return cleanup;
  }, [mode, recommendationName]); // Re-run if mode changes

  const startListening = () => {
    if (mode === 'consultation') return; // Double protection

    try {
      if (!recognitionRef.current) {
        // Init mic if needed
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.onresult = (e: any) => {
            const text = e.results[0][0].transcript;
            setTranscript(text);
            processInput(text);
          };
          recognitionRef.current.onerror = (e: any) => {
            if (e.error === 'not-allowed') {
              setTranscript("Microphone access denied.");
              setState('idle');
            } else {
              // Silently fail or reset
              setState('listening');
            }
          };
        }
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
        setState('listening');
      }
    } catch (e) { }
  };

  const processInput = (text: string) => {
    setState('processing');

    // Simulate thinking delay for realism
    setTimeout(() => {
      const result = analyzeFeedback(text, currentRecommendation || { name: recommendationName });
      setAnalysis(result);
      speakResponse(result.systemResponse);
    }, 1200);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processInput(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setTranscript("Microphone access denied.");
          setState('idle');
        } else {
          // Silently fail or reset
          setState('listening');
        }
      };
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Voice Selection Priority
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name === "Samantha")
      || voices.find(v => v.name === "Google US English")
      || voices.find(v => v.lang === "en-US");

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1.05; // Slightly faster/crisper
    utterance.pitch = 1.0;

    setIsSynthesizing(true);

    utterance.onend = () => {
      setIsSynthesizing(false);
      // If resolving, we might stay here or close?
      if (recommendationName === "Finding your match...") {
        // Wait a bit then close? Or wait for parent?
        // Parent (ResolvingScreen) handles onComplete usually via recommendation check?
        // Actually VoiceFeedback doesn't auto-close. The parent ResolvingScreen unmounts when 'results' view is set.
      } else {
        setState('choice'); // Show choices after speaking result
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleRecalculate = () => {
    window.speechSynthesis.cancel();
    if (onRecalculate && analysis) {
      onRecalculate(analysis.newConstraints?.join(' ') || analysis.userIntent);
    }
    onClose();
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSynthesizing(false);
    setState('choice');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-h-[90vh] flex flex-col bg-[#111] backdrop-blur-2xl rounded-t-[3rem] border-t border-white/10 overflow-hidden shadow-2xl items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="w-full flex-shrink-0 p-8 border-b border-white/5 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FFD1] mb-2">StrainMath AI</h3>
              <h2 className="text-2xl font-serif text-white">Live Consultation</h2>
            </div>
            <button onClick={() => { window.speechSynthesis.cancel(); onClose(); }} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-md w-full flex-1">

            {/* State Visuals */}
            <div className="mb-8 relative h-24 w-24 flex items-center justify-center">
              {state === 'listening' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-[#00FFD1]/20 flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-[#00FFD1]/20 rounded-full flex items-center justify-center border border-[#00FFD1]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFD1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                </motion.div>
              )}

              {(state === 'processing' || state === 'speaking') && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20"
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-[0_0_20px_white]" />
                </motion.div>
              )}
            </div>

            {/* Transcription / Caption Area */}
            <div className="min-h-[120px] flex items-center justify-center flex-col w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={transcript || "placeholder"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-light text-white leading-relaxed font-serif break-words w-full"
                >
                  {transcript}
                  {(state === 'speaking' || state === 'listening') && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-6 ml-1 align-middle bg-[#00FFD1]"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="text-xs uppercase tracking-widest text-white/40 mt-6">
                {state === 'listening' && "Listening..."}
                {state === 'processing' && "Thinking..."}
                {state === 'speaking' && "Consultant Analysis"}
                {state === 'choice' && "Awaiting Decision"}
              </p>
            </div>

            {/* Actions for Choice State */}
            {state === 'choice' && (
              <div className="flex gap-4 mt-8 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-medium"
                >
                  Keep Current
                </button>
                <button
                  onClick={handleRecalculate}
                  className="flex-1 py-4 rounded-xl bg-[#00FFD1] text-black font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,209,0.2)] hover:shadow-[0_0_30px_rgba(0,255,209,0.4)] transition-all"
                >
                  Recalculate
                </button>
              </div>
            )}
            {/* Skip Speaking */}
            {state === 'speaking' && (
              <button
                onClick={handleStopSpeaking}
                className="mt-8 px-6 py-2 rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Skip Narration
              </button>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
