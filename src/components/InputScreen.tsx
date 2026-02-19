import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Camera, Search, Check, Upload, Layers, ChevronRight, X, Sparkles } from 'lucide-react';
import { IntentSeed as UserInput, OutcomeExemplar } from '../types/domain';
import { BLEND_SCENARIOS, BlendScenario } from '../data/presetBlends';
import { PRESET_STACKS } from '../data/presetStacks';
import { CameraModal } from './CameraModal';
import { startListening } from '../lib/speech';
import { CardShell } from './CardShell';
import { AI_CONFIG } from '../ai/config';
import { SessionMemoryStore } from '../lib/memory/sessionMemory';
import { DEMO_PROFILES, DemoProfile } from '../data/demoProfiles';
import { GuidedOutcomeWizard } from './GuidedOutcomeWizard';

// Enable vision/camera functionality
const VISION_ENABLED = true;

interface InputScreenProps {
  onSubmit: (input: UserInput) => void;
  onBrowsePresets: () => void;
  onSelectExemplar?: (exemplar: OutcomeExemplar) => void;
  onSelectPreset: (exemplar: OutcomeExemplar | BlendScenario) => void;
  onAdminModeToggle: () => void;
  isAdminMode: boolean;
  initialText?: string;
}

import logoImg from '../assets/logo.png';

// --- DESIGN TOKENS ---
const GLASS_INPUT = "w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FFD1]/50 transition-colors text-sm";
const TAB_ACTIVE = "bg-[#00FFD1] text-black shadow-lg shadow-[#00FFD1]/10";
const TAB_INACTIVE = "text-white/40 hover:text-white hover:bg-white/5";

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

