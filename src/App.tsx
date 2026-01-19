import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';
import { EntryGate } from './components/EntryGate';
import { InputScreen } from './components/InputScreen';
import { ResolvingScreen } from './components/ResolvingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SharedResultScreen } from './components/SharedResultScreen';
import { PresetStacks } from './components/PresetStacks';
import { StackDetailScreen } from './components/StackDetailScreen';
import { CalculatorModal } from './components/CalculatorModal';
import { QRShareModal } from './components/QRShareModal';
import { RemoteAccessPreview } from './components/RemoteAccessPreview';
import { StrainLibraryScreen } from './components/StrainLibraryScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { processIntent } from './lib/llmOrchestrator';
import { adaptEngineResult } from './lib/adaptEngineResult';
import { SharedBlendService } from './services/SharedBlendService';
import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends';
import { IntentSeed, UIStackRecommendation, UIBlendRecommendation, OutcomeExemplar } from './types/domain';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail' | 'library' | 'error' | 'shared' | 'remote-access';

export default function App() {
  // ROUTING / INITIALIZATION
  const [showSplash, setShowSplash] = useState(() => {
    if (window.location.pathname.includes('/preview') || window.location.search.includes('view=remote-access')) {
      return false;
    }
    return true;
  });

  const [showEntryGate, setShowEntryGate] = useState(() => {
    if (window.location.pathname.includes('/preview') || window.location.search.includes('view=remote-access')) {
      return false;
    }
    return true;
  });

  const [mode, setMode] = useState<'user' | 'admin'>('user');

  const [view, setView] = useState<ViewState>(() => {
    // Check for public routes
    if (window.location.pathname.includes('/preview') || window.location.search.includes('view=remote-access')) {
      return 'remote-access';
    }
    return 'splash';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Input State
  const [userInput, setUserInput] = useState<IntentSeed | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  // SPLIT STATE (Strict Firewall)
  const [stackRec, setStackRec] = useState<UIStackRecommendation | null>(null);
  const [blendRecs, setBlendRecs] = useState<(UIBlendRecommendation | UIStackRecommendation)[]>([]); // Array logic

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
    setBlendRecs([]); // Clear previous
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
    setBlendRecs([]);

    if (exemplar.kind === 'stack') {
      setStackRec(exemplar.data);
      setBlendRecs([]);
      setView('stack-detail');
    } else {
      // Fallback for static blends if exists
      setBlendRecs([exemplar.data]);
      setIsAnalyzing(false);
      setView('results');
    }
  };

  const handleCloseDetail = () => {
    if (view === 'stack-detail' && blendRecs.length > 0 && !stackRec) {
      // If we were looking at a stack detail popped from results, go back to results
      setView('results');
    } else {
      // Deep reset
      setView('input');
      setStackRec(null);
      setBlendRecs([]);
      setUserInput(null);
    }
  };

  // ASYNC ORCHESTRATION EFFECT
  // --- ROUTING / SHARING LOGIC ---
  useEffect(() => {
    // 1. Check for Share ID
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('s');

    // 2. Check for Remote Access Preview
    const isRemotePreview = window.location.pathname.includes('/preview') || params.get('mode') === 'preview';

    if (isRemotePreview) {
      console.log('[App] Entering Remote Access Preview Mode');
      setView('remote-access');
    } else if (shareId) {
      console.log(`[App] Detected Share ID: ${shareId}`);
      setIsAnalyzing(true); // Re-use loading state momentarily

      SharedBlendService.resolveShare(shareId)
        .then(record => {
          if (record) {
            console.log('[App] Resolved Share:', record);
            setBlendRecs([record.blend]); // Wrap in array
            setView('shared'); // New View State
          } else {
            console.error('[App] Share ID not found/expired');
            setView('input'); // Fallback
          }
        })
        .catch(err => {
          console.error('[App] Share Resolution Error', err);
          setView('input');
        })
        .finally(() => setIsAnalyzing(false));
    }
  }, []); // Run once on mount

  // --- ENGINE ORCHESTRATION ---
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
            console.log('DEBUG: Engine Result Raw', result.data[0]);
            const adapted = adaptEngineResult(result.data[0]);

            if (adapted) {
              setBlendRecs(Array.isArray(adapted) ? adapted : [adapted]);
              // State update triggers ResolvingScreen transition logic via isAnalyzing -> false
              // but we need to wait for ResolvingScreen to finish its animation if we are managing it there.
              // Actually here we just stop analyzing, the ResolvingScreen listens to blendRec presence?
              // Let's check handleResolvingComplete.
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
          setErrorMessage(e.message || 'Analysis Failed');
          setView('error');
        }
      };

      run();
    }
  }, [view, userInput, isAnalyzing]);

  // ResolvingScreen onComplete trigger
  const handleResolvingComplete = () => {
    if (blendRecs.length > 0) setView('results');
    else if (stackRec) setView('stack-detail'); // Rare fallback
  };

  const handleCalculate = () => {
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    setView('input');
    setStackRec(null);
    setBlendRecs([]); // Fixed
    setUserInput(null);
    setIsAnalyzing(false);
  };

  const handleRecalculateWithFeedback = (feedback: string) => {
    // Re-run the engine with the feedback as the new intent
    // We prepend "Refinement:" to help the LLM understand context if needed
    setView('resolving');
    setUserInput({ kind: 'blend', text: `Refinement: ${feedback}`, mode: 'engine' });
    setIsAnalyzing(true);
    // Note: In a real persistent app, we'd merge feedback with original intent.
    // For this V2, treating feedback as a fresh refinement intent works well.
  };

  return (
    <div className="dark min-h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black flex flex-col supports-[min-height:100dvh]:min-h-[100dvh]">

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-[#7C3AED]/80 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[60%] bg-[#059669]/80 rounded-full blur-[100px] animate-pulse-slow delay-700" />
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
                recommendation={blendRecs[0] || stackRec as any}
                onComplete={handleResolvingComplete}
                onRecalculate={handleRecalculateWithFeedback}
              />
            )}

            {/* RESULTS SCREEN (Blends Only) */}
            {view === 'results' && blendRecs.length > 0 && (
              <ResultsScreen
                recommendations={blendRecs as UIBlendRecommendation[]}
                onCalculate={handleCalculate}
                onBack={handleBack}
                onShare={(rec) => setQRShareOpen(true)}
              />
            )}

            {/* SHARED READ-ONLY VIEW */}
            {view === 'shared' && blendRecs.length > 0 && blendRecs[0].kind === 'blend' && (
              <SharedResultScreen recommendation={blendRecs[0] as UIBlendRecommendation} />
            )}

            {/* REMOTE ACCESS PREVIEW (Customer Demo) */}
            {view === 'remote-access' && (
              <RemoteAccessPreview />
            )}

            {/* STACK DETAIL (Stacks Only) - Prompt D */}
            {/* Logic: If explicitly in stack-detail view, OR if in results view but we have a stack result */}
            {((view === 'stack-detail' && stackRec) || (view === 'results' && blendRecs.length > 0 && blendRecs[0].kind === 'stack')) && (
              <StackDetailScreen
                stack={(stackRec || blendRecs[0]) as UIStackRecommendation}
                onBack={() => {
                  // Back logic
                  if (view === 'results') setView('input');
                  else setView('presets');
                }}
              />
            )}
// ...
            {/* Components */}
            {(calculatorOpen && (stackRec || (blendRecs.length > 0 ? blendRecs[0] : null))) && (
              <CalculatorModal
                recommendation={(stackRec || blendRecs[0])!}
                onClose={() => setCalculatorOpen(false)}
              />
            )}

            {/* QR SHARE - Blend Only (Prompt E) */}
            {qrShareOpen && blendRecs.length > 0 && blendRecs[0].kind === 'blend' && (
              <QRShareModal
                recommendation={blendRecs[0] as UIBlendRecommendation}
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

      {/* GLOBAL FOOTER (TM) - Discreet */}
      <div className="absolute bottom-1 right-2 z-50 pointer-events-none mix-blend-plus-lighter opacity-30">
        <p className="text-[8px] text-white font-light tracking-wide text-right leading-none">
          © 2026 Guided Outcomes<span className="text-[6px] align-top">™</span> · StrainMath<span className="text-[6px] align-top">™</span><br />
          All proprietary protocols & calculations.
        </p>
      </div>

    </div>
  );
}
