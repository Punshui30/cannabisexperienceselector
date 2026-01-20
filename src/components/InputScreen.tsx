import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Camera, Search, Check, Upload } from 'lucide-react';
import { IntentSeed as UserInput, OutcomeExemplar } from '../types/domain';
import { BLEND_SCENARIOS, BlendScenario } from '../data/presetBlends';
import { SwipeDeck } from './SwipeDeck';
import { PublicFeed } from './PublicFeed';
import { LiveNetworkDrawer } from './LiveNetworkDrawer';
import logoImg from '../assets/logo.png';

// --- DESIGN TOKENS ---
const GLASS_INPUT = "w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FFD1]/50 transition-colors text-sm";
const TAB_ACTIVE = "bg-[#00FFD1] text-black shadow-lg shadow-[#00FFD1]/10";
const TAB_INACTIVE = "text-white/40 hover:text-white hover:bg-white/5";

interface InputScreenProps {
  onSubmit: (input: UserInput) => void;
  onBrowsePresets: () => void;
  onSelectExemplar?: (exemplar: OutcomeExemplar) => void;
  onSelectPreset: (exemplar: OutcomeExemplar | BlendScenario) => void;
  onAdminModeToggle: () => void;
  isAdminMode: boolean;
  initialText?: string;
}

export function InputScreen({ onSubmit, onBrowsePresets, onSelectExemplar, onSelectPreset, onAdminModeToggle, isAdminMode, initialText }: InputScreenProps) {
  const [mode, setMode] = useState<'describe' | 'product' | 'strain'>('describe');
  const [description, setDescription] = useState('');

  // DEBUG: Verify version
  useEffect(() => {

  }, []);

  // Effect to populate text from Static View return
  useEffect(() => {
    if (initialText) {
      setDescription(initialText);
      setMode('describe');
    }
  }, [initialText]);

  const [strainName, setStrainName] = useState('');
  const [growerName, setGrowerName] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const canSubmit = () => {
    if (mode === 'describe') return description.length > 5;
    if (mode === 'product') return !!uploadedImage;
    if (mode === 'strain') return strainName.length > 2;
    return false;
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true); // Indicate that listening has started

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false); // Stop listening on error
    };

    recognition.onend = () => {
      setIsListening(false); // Stop listening when recognition ends
    };
  };
  const handleSubmit = () => {
    if (!canSubmit()) return;

    const input: UserInput = {
      kind: 'blend',
      mode: 'engine',
      text: mode === 'describe'
        ? description
        : mode === 'strain'
          ? `${strainName}${growerName ? ' by ' + growerName : ''}`.trim()
          : "Product Image Input", // Fallback text for image-only
      image: mode === 'product' && uploadedImage ? URL.createObjectURL(uploadedImage) : undefined,
      strainName: mode === 'strain' ? strainName : undefined,
      grower: mode === 'strain' ? growerName : undefined
    };

    onSubmit(input);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedImage(e.dataTransfer.files[0]);
    }
  };

  /* SPEECH RECOGNITION IMPLEMENTATION */
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check for browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => {
            // Add space if needed
            const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + spacer + finalTranscript;
          });
        }
      };

      recog.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        if (isListening) {
          // Optional logic
        }
      };

      setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  /* TYPEWRITER EFFECT */
  const [placeholderText, setPlaceholderText] = useState('');

  const INSTRUCTIONS: Record<string, string> = {
    describe: "Describe how you want to feel, what you want to avoid, or a scenario...",
    product: "Take a picture of a product label that you like...",
    strain: "Enter a strain name and a brand or grower..."
  };

  useEffect(() => {
    setPlaceholderText('');
    const targetText = INSTRUCTIONS[mode] || '';
    let index = 0;

    const intervalId = setInterval(() => {
      if (index < targetText.length) {
        setPlaceholderText(prev => prev + targetText.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 30);

    return () => clearInterval(intervalId);
  }, [mode]);

  return (
    <div className="w-full h-screen flex flex-col relative z-10 overflow-hidden bg-transparent"> {/* h-screen fixed */}

      {/* --- HEADER (Fixed) --- */}
      <div className="flex-shrink-0 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/90 via-black/50 to-transparent z-20">
        <div className="w-full flex flex-col items-center pt-4 pb-2 relative z-10">

          {/* --- BRANDING HEADER --- */}
          <div className="w-full flex-shrink-0 px-6 flex flex-col items-center">
            {/* Logo */}
            <div className="mb-2">
              <img
                src={logoImg}
                alt="StrainMath Logo"
                className="h-[40px] w-auto max-h-[48px] object-contain brightness-0 invert opacity-80"
              />
            </div>

            <div className="text-center">
              <h2 className="text-2xl text-white font-light serif tracking-tight">Describe Your Goal</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium mt-1">
                Start with a scenario or describe usage
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <span className="h-[1px] w-3 bg-white/10" />
                <p className="text-[7px] text-[#C9A24D]/80 uppercase tracking-widest font-light">
                  Powered by <span className="serif font-normal">StrainMath</span><span className="text-[6px] align-top">™</span>
                </p>
                <span className="h-[1px] w-3 bg-white/10" />
              </div>
            </div>

            {/* Admin Toggle (Absolute top right) */}
            <button
              onClick={onAdminModeToggle}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isAdminMode ? 'bg-[#00FFD1]/20 text-[#00FFD1]' : 'text-white/20 hover:text-white'}`}
            >
              <span className="sr-only">Admin</span>
              <div className={`w-2 h-2 rounded-full ${isAdminMode ? 'bg-[#00FFD1]' : 'bg-current'}`} />
            </button>
          </div>

          {/* Tabs - Centered & Compact */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mt-4 max-w-sm w-full mx-6">
            <button
              onClick={() => setMode('describe')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'describe' ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              Describe
            </button>
            <button
              onClick={() => setMode('product')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'product' ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              Photo
            </button>
            <button
              onClick={() => setMode('strain')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'strain' ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              Strain
            </button>
          </div>
        </div>
      </div>

      {/* --- BODY (Scrollable/Flexible) --- */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0 flex flex-col gap-4"> {/* Gap for spacing */}
        <AnimatePresence mode="wait">
          {mode === 'describe' && (
            <motion.div
              key="describe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0" // Allow it to perform layout but not force grow excessively
            >
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe how you want to feel, what you want to avoid, or a scenario..."
                  className={`${GLASS_INPUT} h-32 resize-none transition-all placeholder:text-white/30 px-5 py-4 leading-relaxed text-base`} // Added padding and text-base
                />
                {/* NO CHIPS HERE */}
                <button
                  onClick={handleMicClick}
                  className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-white'}`}
                >
                  <Mic size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Other modes simplified for similar anchoring */}
          {mode === 'product' && (
            // ... (Keeping logic, just ensuring layout fits)
            <motion.div key="product" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-shrink-0">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${dragActive ? "border-[#00FFD1] bg-[#00FFD1]/5" : uploadedImage ? "border-emerald-400/50 bg-emerald-400/5" : "border-white/10 bg-white/5"}`}
              >
                {/* Hidden Inputs */}
                <input
                  type="file"
                  id="camera-upload"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && setUploadedImage(e.target.files[0])}
                />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setUploadedImage(e.target.files[0])}
                />

                {uploadedImage ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check size={24} className="text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 font-medium text-sm mb-1">Image Captured</p>
                    <p className="text-white/40 text-xs max-w-[200px] truncate">{uploadedImage.name}</p>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="mt-4 text-xs uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 w-full px-8">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-2">Select capture method</p>

                    <div className="flex gap-4 w-full">
                      {/* Camera Button */}
                      <label
                        htmlFor="camera-upload"
                        className="flex-1 h-32 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00FFD1]/20 transition-colors">
                          <Camera size={20} className="text-white/60 group-hover:text-[#00FFD1]" />
                        </div>
                        <span className="text-xs font-medium text-white/60 group-hover:text-white">Take Photo</span>
                      </label>

                      {/* Upload Button */}
                      <label
                        htmlFor="file-upload"
                        className="flex-1 h-32 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00FFD1]/20 transition-colors">
                          <Upload size={20} className="text-white/60 group-hover:text-[#00FFD1]" />
                        </div>
                        <span className="text-xs font-medium text-white/60 group-hover:text-white">Upload File</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'strain' && (
            <motion.div key="strain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-shrink-0">
              <input type="text" value={strainName} onChange={(e) => setStrainName(e.target.value)} placeholder={placeholderText} className={`${GLASS_INPUT} mb-4 placeholder:text-white/30`} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* --- SCENARIOS (Density Adjustment: Reduced height and padding) --- */}
      <div className="w-full relative flex flex-col gap-2 shrink-0 px-6">
        <div className="flex justify-between items-end mb-1 flex-shrink-0">
          <div>
            <h3 className="text-white text-base font-light serif">Start with a Scenario</h3>
            <p className="text-white/40 text-[10px]">Tap to populate</p>
          </div>
        </div>

        <div className="w-full relative h-56"> {/* Density adjustment: h-72 → h-56 (22% reduction) */}
          <SwipeDeck
            items={BLEND_SCENARIOS}
            enableGuidance={true}
            renderItem={(scenario, isActive) => (
              <div className="w-full h-full pr-4 pb-4">
                <button
                  onClick={() => {
                    // PHASE 1: POPULATE ONLY
                    setMode('describe');
                    setDescription(scenario.inputText);
                  }}
                  className="w-full h-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex flex-col justify-between group relative overflow-hidden" /* Density adjustment: p-6 → p-4 */
                  style={{
                    // Layer 2: Hairline perimeter (entire card)
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: `inset 0 0 0 1px ${scenario.visualProfile.color}30`
                  }}
                >
                  {/* Layer 1: Top-weighted iridescent accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, 
                          transparent 0%, 
                          ${scenario.visualProfile.color}80 20%, 
                          ${scenario.visualProfile.color} 50%, 
                          ${scenario.visualProfile.color}80 80%, 
                          transparent 100%)`,
                      filter: 'blur(0.5px)'
                    }}
                  />

                  <div>
                    <h4 className="text-lg font-light text-white mb-0.5 serif">{scenario.title}</h4> {/* Density adjustment: text-xl → text-lg, mb-1 → mb-0.5 */}
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{scenario.subtitle}</p> {/* Density adjustment: text-xs → text-[10px], mb-4 → mb-2 */}
                    <p className="text-xs text-white/80 leading-snug font-light italic"> {/* Density adjustment: text-sm → text-xs, leading-relaxed → leading-snug */}
                      "{scenario.inputText}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2"> {/* Density adjustment: mt-4 → mt-2 */}
                    <span className="text-[10px] uppercase tracking-widest text-[#00FFD1] opacity-0 group-hover:opacity-100 transition-opacity">Set Intent</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-[#00FFD1] group-hover:text-black transition-all">
                      <Search size={14} />
                    </div>
                  </div>
                </button>
              </div>
            )}
          />
        </div>

      </div>

      {/* --- LIVE NETWORK DRAWER (Fixed Overlay) --- */}
      <LiveNetworkDrawer />

      {/* --- FOOTER (Fixed) --- */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col gap-3" style={{ marginBottom: '60px' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`w-full btn-neon-green ${!canSubmit() && 'opacity-20 cursor-not-allowed scale-100 shadow-none'}`}
        >
          Generate Recommendations
        </button>

        <button
          onClick={onBrowsePresets}
          className="mx-auto py-2 px-4 rounded-full bg-transparent text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-all hover:bg-white/5"
        >
          Explore Preset Stacks
        </button>
      </div>

    </div>
  );
}