export function InputScreen({ onSubmit, onBrowsePresets, onSelectExemplar, onSelectPreset, onAdminModeToggle, isAdminMode, initialText }: InputScreenProps) {
  // Available input modes (filtered by feature flags)
  const AVAILABLE_MODES = ['describe', 'strain', ...(VISION_ENABLED ? ['product'] : [])] as const;
  type AvailableMode = typeof AVAILABLE_MODES[number];

  const [mode, setMode] = useState<AvailableMode>('describe');
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

  // --- IDLE HELPER STATE ---
  const [isIdle, setIsIdle] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [idleDismissed, setIdleDismissed] = useState(() => {
    return sessionStorage.getItem('cas_idle_helper_dismissed') === 'true';
  });

  // --- DEMO MODE STATE ---
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Basic idle helper logic: Reset on activity, trigger after delay
    if (idleDismissed || showWizard || description.length > 0) return;

    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), AI_CONFIG.idleHelper.delayMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    timer = setTimeout(() => setIsIdle(true), AI_CONFIG.idleHelper.delayMs);

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [idleDismissed, showWizard, description]);

  const handleDismissIdle = () => {
    setIsIdle(false);
    setIdleDismissed(true);
    sessionStorage.setItem('cas_idle_helper_dismissed', 'true');
  };

  const handleSwitchProfile = (profile: DemoProfile) => {
    setActiveProfileId(profile.id);
    SessionMemoryStore.set(profile.memory);
    console.log(`[DEMO_MODE] Loaded profile: ${profile.name}`);
  };

  const handleCapture = (blob: Blob) => {
    const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
    setUploadedImage(file);
    setShowCamera(false);
  };

  const canSubmit = () => {
    if (mode === 'describe') return description.length > 2;
    if (mode === 'product') return !!uploadedImage;
    if (mode === 'strain') return strainName.length > 2;
    return false;
  };


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

    // Detect stack vs blend based on temporal keywords
    const text = mode === 'describe'
      ? description
      : mode === 'strain'
        ? `${strainName}${growerName ? ' by ' + growerName : ''}`.trim()
        : "Product Image Input";

    // Temporal keywords that indicate multi-phase stack protocols
    const temporalKeywords = [
      'then', 'after', 'followed by', 'later', 'secondly',
      'morning', 'night', 'evening', 'day', 'start', 'end',
      'wind down', 'winding down', 'transition', 'phase',
      'first', 'next', 'finally', 'throughout'
    ];

    const lowerText = text.toLowerCase();
    const isStackRequest = temporalKeywords.some(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lowerText);
    });

    const input: UserInput = {
      kind: isStackRequest ? 'stack' : 'blend',
      mode: mode === 'strain' ? 'strain' : 'engine',
      text,
      image: mode === 'product' && uploadedImage ? URL.createObjectURL(uploadedImage) : undefined,
      strainName: mode === 'strain' ? strainName : undefined,
      grower: mode === 'strain' ? growerName : undefined
    };

    console.log('[InputScreen] Detected kind:', input.kind, 'for query:', text.substring(0, 50));
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
    <>
      {/* FLOATING BACKGROUND ORBS (Premium Glassmorphism Foundation) */}
      <MotionDiv
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
      <MotionDiv
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

      <div className="w-full h-full flex flex-col relative z-10 text-white overflow-hidden">

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
              <h2 className="text-xl text-white font-light serif tracking-tight">How do you want to feel?</h2>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium mt-0.5">
                Describe your goal or pick a curated path
              </p>
            </div>

            {/* Tabs - Compact UI */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mt-4 max-w-sm w-[90vw] mx-auto">
              {AVAILABLE_MODES.map((t) => (
                <button
                  key={t}
                  onClick={() => setMode(t)}
                  className={`flex-1 py-2 px-1 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${mode === t ? TAB_ACTIVE : TAB_INACTIVE}`}
                >
                  {t === 'describe' ? 'How you want to feel' : t === 'product' ? 'Photo Scan' : 'Strain Match'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- DEMO BAR --- */}
        {AI_CONFIG.features.demoMode && (
          <div className="flex-shrink-0 px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar bg-black/40 border-b border-white/5">
            <span className="text-[8px] font-bold text-[#00FFD1] uppercase tracking-widest whitespace-nowrap">Demo:</span>
            <button
              onClick={() => {
                setActiveProfileId(null);
                SessionMemoryStore.clear();
              }}
              className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${!activeProfileId ? 'bg-[#00FFD1] text-black shadow-lg shadow-[#00FFD1]/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
            >
              Live
            </button>
            {DEMO_PROFILES.map(p => (
              <button
                key={p.id}
                onClick={() => handleSwitchProfile(p)}
                className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all whitespace-nowrap ${activeProfileId === p.id ? 'bg-[#00FFD1] text-black shadow-lg shadow-[#00FFD1]/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32">
          <div className="px-6 space-y-5 py-2">

            {/* INPUT AREA */}
            <AnimatePresence mode="wait">
              <MotionDiv
                key={mode}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full"
              >
                {mode === 'describe' && (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={placeholderText}
                      className={`${GLASS_INPUT} h-28 resize-none transition-all placeholder:text-white/20 px-5 py-4 pr-5 leading-relaxed text-sm`}
                    />
                    {/* Visible voice button row */}
                    <button
                      onClick={handleMicClick}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest
                        ${isListening && listeningField === 'describe'
                          ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/30 hover:text-[#00FFD1]'
                        }`}
                    >
                      <Mic size={14} />
                      {isListening && listeningField === 'describe' ? 'Listening…' : 'Speak your intent'}
                    </button>
                  </div>
                )}

                {mode === 'product' && (
                  <div className="space-y-3">
                    {uploadedImage ? (
                      /* ── POST-CAPTURE STATE ── */
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-emerald-400/30 bg-black">
                        <img
                          src={URL.createObjectURL(uploadedImage)}
                          alt="Captured label"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                            ✓ Label Captured
                          </span>
                          <button
                            onClick={() => { setUploadedImage(null); setShowCamera(true); }}
                            className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-[10px] uppercase font-bold tracking-widest hover:bg-white/20 transition-all"
                          >
                            Re-scan
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── CAMERA LAUNCH ZONE ── */
                      <button
                        onClick={() => setShowCamera(true)}
                        className="relative w-full h-40 rounded-2xl border-2 border-dashed border-[#00FFD1]/30 bg-[#00FFD1]/5 hover:border-[#00FFD1]/60 hover:bg-[#00FFD1]/10 active:scale-[0.99] transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="p-4 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 group-hover:bg-[#00FFD1]/20 transition-all">
                          <Camera size={28} className="text-[#00FFD1]" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Open Camera</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Point at packaging · Works on Windows &amp; mobile</p>
                        </div>
                        {/* Subtle pulse ring */}
                        <div className="absolute inset-0 rounded-2xl border border-[#00FFD1]/10 animate-pulse pointer-events-none" />
                      </button>
                    )}
                    <p className="text-[10px] text-white/20 text-center px-4">
                      We'll read the label and match it to your library automatically.
                    </p>
                  </div>
                )}


                {mode === 'strain' && (
                  <div className="flex flex-col gap-3 relative">
                    <input
                      type="text"
                      value={strainName}
                      onChange={(e) => setStrainName(e.target.value)}
                      placeholder="Strain Name (e.g. Jack Herer)"
                      className={`${GLASS_INPUT} pr-20`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {!isAdminMode && (
                        <button
                          onClick={() => setShowCamera(true)}
                          className="p-2 rounded-full bg-white/10 text-white/30 hover:text-[#00FFD1] transition-all"
                        >
                          <Camera size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => startListening(t => setStrainName(t), (l) => {
                          setIsListening(l);
                          setListeningField(l ? 'strain' : null);
                          if (!l) scrollToBottom();
                        })}
                        className={`p-2 rounded-full transition-all ${isListening && listeningField === 'strain' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-[#00FFD1]'}`}
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
              </MotionDiv>
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
                          <p className="text-xs text-white/50 italic leading-relaxed line-clamp-3">"{scenario.inputText}"</p>
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
                            <p className="text-[8px] text-white/40 leading-relaxed line-clamp-3">{stack.subtitle || stack.description}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 overflow-hidden">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-4 h-4 rounded-full border border-black bg-white/10 shadow-sm" />
                            ))}
                          </div>
                          <span className="text-[8px] uppercase tracking-widest text-white/30">Layered Experience</span>
                        </div>
                      </div>
                    </CardShell>
                  ))}
                </div>
              </div>


              <div ref={bottomRef} className="h-px w-full" />
            </div>
          </div>

          {/* FLOATING ACTION BUTTON - Always Visible (Bottom Right) */}
          <MotionButton
            initial={false}
            animate={{
              scale: canSubmit() ? 1 : 0,
              opacity: canSubmit() ? 1 : 0,
              pointerEvents: canSubmit() ? 'auto' : 'none'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-full bg-gradient-to-br from-[#00FFD1] to-[#00E0B8] text-black shadow-[0_0_30px_rgba(0,255,209,0.4)] flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-0"
            style={{
              boxShadow: '0 8px 32px rgba(0, 255, 209, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span>Generate</span>
          </MotionButton>

          {VISION_ENABLED && (
            <AnimatePresence>
              {showCamera && (
                <CameraModal
                  onClose={() => setShowCamera(false)}
                  onCapture={handleCapture}
                />
              )}
            </AnimatePresence>
          )}

          {/* IDLE HELPER NUDGE */}
          <AnimatePresence mode="wait">
            {isIdle && !idleDismissed && !showWizard && (
              <MotionDiv
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed bottom-24 left-6 right-6 z-[60]"
              >
                <div className="bg-[#1A1A1A] border border-[#00FFD1]/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00FFD1]/20 flex items-center justify-center text-[#00FFD1]">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white mb-0.5">Need help choosing?</div>
                      <div className="text-[10px] text-white/40">Try our guided wizard</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDismissIdle}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      Not now
                    </button>
                    <button
                      onClick={() => {
                        setIsIdle(false);
                        setShowWizard(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#00FFD1] text-black text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-[#00FFD1]/20"
                    >
                      Guide Me
                    </button>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* GUIDED WIZARD MOUNT */}
          <AnimatePresence>
            {showWizard && (
              <GuidedOutcomeWizard
                onClose={() => setShowWizard(false)}
                onComplete={(intent) => {
                  setShowWizard(false);
                  onSubmit(intent);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}