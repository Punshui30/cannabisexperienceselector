import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Camera, Search } from 'lucide-react';
import { IntentSeed as UserInput } from '../types/domain';
import { BLEND_SCENARIOS, BlendScenario } from '../data/presetBlends';
import { SwipeDeck } from './SwipeDeck';
import type { OutcomeExemplar } from '../types/domain'; // Import OutcomeExemplar

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
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col relative z-10 overflow-hidden bg-transparent"> {/* h-screen fixed */}

      {/* --- HEADER (Fixed) --- */}
      <div className="flex-shrink-0 pt-12 px-6 pb-4 bg-gradient-to-b from-black via-black to-transparent z-20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-white tracking-tighter">GO</span>
              <h1 className="text-3xl font-light text-white serif">Build your blend</h1>
            </div>
            <p className="text-white/30 text-sm pl-9">Choose how you want to start</p>
          </div>
          <button
            onClick={onAdminModeToggle}
            className="p-2 text-white/10 hover:text-[#00FFD1] transition-colors"
          >
            <div className="w-1.5 h-1.5 rounded-full border border-current" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setMode('describe')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'describe' ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            Describe
          </button>
          <button
            onClick={() => setMode('product')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'product' ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            Photo
          </button>
          <button
            onClick={() => setMode('strain')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'strain' ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            Strain
          </button>
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
                  placeholder="Tell us how you want to feel..."
                  className={`${GLASS_INPUT} h-32 resize-none`} // Anchored height h-32
                />
                {/* NO CHIPS HERE */}
                <button
                  onClick={toggleListening}
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
                className={`relative w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${dragActive ? "border-[#00FFD1] bg-[#00FFD1]/5" : uploadedImage ? "border-emerald-400/50 bg-emerald-400/5" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
              >
                {/* Upload Content */}
                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setUploadedImage(e.target.files[0])} />
                {uploadedImage ? (
                  <div className="text-center"><p className="text-emerald-400 font-medium text-sm mb-1">{uploadedImage.name}</p></div>
                ) : (
                  <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center p-8"><Camera className="text-white/20 mb-4" size={20} /><p className="text-white font-medium mb-1">Upload Label</p></label>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'strain' && (
            <motion.div key="strain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-shrink-0">
              <input type="text" value={strainName} onChange={(e) => setStrainName(e.target.value)} placeholder="Strain name..." className={`${GLASS_INPUT} mb-4`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SCENARIOS (Flexible height) --- */}
        <div className="flex-1 min-h-[200px] relative flex flex-col">
          <div className="flex justify-between items-end mb-2 flex-shrink-0">
            <div>
              <h3 className="text-white text-lg font-light serif">Start with a Scenario</h3>
              <p className="text-white/40 text-xs">Tap to populate</p>
            </div>
          </div>

          <div className="flex-1 relative min-h-0">
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
                    className="w-full h-full text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00FFD1]/30 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: scenario.visualProfile.color }} />

                    <div>
                      <h4 className="text-xl font-light text-white mb-1 serif">{scenario.title}</h4>
                      <p className="text-xs uppercase tracking-widest text-white/40 mb-4">{scenario.subtitle}</p>
                      <p className="text-sm text-white/80 leading-relaxed font-light italic">
                        "{scenario.inputText}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
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

      </div>

      {/* --- FOOTER (Fixed) --- */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black to-transparent z-20 flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`w-full btn-neon-green ${!canSubmit() && 'opacity-20 cursor-not-allowed scale-100 shadow-none'}`}
        >
          Generate Recommendations
        </button>

        <button
          onClick={onBrowsePresets}
          className="w-full py-4 rounded-xl border border-white/10 bg-white/[0.02] text-white/40 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/5 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 transition-all"
        >
          Explore Preset Stacks
        </button>
      </div>

    </div>
  );
}