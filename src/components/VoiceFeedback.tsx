import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../lib/colors';
import { analyzeFeedback, FeedbackAnalysis } from '../lib/feedbackLogic';
import { UIBlendRecommendation } from '../types/domain';

type Props = {
  recommendationName: string;
  currentRecommendation?: any; // Passed for context
  onClose: () => void;
  onRecalculate?: (constraints: string) => void;
};

type FeedbackState = 'idle' | 'listening' | 'processing' | 'speaking' | 'choice';

export function VoiceFeedback({ recommendationName, currentRecommendation, onClose, onRecalculate }: Props) {
  const [state, setState] = useState<FeedbackState>('listening');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const recognitionRef = useRef<any>(null);

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
        console.error("Speech Error", event.error);
        if (event.error === 'not-allowed') {
          setTranscript("Microphone access denied.");
          setState('idle');
        } else {
          setTranscript("Listening failed. Please try again.");
          setState('idle');
        }
      };

      // Auto-start
      startListening();
    } else {
      setTranscript("Voice not supported in this browser.");
      setState('idle');
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = () => {
    try {
      setState('listening');
      setTranscript('');
      recognitionRef.current?.start();
    } catch (e) {
      // Already started
    }
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

  // Ensure voices are loaded (Chrome compatibility)
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // console.log("Voices loaded:", voices.length);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // VOICE SELECTION STRATEGY:
    // Priority 1: "Samantha" (MacOS Premium)
    // Priority 2: "Google US English" (Chrome Premium)
    // Priority 3: First "en-US" or "en-GB" female/natural voice found
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name === 'Samantha' ||
      v.name === 'Google US English' ||
      (v.lang.startsWith('en') && v.name.includes('Female'))
    );

    if (preferredVoice) utterance.voice = preferredVoice;

    // Tuning for more natural sound
    utterance.rate = 1.05; // Slightly faster for conversational flow
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setState('speaking');
      setIsSynthesizing(true);
    };

    utterance.onend = () => {
      setIsSynthesizing(false);
      setState('choice');
    };

    window.speechSynthesis.speak(utterance);
    setState('speaking'); // Immediate state update
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
          className="w-full max-h-[90vh] flex flex-col bg-[#111] backdrop-blur-2xl rounded-t-[3rem] border-t border-white/10 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-8 border-b border-white/5 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FFD1] mb-2">StrainMath AI</h3>
              <h2 className="text-2xl font-serif text-white">Live Consultation</h2>
            </div>
            <button onClick={() => { window.speechSynthesis.cancel(); onClose(); }} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-h-[400px]">

            <AnimatePresence mode="wait">
              {/* LISTENING STATE */}
              {state === 'listening' && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  {/* Microphone Visualizer */}
                  <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#00FFD1]/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#00FFD1]/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <div className="relative w-24 h-24 rounded-full bg-[#00FFD1] flex items-center justify-center shadow-[0_0_40px_rgba(0,255,209,0.5)]">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl text-white font-light mb-2">Listening...</h3>
                  <p className="text-white/40 text-sm">Speak naturally. Try "It's too sleepy" or "I want more focus".</p>
                </motion.div>
              )}

              {/* PROCESSING STATE */}
              {state === 'processing' && (
                <motion.div key="processing" className="flex flex-col items-center">
                  <motion.div
                    className="w-16 h-16 border-t-2 border-[#00FFD1] rounded-full mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-white/60 mb-2 italic">"{transcript}"</p>
                  <p className="text-[#00FFD1] text-sm uppercase tracking-widest animate-pulse">Analyzing Intent...</p>
                </motion.div>
              )}

              {/* SPEAKING / CHOICE STATE */}
              {(state === 'speaking' || state === 'choice') && analysis && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-lg flex flex-col gap-6"
                >
                  {/* User Transcript Bubble */}
                  <div className="self-end bg-[#222] px-6 py-4 rounded-2xl rounded-tr-sm border border-white/10 max-w-[80%]">
                    <p className="text-white/60 text-sm italic">You said:</p>
                    <p className="text-white text-lg">"{transcript}"</p>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="self-start bg-[#00FFD1]/10 px-6 py-6 rounded-2xl rounded-tl-sm border border-[#00FFD1]/20 max-w-[90%] relative">
                    <div className="absolute -top-3 left-4 bg-[#00FFD1] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      StrainMath AI
                    </div>
                    <p className="text-[#00FFD1] text-lg leading-relaxed font-serif">
                      {analysis.systemResponse}
                    </p>
                    {state === 'speaking' && (
                      <button onClick={handleStopSpeaking} className="mt-4 text-xs text-[#00FFD1]/60 hover:text-[#00FFD1] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#00FFD1] rounded-full animate-ping" /> Speaking... Tap to skip
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  {state === 'choice' && (
                    <div className="flex gap-4 mt-8">
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
                        Recalculate Idea
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

