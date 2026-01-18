import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';
import { EntryGate } from './components/EntryGate';
import { InputScreen } from './components/InputScreen';
import { ResolvingScreen } from './components/ResolvingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PresetStacks } from './components/PresetStacks';
import { StackDetailScreen } from './components/StackDetailScreen';
import { CalculatorModal } from './components/CalculatorModal';
import { QRShareModal } from './components/QRShareModal';
import { StrainLibraryScreen } from './components/StrainLibraryScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { processIntent } from './lib/llmOrchestrator';
import { adaptEngineResult } from './lib/adaptEngineResult';
import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends';
import { IntentSeed, UIStackRecommendation, UIBlendRecommendation, OutcomeExemplar } from './types/domain';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail' | 'library';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true);

  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<ViewState>('splash');

  // Input State
  const [userInput, setUserInput] = useState<IntentSeed | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  // SPLIT STATE (Strict Firewall)
  const [stackRec, setStackRec] = useState<UIStackRecommendation | null>(null);
  const [blendRec, setBlendRec] = useState<UIBlendRecommendation | null>(null);

  // Shared UI State
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [qrShareOpen, setQRShareOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Navigation Handlers
  const handleEnterUser = () => {
    setMode('user');
    setShowEntryGate(false);
    setView('input');
  };

  const handleEnterAdmin = () => {
    setMode('admin');
    setShowEntryGate(false);
    setView('input');
  };

  const handleSubmit = (input: IntentSeed) => {
    console.log('TRANSITION: Input -> Resolving (Engine Start)');
    setStackRec(null);
    setBlendRec(null);
    setUserInput(input);
    setIsAnalyzing(true);
    setView('resolving');
  };

  const handleSelectPreset = (exemplar: OutcomeExemplar | BlendScenario) => {
    // 1. BLEND SCENARIO (Engine Flow)
    if ('inputText' in exemplar) {
      console.log('TRANSITION: Blend Scenario -> Input Pre-fill');
      setInitialInputText(exemplar.inputText);

      // Strict IntentSeed Construction (Prompt A)
      const seed: IntentSeed = {
        text: exemplar.inputText,
        kind: 'blend',
        mode: 'engine',
        image: undefined
      };
      handleSubmit(seed);
      return;
    }

    // 2. STACK PRESET (Direct Flow - No Engine)
    console.log(`TRANSITION: Stack Preset -> Detail`);
    setUserInput(null);
    setBlendRec(null);

    if (exemplar.kind === 'stack') {
      setStackRec(exemplar.data);
      setIsAnalyzing(false);
      setView('stack-detail');
    } else {
      // Fallback for static blends if exists
      setBlendRec(exemplar.data);
      setIsAnalyzing(false);
      setView('results');
    }
  };

  // ASYNC ORCHESTRATION EFFECT
  useEffect(() => {
    if (view === 'resolving' && userInput && isAnalyzing) {

      // Firewall: Preset inputs should likely not be here unless 'engine' mode
      if (userInput.mode === 'preset') {
        setIsAnalyzing(false);
        return;
      }

      const run = async () => {
        console.log('APP: Invoking Orchestrator...');
        try {
          const result = await processIntent(userInput, 'blend-engine');

          if (result.success && result.data.length > 0) {

            // Adapter Strategy (Prompt B)
            // Always adapt first result for Blend Flow
            const adapted = adaptEngineResult(result.data[0]);

            if (adapted) {
              setBlendRec(adapted);
              setIsAnalyzing(false);
            } else {
              throw new Error("Adapter returned null result");
            }
          } else {
            throw new Error(result.error || 'Orchestrator returned failure');
          }
        } catch (e: any) {
          console.error('APP: Orchestrator Failed', e);
          setIsAnalyzing(false);
          alert(`Analysis failed: ${e.message}`);
          setView('input');
        }
      };

      run();
    }
  }, [view, userInput, isAnalyzing]);

  // ResolvingScreen onComplete trigger
  const handleResolvingComplete = () => {
    if (blendRec) setView('results');
    else if (stackRec) setView('stack-detail'); // Rare fallback
  };

  const handleCalculate = () => {
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    setView('input');
    setStackRec(null);
    setBlendRec(null);
    setUserInput(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="dark min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[60%] bg-[#7C3AED]/60 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#059669]/60 rounded-full blur-[100px] animate-pulse-slow delay-700" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <main className="relative z-10 w-full flex-grow flex flex-col justify-center">
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}

        {showEntryGate ? (
          <EntryGate
            onEnterUser={handleEnterUser}
            onEnterAdmin={handleEnterAdmin}
          />
        ) : mode === 'admin' ? (
          <>
            <AdminPanel
              onExitAdmin={() => setMode('user')}
              onEnterDemoMode={() => setView('input')}
            />
          </>
        ) : (
          <>
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4 pointer-events-none"
                >
                  <div className="w-12 h-12 border-2 border-[#00FFD1] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#00FFD1] text-xs uppercase tracking-widest font-bold animate-pulse">Analyzing Pattern...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {view === 'input' && (
              <InputScreen
                onSubmit={handleSubmit}
                onBrowsePresets={() => setView('presets')}
                onSelectPreset={handleSelectPreset}
                onAdminModeToggle={() => setMode('admin')}
                isAdminMode={false}
                initialText={initialInputText}
              />
            )}

            {/* RESOLVING SCREEN - Waits for Data */}
            {view === 'resolving' && userInput && (
              <ResolvingScreen
                input={userInput}
                recommendation={blendRec || stackRec as any}
                onComplete={handleResolvingComplete}
              />
            )}

            {/* RESULTS SCREEN (Blends Only) */}
            {view === 'results' && blendRec && (
              <ResultsScreen
                recommendations={[blendRec]} // Array expected by ResultsScreen
                onCalculate={handleCalculate}
                onBack={handleBack}
                onShare={(rec) => setQRShareOpen(true)}
              />
            )}

            {/* STACK DETAIL (Stacks Only) - Prompt D */}
            {(view === 'stack-detail' || (view === 'results' && stackRec)) && stackRec && (
              <StackDetailScreen
                stack={stackRec}
                onBack={() => {
                  // Back logic
                  if (view === 'results') setView('input');
                  else setView('presets');
                }}
              />
            )}

            {view === 'presets' && (
              <PresetStacks
                onBack={() => setView('input')}
                onSelect={handleSelectPreset}
              />
            )}

            {view === 'library' && (
              <StrainLibraryScreen onBack={() => setView('input')} />
            )}

            {/* Components */}
            {(calculatorOpen && (stackRec || blendRec)) && (
              <CalculatorModal
                recommendation={(stackRec || blendRec)!}
                onClose={() => setCalculatorOpen(false)}
              />
            )}

            {/* QR SHARE - Blend Only (Prompt E) */}
            {qrShareOpen && blendRec && (
              <QRShareModal
                recommendation={blendRec}
                onClose={() => setQRShareOpen(false)}
              />
            )}

            {view === 'input' && (
              <button
                onClick={() => setView('library')}
                className="fixed top-6 right-6 z-40 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors"
              >
                Strain Lib
              </button>
            )}
          </>
        )}
      </main>

      {!showSplash && !showEntryGate && mode !== 'admin' && (
        <button
          onClick={() => setMode('admin')}
          className="fixed bottom-4 left-4 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white/60 hover:bg-white/10 transition-all opacity-0 hover:opacity-100"
          title="Admin Panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </button>
      )}

    </div>
  );
}
