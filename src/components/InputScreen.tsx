import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Camera, Search, Check, Upload, Layers, ChevronRight, X } from 'lucide-react';
import { IntentSeed as UserInput, OutcomeExemplar } from '../types/domain';
import { BLEND_SCENARIOS, BlendScenario } from '../data/presetBlends';
import { PRESET_STACKS } from '../data/presetStacks';
import { getGlassCardStyles } from '../lib/glassStyles';
import { CameraModal } from './CameraModal';
import { startListening } from '../lib/speech';
import { CardShell } from './CardShell';

interface InputScreenProps {
  onSubmit: (input: UserInput) => void;
  onBrowsePresets: () => void;
  onSelectExemplar?: (exemplar: OutcomeExemplar) => void;
  onSelectPreset: (exemplar: OutcomeExemplar | BlendScenario) => void;
  onSelectScenario: (scenario: BlendScenario) => void;
  onAdminModeToggle: () => void;
  isAdminMode: boolean;
  initialText?: string;
}

import logoImg from '../assets/logo.png';

// --- DESIGN TOKENS ---
const GLASS_INPUT = "w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FFD1]/50 transition-colors text-sm";
const TAB_ACTIVE = "bg-[#00FFD1] text-black shadow-lg shadow-[#00FFD1]/10";
const TAB_INACTIVE = "text-white/40 hover:text-white hover:bg-white/5";

