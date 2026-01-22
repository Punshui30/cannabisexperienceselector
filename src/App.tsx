// [BUILD-ID: 2026-01-22-v8]
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
import { BlendDetailScreen } from './components/BlendDetailScreen';
import { CalculatorModal } from './components/CalculatorModal';
import { QRShareModal } from './components/QRShareModal';
import { RemoteAccessPreview } from './components/RemoteAccessPreview';
import { StrainLibraryScreen } from './components/StrainLibraryScreen';
import { LiveConsultant } from './components/LiveConsultant';
import { AdminPanel } from './components/admin/AdminPanel';
import { LiveExperienceFeed } from './components/LiveExperienceFeed';
import { LiveNetworkDrawer } from './components/LiveNetworkDrawer';
import { Intelligence } from './lib/merchantIntelligence';
import { GlobalCultivarProvider } from './context/GlobalCultivarContext';
import { Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { processIntent, OrchestratorResult } from './lib/llmOrchestrator';
import { adaptEngineResult } from './lib/adaptEngineResult';
import { SharedBlendService } from './services/SharedBlendService';
import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends';
import { IntentSeed, UIStackRecommendation, UIBlendRecommendation, OutcomeExemplar, EngineResult } from './types/domain';
import logoImg from './assets/logo.png';
import { generateLiveFeedCommentary } from './lib/llmLiveFeedAdapter';
import { updateEngineSnapshot } from './lib/engineSnapshot';
import { ScrollStage } from './components/layout/ScrollStage';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail' | 'blend-detail' | 'library' | 'error' | 'shared' | 'remote-access' | 'live-feed';

export default function App() {
  // Mobile layout contract:
  // 360px width is the minimum supported device (Moto G).
  // All UI must collapse, scroll, or sequence to fit.
  // No component may assume available vertical height.
  // Bottom UI must reserved space (pb-safe-footer).

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
  const [showConsultant, setShowConsultant] = useState(false);

  // Input State
  const [userInput, setUserInput] = useState<IntentSeed | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  // SPLIT STATE (Strict Firewall)
  const [stackRec, setStackRec] = useState<UIStackRecommendation | null>(null);
  const [blendRecs, setBlendRecs] = useState<(UIBlendRecommendation | UIStackRecommendation)[]>([]); // Array logic
  const [selectedBlendId, setSelectedBlendId] = useState<string | null>(null);

  // DERIVED STATE: Active blend resolved from ID (Single Source of Truth)
  const activeBlend = (blendRecs.find(b => b.id === selectedBlendId) as UIBlendRecommendation) || null;

  // Shared UI State
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [qrShareOpen, setQRShareOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consultantText, setConsultantText] = useState<string | undefined>(undefined);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLog(prev => [...prev.slice(-5), `${new Date().toLocaleTimeString()}: ${msg}`]);
    console.log(`[App_V8.3] ${msg}`);
  };

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
    setAnalysisProgress(20); // Milestone: Intent received
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
        addLog('Invoking Orchestrator...');
        setAnalysisProgress(30);

        // Simulated progress increments for better UX
        const progressInterval = setInterval(() => {
          setAnalysisProgress(prev => {
            if (prev < 85) return prev + 2;
            return prev;
          });
        }, 200);

        try {
          // HEARTBEAT TIMER
          const heartbeat = setInterval(() => {
            addLog('Waiting for Engine...');
          }, 3000);

          // TIMEOUT GUARD: 15 seconds max
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Engine Hard Timeout (15s)")), 15000)
          );

          setAnalysisProgress(50);
          const result = (await Promise.race([
            processIntent(userInput),
            timeoutPromise
          ])) as OrchestratorResult;

          clearInterval(heartbeat);
          clearInterval(progressInterval);

          if (result.success) {
            if (result.data.length > 0) {
              addLog('Success: Results Ready');
              setAnalysisProgress(90);
              setBlendRecs(result.data.map((item: EngineResult) => adaptEngineResult(item)).filter(Boolean) as any);
              setAnalysisProgress(100);
              setIsAnalyzing(false);
            } else {
              addLog('Success: Chat Only');
              setAnalysisProgress(100);
              setIsAnalyzing(false);
              setView('input');
            }
          } else {
            throw new Error(result.error || 'Orchestrator returned failure');
          }
        } catch (e: any) {
          addLog(`ERROR: ${e.message}`);
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
    console.log('[App] handleResolvingComplete called', { blendRecsLength: blendRecs.length, hasStackRec: !!stackRec });
    if (blendRecs.length > 0) {
      setAnalysisProgress(100); // Milestone: Transition triggered
      setView('results');
    } else if (stackRec) {
      setAnalysisProgress(100);
      setView('stack-detail'); // Rare fallback
    } else {
      console.warn('[App] ResolvingComplete called but no results available - staying on resolving screen');
      // Don't transition if we don't have results yet
    }
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
    setAnalysisProgress(0); // Reset progress
  };

  const handleRecalculateWithFeedback = (feedback: string) => {
    // Re-run the engine with the feedback as the new intent
    // We prepend "Refinement:" to help the LLM understand context if needed
    setView('resolving');
    setUserInput({ kind: 'blend', text: `Refinement: ${feedback}`, mode: 'engine' });
    setIsAnalyzing(true);
    setAnalysisProgress(20); // Reset to intent received
    // Note: In a real persistent app, we'd merge feedback with original intent.
    // For this V2, treating feedback as a fresh refinement intent works well.
  };

  return (
    <GlobalCultivarProvider>
      {/* STRICT APP SHELL ROOT: h-[100dvh], overflow-hidden */}
      <div className="dark h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black flex flex-col">

        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-[#7C3AED]/80 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[60%] bg-[#059669]/80 rounded-full blur-[100px] animate-pulse-slow delay-700" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </div>

        {/* SCROLL STAGE - The Single Scroll Authority */}
        <ScrollStage>
          {/* Main Content Area - Expands naturally */}
          <main className="relative z-10 w-full min-h-full flex flex-col justify-center">
            {showSplash && (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            )}

            {showEntryGate ? (
              <EntryGate
                onEnterUser={handleEnterUser}
                onEnterAdmin={handleEnterAdmin}
                onEnterFeed={() => {
                  setShowEntryGate(false);
                  setView('live-feed');
                }}
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

                {/* PRESET STACKS BROWSER */}
                {view === 'presets' && (
                  <PresetStacks
                    onBack={() => setView('input')}
                    onSelect={(exemplar) => {
                      if (exemplar.kind === 'stack') {
                        setStackRec(exemplar.data as UIStackRecommendation);
                        setView('stack-detail');
                      } else {
                        console.log('Blend preset selected:', exemplar);
                      }
                    }}
                  />
                )}

                {/* STRAIN LIBRARY */}
                {view === 'library' && (
                  <StrainLibraryScreen onBack={() => setView('input')} />
                )}

                {/* RESOLVING SCREEN - Waits for Data */}
                {view === 'resolving' && userInput && (
                  <ResolvingScreen
                    input={userInput}
                    recommendation={blendRecs[0] || stackRec as any}
                    consultantText={consultantText}
                    progress={analysisProgress}
                    onComplete={handleResolvingComplete}
                    onRecalculate={handleRecalculateWithFeedback}
                  />
                )}

                {/* RESULTS SCREEN (Blends Only) */}
                {view === 'results' && blendRecs.length > 0 && (
                  <ResultsScreen
                    key={blendRecs[0]?.id} // FORCE REMOUNT on new results to trigger entry animation
                    recommendations={blendRecs as UIBlendRecommendation[]}
                    onCalculate={handleCalculate}
                    onBack={handleBack}
                    onShare={(rec) => setQRShareOpen(true)}
                    onViewDetail={(blend) => {
                      setSelectedBlendId(blend.id);
                      setView('blend-detail');
                    }}
                    onOpenConsultant={() => setShowConsultant(true)}
                  />
                )}
                <div className="fixed bottom-2 right-2 text-[8px] text-white/20 pointer-events-none flex flex-col items-end gap-1">
                  <span>v9.9 (DUAL-DISCOVERY)</span>
                  {debugLog.map((l, i) => <span key={i} className="opacity-50">{l}</span>)}
                </div>


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

                {/* BLEND DETAIL (Blends Only) */}
                {view === 'blend-detail' && activeBlend && (
                  <BlendDetailScreen
                    blend={activeBlend}
                    onBack={() => { setSelectedBlendId(null); setView('results'); }}
                  />
                )}

                {/* LIVE EXPERIENCE FEED */}
                {view === 'live-feed' && (
                  <LiveExperienceFeed
                    onBack={() => {
                      setShowEntryGate(true); // Return to gate
                      setView('splash'); // or just gate logic, but keeping state clean
                    }}
                  />
                )}

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
                    className="fixed top-6 left-6 z-40 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors backdrop-blur-md"
                  >
                    Strain Lib
                  </button>
                )}
              </>
            )}

            {/* LIVE CONSULTANT OVERLAY (Ensured Top Layer) */}
            <AnimatePresence>
              {showConsultant && (
                <div className="relative z-[100]">
                  <LiveConsultant
                    consultantText={consultantText}
                    context={{
                      screen: view,
                      recommendation:
                        (view === 'blend-detail' && activeBlend) ? activeBlend :
                          (view === 'stack-detail' && (stackRec || (blendRecs[0]?.kind === 'stack' ? blendRecs[0] : undefined))) ? (stackRec || blendRecs[1]) :
                            (blendRecs.length > 0 ? blendRecs[0] : (stackRec || undefined)),
                      userInput: userInput?.text
                    }}
                    onApplyResult={(newResults: any[]) => {
                      addLog("Assistant: Reconfiguring Engine...");
                      const adaptedSet = newResults
                        .map(r => adaptEngineResult(r))
                        .filter(Boolean) as (UIBlendRecommendation | UIStackRecommendation)[];

                      if (adaptedSet.length > 0) {
                        setBlendRecs(adaptedSet);
                        setView('results'); // Force transition to see the new blends
                        setShowConsultant(false); // Close assistant to show results
                      }
                    }}
                    onClose={() => setShowConsultant(false)}
                    isGenerating={isAnalyzing}
                  />
                </div>
              )}
            </AnimatePresence>
          </main>
        </ScrollStage>

        {!showSplash && !showEntryGate && view !== 'live-feed' && <LiveNetworkDrawer />}

        {!showSplash && !showEntryGate && mode !== 'admin' && view !== 'live-feed' && (
          <>
            {/* Admin Toggle (Hidden Corner) */}
            <button
              onClick={() => setMode('admin')}
              className="fixed bottom-4 left-4 z-40 p-2 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white/60 hover:bg-white/10 transition-all opacity-0 hover:opacity-100"
              title="Admin Panel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>

            {/* LIVE CONSULTANT TRIGGER FAB (Ensured Top Level) */}
            <button
              onClick={() => {
                if (!isAnalyzing) setShowConsultant(true);
              }}
              disabled={isAnalyzing}
              className={`fixed bottom-6 right-6 z-[101] group flex items-center justify-center w-12 h-12 rounded-full bg-[#00FFD1] text-black shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all duration-300 
                  ${isAnalyzing ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-110 hover:shadow-[0_0_30px_rgba(0,255,209,0.5)]'}
                  max-[360px]:bottom-20 max-[360px]:right-4
              `}
              title={isAnalyzing ? "System Processing..." : "Ask AI Consultant"}
            >
              <Sparkles size={20} className={`transition-transform ${!isAnalyzing && 'group-hover:rotate-12'}`} />
              {!isAnalyzing && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              )}
            </button>
          </>
        )}

        {/* GLOBAL FOOTER (TM) - Discreet */}
        <div className="absolute bottom-1 right-2 z-50 pointer-events-none mix-blend-plus-lighter opacity-30">
          <p className="text-[8px] text-white font-light tracking-wide text-right leading-none">
            © 2026 Guided Outcomes<span className="text-[6px] align-top">™</span> · StrainMath<span className="text-[6px] align-top">™</span><br />
            All proprietary protocols & calculations.
          </p>
        </div>

      </div>
    </GlobalCultivarProvider>
  );
}