export function InputScreen({ onSubmit, onBrowsePresets, onSelectExemplar, onSelectPreset, onAdminModeToggle, isAdminMode, initialText }: InputScreenProps) {
  const [mode, setMode] = useState<'describe' | 'product' | 'strain'>('describe');
  const [description, setDescription] = useState('');
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

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

  const handleCapture = (blob: Blob) => {
    const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
    setUploadedImage(file);
    setShowCamera(false);
  };

  const canSubmit = () => {
    if (mode === 'describe') return description.length > 5;
    if (mode === 'product') return !!uploadedImage;
    if (mode === 'strain') return strainName.length > 2;
    return false;
  };

  // --- SYSTEM-WIDE AUTO-SCROLL (The "Jump" Logic) ---
  // Signals to the user that the engine is ready to fire by bringing the button into view.
  // CRITICAL: Suppressed while typing to prevent the field from moving away from the user.
  useEffect(() => {
    const isFieldFocused = document.activeElement?.tagName === 'TEXTAREA' ||
      document.activeElement?.tagName === 'INPUT';

    if (canSubmit() && !isFieldFocused) {
      scrollToBottom();
    }
  }, [description, strainName, uploadedImage, mode]);


  const [listeningField, setListeningField] = useState<string | null>(null);

  const handleMicClick = () => {
    startListening(t => setDescription(prev => prev ? `${prev} ${t}` : t), (listening) => {
      setIsListening(listening);
      setListeningField(listening ? 'describe' : null);
      if (!listening) scrollToBottom();
    });
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const input: UserInput = {
      kind: 'blend',
      mode: mode === 'strain' ? 'strain' : 'engine',
      text: mode === 'describe'
        ? description
        : mode === 'strain'
          ? `${strainName}${growerName ? ' by ' + growerName : ''}`.trim()
          : "Product Image Input",
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
    }, 20);

    return () => clearInterval(intervalId);
  }, [mode]);

  return (
    <div className="w-full h-full flex flex-col relative z-10 bg-black text-white overflow-hidden">

      {/* FLOATING BACKGROUND ORBS (Premium Glassmorphism Foundation) */}
      <motion.div
        className="absolute top-1/4 left-1/4 rounded-full pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 255, 209, 0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 rounded-full pointer-events-none"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(212, 175, 106, 0.12) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* --- HEADER --- */}
      <div className="flex-shrink-0 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/60 via-black/20 to-transparent">
        {/* Layer 1: Top-weighted iridescent accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] opacity-80"
          style={{
            background: `linear-gradient(90deg, 
                transparent 0%, 
                #00FFD180 20%, 
                #00FFD1 50%, 
                #00FFD180 80%, 
                transparent 100%)`,
            filter: 'blur(0.5px)'
          }}
        />
        <div className="w-full flex flex-col items-center pt-4 pb-2">

          {/* Logo & Tap Gesture */}
          <div className="mb-2">
            <button
              onClick={() => {
                const now = Date.now();
                if (now - lastTapTime > 1000) {
                  setLogoTapCount(1);
                } else {
                  const newCount = logoTapCount + 1;
                  setLogoTapCount(newCount);
                  if (newCount >= 6) {
                    onAdminModeToggle();
                    setLogoTapCount(0);
                  }
                }
                setLastTapTime(now);
              }}
              className="active:scale-95 transition-transform outline-none"
            >
              <img
                src={logoImg}
                alt="StrainMath™ Logo"
                className="h-[32px] w-auto transition-all"
                style={{ filter: 'brightness(0) saturate(100%) invert(83%) sepia(36%) saturate(1478%) hue-rotate(354deg) brightness(91%) contrast(93%)' }}
              />
            </button>
          </div>

          <div className="text-center px-6">
            <h2 className="text-xl text-white font-light serif tracking-tight">How should you feel?</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium mt-0.5">
              Describe your goal or pick a curated path
            </p>
          </div>

          {/* Tabs - Compact UI */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mt-4 max-w-sm w-[90vw] mx-auto">
            {(['describe', 'product', 'strain'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMode(t)}
                className={`flex-1 py-2 px-1 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${mode === t ? TAB_ACTIVE : TAB_INACTIVE}`}
              >
                {t === 'describe' ? 'Describe' : t === 'product' ? 'Photo' : 'Strain'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE BODY --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32">
        <div className="px-6 space-y-5 py-2">

          {/* INPUT AREA */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              {mode === 'describe' && (
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={placeholderText}
                    className={`${GLASS_INPUT} h-28 resize-none transition-all placeholder:text-white/20 px-5 py-4 leading-relaxed text-sm`}
                  />
                  <button
                    onClick={handleMicClick}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all ${isListening && listeningField === 'describe' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-[#00FFD1]'}`}
                  >
                    <Mic size={16} />
                  </button>
                </div>
              )}

              {mode === 'product' && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative w-full h-40 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${dragActive ? "border-[#00FFD1] bg-[#00FFD1]/5" : uploadedImage ? "border-emerald-400/50 bg-emerald-400/5" : "border-white/10 bg-white/5"}`}
                >
                  {uploadedImage ? (
                    <div className="text-center">
                      <Check className="text-[#00FFD1] mx-auto mb-2" size={24} />
                      <p className="text-xs text-white/60">Image Set</p>
                      <button onClick={() => setUploadedImage(null)} className="text-[10px] text-white/30 uppercase mt-2">Remove</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCamera(true)}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#00FFD1]/10 group-hover:border-[#00FFD1]/30 transition-all">
                        <Camera size={24} className="text-white/40 group-hover:text-[#00FFD1]" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Capture Product Label</span>
                    </button>
                  )}
                </div>
              )}

              {mode === 'strain' && (
                <div className="flex flex-col gap-3 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={strainName}
                      onChange={(e) => setStrainName(e.target.value)}
                      placeholder="Strain Name (e.g. Jack Herer)"
                      className={GLASS_INPUT}
                    />
                    <button
                      onClick={() => startListening(t => setStrainName(t), (l) => {
                        setIsListening(l);
                        setListeningField(l ? 'strain' : null);
                        if (!l) scrollToBottom();
                      })}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening && listeningField === 'strain' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-[#00FFD1]'}`}
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={growerName}
                      onChange={(e) => setGrowerName(e.target.value)}
                      placeholder="Brand/Grower (Optional)"
                      className={GLASS_INPUT}
                    />
                    <button
                      onClick={() => startListening(t => setGrowerName(t), (l) => {
                        setIsListening(l);
                        setListeningField(l ? 'grower' : null);
                        if (!l) scrollToBottom();
                      })}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening && listeningField === 'grower' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-[#00FFD1]'}`}
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CURATED DISCOVERY SECTION */}
          <div className="space-y-6">

            {/* ROW 1: SCENARIOS */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center pr-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A24D]">Select Scenario</h3>
                <span className="text-[8px] text-white/20 uppercase tracking-widest">Swipe Left</span>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-6 px-6 no-scrollbar">
                {BLEND_SCENARIOS.map((scenario: BlendScenario, idx: number) => (
                  <CardShell
                    as="button"
                    key={scenario.id}
                    color={scenario.visualProfile.color}
                    onClick={() => {
                      setMode('describe');
                      setDescription(scenario.inputText);
                      scrollToBottom();
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + (idx * 0.1),
                      duration: 0.8,
                    }}
                    className="snap-center shrink-0 w-[85%] !p-0"
                    style={{ minHeight: '140px' }}
                  >
                    <div className="p-5 h-full flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-light serif text-white mb-0.5">{scenario.title}</h4>
                        <p className="text-[9px] uppercase tracking-widest text-[#00FFD1] mb-3">{scenario.subtitle}</p>
                        <p className="text-xs text-white/50 italic leading-relaxed line-clamp-2">"{scenario.inputText}"</p>
                      </div>

                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-[#00FFD1]" />
                      </div>
                    </div>
                  </CardShell>
                ))}
              </div>
            </div>

            {/* ROW 2: PRESET STACKS (The "Novel Idea") */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center pr-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A24D]">Curated Stacks</h3>
                <button
                  onClick={onBrowsePresets}
                  className="text-[8px] text-[#00FFD1] uppercase tracking-widest hover:underline"
                >
                  See All
                </button>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-6 px-6 no-scrollbar">
                {PRESET_STACKS.slice(0, 4).map((stack: any, idx: number) => (
                  <CardShell
                    as="button"
                    key={stack.id}
                    color={stack.visualProfile.color}
                    onClick={() => {
                      onSelectPreset(stack);
                      scrollToBottom();
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + (idx * 0.1),
                      duration: 0.8,
                    }}
                    className="snap-center shrink-0 w-[75%] !p-0"
                    style={{ minHeight: '120px' }}
                  >
                    <div className="p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${stack.visualProfile.color}20`, border: `1px solid ${stack.visualProfile.color}40` }}
                        >
                          <Layers size={18} style={{ color: stack.visualProfile.color }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white mb-0.5 serif">{stack.title || stack.name}</h4>
                          <p className="text-[8px] text-white/40 leading-relaxed line-clamp-2">{stack.subtitle || stack.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 overflow-hidden">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-4 h-4 rounded-full border border-black bg-white/10 shadow-sm" />
                          ))}
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-white/30">Layered Protocol</span>
                      </div>
                    </div>
                  </CardShell>
                ))}
              </div>
            </div>
          </div>
          <div ref={bottomRef} className="h-px w-full" />
        </div>
      </div>

      {/* --- FOOTER (Fixed) --- */}
      <div className="flex-shrink-0 px-6 pb-safe-footer bg-gradient-to-t from-black via-black/80 to-transparent pt-4">
        <motion.button
          layout
          initial={false}
          animate={{
            y: canSubmit() ? 0 : 80,
            scale: canSubmit() ? 1 : 0.9,
            opacity: canSubmit() ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-2xl ${canSubmit()
            ? "bg-gradient-to-r from-[#00FFD1] to-[#00E0B8] text-black shadow-[#00FFD1]/40 active:scale-95 hover:scale-[1.02]"
            : "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
            }`}
        >
          Generate Recommendation
        </motion.button>
        <p className="text-center text-[7px] text-white/10 uppercase tracking-widest mt-4 pb-2">
          Deterministic Engine v9.9 (DUAL-DISCOVERY) • Verified Lab Data Only
        </p>
      </div>

      <AnimatePresence>
        {showCamera && (
          <CameraModal
            onClose={() => setShowCamera(false)}
            onCapture={handleCapture}
          />
        )}
      </AnimatePresence>
    </div>
  );
}