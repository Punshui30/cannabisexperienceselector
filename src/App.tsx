/**
 * NAVIGATION POLICY
 * -----------------
 * The app MUST NOT automatically navigate due to:
 * - idle time
 * - engine timeouts
 * - empty state
 * - errors
 *
 * Only explicit user actions may change views.
 */
// [BUILD-ID: 2026-01-22-v10.6]
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
import { CheckoutScreen } from './components/CheckoutScreen';
import { ShareScreen } from './components/ShareScreen';
import { ResolutionScreen } from './components/ResolutionScreen';
import { StackCardView } from './components/StackCardView';
import { StrainLibraryScreen } from './components/StrainLibraryScreen';
import { ClarificationGate } from './components/ClarificationGate';
import { LiveConsultant } from './components/LiveConsultant';
import { AdminPanel } from './components/admin/AdminPanel';
import { LiveExperienceFeed } from './components/LiveExperienceFeed';
import { LiveNetworkDrawer } from './components/LiveNetworkDrawer';
import { CinematicBackground } from './components/CinematicBackground';
import { Intelligence } from './lib/merchantIntelligence';
import { GlobalCultivarProvider } from './context/GlobalCultivarContext';
import { Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { processIntent, OrchestratorResult } from './lib/llmOrchestrator';
import { adaptEngineResult } from './lib/adaptEngineResult';
import { SharedBlendService } from './services/SharedBlendService';
import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends';
import { IntentSeed, UIStackRecommendation, UIBlendRecommendation, OutcomeExemplar, EngineResult, EnginePhase } from './types/domain';
import { InvocationContext, createContextBoundFlags } from './types/context';
import logoImg from './assets/logo.png';
import { generateLiveFeedCommentary } from './lib/llmLiveFeedAdapter';
import { updateEngineSnapshot } from './lib/engineSnapshot';
import { ScrollStage } from './components/layout/ScrollStage';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'resolution' | 'results' | 'presets' | 'stack-detail' | 'stack-card' | 'blend-detail' | 'library' | 'error' | 'shared' | 'remote-access' | 'live-feed' | 'checkout' | 'share' | 'idle' | 'clarification-gate';

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
  const [consultantMode, setConsultantMode] = useState<'default' | 'clarification_required'>('default');

  // Input State
  const [userInput, setUserInput] = useState<IntentSeed | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  // SPLIT STATE (Strict Firewall)
  const [stackRec, setStackRec] = useState<UIStackRecommendation | null>(null);
  const [blendRecs, setBlendRecs] = useState<(UIBlendRecommendation | UIStackRecommendation)[]>([]); // Array logic
  const [selectedBlendId, setSelectedBlendId] = useState<string | null>(null);
  const [focusedStackId, setFocusedStackId] = useState<string | null>(null);
  const [activeStackId, setActiveStackId] = useState<string | null>(null);

  // DERIVED STATE: Active blend resolved from ID (Single Source of Truth)
  const activeBlend = (blendRecs.find(b => b.id === selectedBlendId) as UIBlendRecommendation) || null;

  // Shared UI State
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [qrShareOpen, setQRShareOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consultantText, setConsultantText] = useState<string | undefined>(undefined);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [enginePhase, setEnginePhase] = useState<EnginePhase>('idle');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isResolved, setIsResolved] = useState(false);

  // Single-shot result handoff guard
  const [hasNavigatedToResult, setHasNavigatedToResult] = useState(false);

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
    setErrorMessage(null);
    setStackRec(null);
    setBlendRecs([]); // Clear previous
    setHasNavigatedToResult(false); // Reset navigation guard for new session
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

    // 2. STACK PRESET (Intermediate Card View - No Engine)
    console.log(`TRANSITION: Stack Preset -> Card View`);
    setUserInput(null);
    setBlendRecs([]);

    if (exemplar.kind === 'stack') {
      console.log('[CLICK]', 'handleSelectPreset: STACK PRESET clicked', { id: exemplar.id });
      setStackRec(exemplar.data);
      setFocusedStackId(exemplar.id);
      setActiveStackId(null); // Rule: activeStackId remains null on entry
      setBlendRecs([]);
      setView('stack-card');
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
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Check for new session routes: /session/checkout/:id or /session/share/:id
    const sessionCheckoutMatch = pathname.match(/^\/session\/checkout\/([A-Z0-9]+)$/);
    const sessionShareMatch = pathname.match(/^\/session\/share\/([A-Z0-9]+)$/);

    // Legacy routes (for backward compatibility)
    const shareId = params.get('s');
    const checkoutId = params.get('checkout');
    const shareViewId = params.get('share');

    // Remote Access Preview
    const isRemotePreview = pathname.includes('/preview') || params.get('mode') === 'preview';

    if (isRemotePreview) {
      console.log('[App] Entering Remote Access Preview Mode');
      setView('remote-access');
    } else if (sessionCheckoutMatch) {
      const sessionId = sessionCheckoutMatch[1];
      console.log(`[App] Session Checkout Route: ${sessionId}`);
      setView('checkout');
    } else if (sessionShareMatch) {
      const sessionId = sessionShareMatch[1];
      console.log(`[App] Session Share Route: ${sessionId}`);
      setView('share');
    } else if (checkoutId) {
      console.log(`[App] Legacy Checkout Mode: ${checkoutId}`);
      setView('checkout');
    } else if (shareViewId) {
      console.log(`[App] Legacy Share View Mode: ${shareViewId}`);
      setView('share');
    } else if (shareId) {
      console.log(`[App] Detected Share ID: ${shareId}`);
      setIsAnalyzing(true);

      SharedBlendService.resolveShare(shareId)
        .then(record => {
          if (record) {
            console.log('[App] Resolved Share:', record);
            setBlendRecs([record.blend]);
            setView('shared');
          } else {
            console.error('[App] Share ID not found/expired');
          }
        })
        .catch(err => {
          console.error('[App] Share Resolution Error', err);
        })
        .finally(() => setIsAnalyzing(false));
    }
  }, []); // Run once on mount

  // --- CONTEXT-AWARE URL HYDRATION ---
  useEffect(() => {
    if (view === 'stack-card') {
      const focusParam = new URLSearchParams(window.location.search).get('focus');
      if (focusParam) {
        setFocusedStackId(focusParam);
      }
      // RULE: activeStackId must be null on entering Preview context
      // This holds even on reloads to prevent auto-entry.
      setActiveStackId(null);
    }
  }, [view]);

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

          // TIMEOUT GUARD: 30 seconds max
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Engine Hard Timeout (30s)")), 30000)
          );

          setAnalysisProgress(50);

          setAnalysisProgress(50);

          const result = (await Promise.race([
            processIntent(userInput, {
              ...createInvocationContext(),
              onPhaseChange: setEnginePhase
            }),
            timeoutPromise
          ])) as OrchestratorResult;

          clearInterval(heartbeat);
          clearInterval(progressInterval);

          if (result.success) {
            // CHECK FOR CLARIFICATION GATE TRIGGER
            if (result.decision?.requires_clarification && !userInput?.clarificationData) {
              addLog('Accuracy Safeguard Triggered: Awaiting Calibration');
              setIsAnalyzing(false);

              const clarificationReason = result.analysis?.reasoning || "I need a bit more detail to be precise.";
              setConsultantText(clarificationReason);
              setConsultantMode('clarification_required');
              setShowConsultant(true);

              clearInterval(heartbeat);
              clearInterval(progressInterval);
              return;
            }

            if (result.data.length > 0) {
              addLog('Success: Results Ready');
              setAnalysisProgress(90);

              // Separate stacks from blends
              const adaptedResults = result.data.map((item: EngineResult) => adaptEngineResult(item, userInput.text)).filter(Boolean);
              const stacks = adaptedResults.filter((r: any) => r.kind === 'stack') as UIStackRecommendation[];
              const blends = adaptedResults.filter((r: any) => r.kind === 'blend') as UIBlendRecommendation[];

              // Set results - stacks go to stackRec, blends go to blendRecs
              if (stacks.length > 0) {
                setStackRec(stacks[0]); // Take first stack
              }
              if (blends.length > 0) {
                setBlendRecs(blends);
              }

              setAnalysisProgress(100);
              setIsAnalyzing(false);
              setIsResolved(true);
              setTimeout(() => setIsResolved(false), 500);
              // handleResolvingComplete will be called by V3SignalInterface when phase === 'chat'
              // It will check for results and route appropriately
            } else {
              // REMOVED: "Chat Only" terminal state - this is not an error
              // If no results, stay in resolving and wait
              // This is expected for Strain Mode + Tavily async latency
              setIsAnalyzing(false);
              // Do not navigate - let handleResolvingComplete handle it when results arrive
            }
          } else {
            throw new Error(result.error || 'Orchestrator returned failure');
          }
        } catch (e: any) {
          addLog(`ERROR: ${e.message}`);
          setIsAnalyzing(false);
          setErrorMessage(e.message || 'Analysis Failed');
          // NEUTRALIZED: Never navigate on error
          // setView('error');
        }
      };

      run();
    }
  }, [view, userInput, isAnalyzing]);

  // ResolvingScreen onComplete trigger (UI-only state machine)
  function handleResolvingComplete({
    blendRecsLength,
    hasStackRec,
    isStrainMode,
  }: {
    blendRecsLength: number;
    hasStackRec: boolean;
    isStrainMode: boolean;
  }) {
    // 1. SINGLE-SHOT GUARD
    if (hasNavigatedToResult) return;

    // 2. HARD BLOCK: NO RESULTS YET = WAIT
    const hasResults = blendRecsLength > 0 || hasStackRec === true;
    if (!hasResults) {
      // Strain mode is async by design — silence is correct behavior
      return;
    }

    // 3. STRAIN MODE SAFETY (extra insurance)
    if (isStrainMode && blendRecsLength === 0 && !hasStackRec) {
      return;
    }

    // 4. LOCK BEFORE NAVIGATION (CRITICAL)
    setHasNavigatedToResult(true);
    setAnalysisProgress(100);

    // 5. ROUTE TO PREVIEW LAYER (STRICT INVARIANT: Stacks must show Preview first)
    if (hasStackRec) {
      setActiveStackId(null); // Safety lock
      setView('stack-card');
    } else {
      setView('results');
    }
  }

  // Resolution screen handlers
  const handleResolutionContinue = () => {
    console.log('[App] Resolution: Continue to results');
    setView('results');
  };

  const handleResolutionShare = () => {
    console.log('[App] Resolution: Open share modal');
    setQRShareOpen(true);
  };

  // Stack card view handlers
  const handleViewStackDetails = () => {
    console.log('[CLICK]', 'handleViewStackDetails: CTA clicked (intentional)', { id: stackRec?.id });
    if (stackRec) {
      setActiveStackId(stackRec.id);
      setView('stack-detail');
    }
  };

  const handleStackCardBack = () => {
    console.log('[App] Stack Card: Go Back');
    // Contextual Back: Return to Results if we have search results, otherwise Presets
    if (blendRecs.length > 0) {
      setView('results');
    } else {
      setView('presets');
    }
  };

  // Create comprehensive invocation context for assistant
  const createInvocationContext = (): InvocationContext => {
    const context: InvocationContext = {
      route: window.location.pathname,
      viewType: view as any,
      activeEntityType: null,
      activeEntityId: null,
      mode: 'live_assist',
      screen: view, // Legacy compatibility
      userInput: userInput?.text
    };

    // Determine active entity based on current view and state
    switch (view) {
      case 'stack-card':
      case 'stack-detail':
        if (stackRec) {
          context.activeEntityType = 'stack';
          context.activeEntityId = stackRec.id;
          context.mode = view === 'stack-detail' ? 'protocol' : 'browse';
        }
        break;
      case 'blend-detail':
        if (activeBlend) {
          context.activeEntityType = 'blend';
          context.activeEntityId = activeBlend.id;
          context.mode = 'protocol';
        }
        break;
      case 'results':
        if (blendRecs.length > 0) {
          const primary = blendRecs[0];
          context.activeEntityType = primary.kind === 'stack' ? 'stack' : 'blend';
          context.activeEntityId = primary.id;
          context.mode = 'browse';
        }
        break;
      case 'resolution':
        if (blendRecs.length > 0) {
          const primary = blendRecs[0];
          context.activeEntityType = primary.kind === 'stack' ? 'stack' : 'blend';
          context.activeEntityId = primary.id;
          context.mode = 'edit';
        }
        break;
      case 'checkout':
      case 'share':
        // Session views - extract ID from URL
        const sessionId = new URLSearchParams(window.location.search).get(view === 'checkout' ? 'checkout' : 'share');
        if (sessionId) {
          context.activeEntityType = 'preset'; // Session artifacts
          context.activeEntityId = sessionId;
          context.mode = 'browse';
        }
        break;
      case 'input':
      case 'presets':
        context.mode = 'create';
        break;
      default:
        context.mode = 'browse';
    }

    // Set recommendation for legacy compatibility
    context.recommendation =
      (view === 'blend-detail' && activeBlend) ? activeBlend :
        (view === 'stack-detail' && (stackRec || (blendRecs[0]?.kind === 'stack' ? blendRecs[0] : undefined))) ? (stackRec || (blendRecs[0]?.kind === 'stack' ? blendRecs[0] : undefined)) :
          (blendRecs.length > 0 ? blendRecs[0] : (stackRec || undefined));

    return context;
  };

  const [calcTarget, setCalcTarget] = useState<UIBlendRecommendation | UIStackRecommendation | null>(null);

  const handleCalculate = (rec: any) => {
    setCalcTarget(rec);
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    // Preserve input if coming from resolving or results to allow refinement
    if (userInput?.text) {
      setInitialInputText(userInput.text);
    }
    setView('input');
    setStackRec(null);
    setBlendRecs([]); // Fixed
    setHasNavigatedToResult(false); // Reset navigation guard
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

        <CinematicBackground isAnalyzing={isAnalyzing} isResolved={isResolved} />

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
              <AdminPanel
                onExitAdmin={() => setMode('user')}
                onEnterDemoMode={() => setView('input')}
              />
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
                        console.log('[CLICK]', 'PresetStacks: onSelect (STACK) triggered', { id: exemplar.id });
                        setStackRec(exemplar.data as UIStackRecommendation);
                        setFocusedStackId(exemplar.id);
                        setActiveStackId(null);
                        setView('stack-card');
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
                    recommendation={blendRecs[0] || (stackRec as any)}
                    consultantText={consultantText}
                    progress={analysisProgress}
                    phase={enginePhase}
                    hasResults={blendRecs.length > 0 || !!stackRec}
                    error={errorMessage}
                    onBack={handleBack}
                    onComplete={() =>
                      handleResolvingComplete({
                        blendRecsLength: blendRecs.length,
                        hasStackRec: !!stackRec,
                        isStrainMode: userInput.mode === 'strain',
                      })
                    }
                    onRecalculate={handleRecalculateWithFeedback}
                  />
                )}

                {/* CLARIFICATION GATE - Accuracy Safeguard */}
                {view === 'clarification-gate' && (
                  <ClarificationGate
                    onComplete={(data) => {
                      if (userInput) {
                        console.log('[CLARIFICATION] Calibration Signal Received:', data);
                        setUserInput({ ...userInput, clarificationData: data });
                        setIsAnalyzing(true);
                        setView('resolving');
                      }
                    }}
                    onSkip={() => {
                      if (userInput) {
                        console.log('[CLARIFICATION] Use skipped - proceeding with conservative defaults');
                        // Tag as clarified to avoid re-trigger
                        setUserInput({ ...userInput, clarificationData: { directionalIssue: 'None', stabilityContext: 'None' } });
                        setIsAnalyzing(true);
                        setView('resolving');
                      }
                    }}
                  />
                )}

                {/* RESOLUTION SCREEN - Terminal Artifacts */}
                {view === 'resolution' && blendRecs.length > 0 && (
                  <ResolutionScreen
                    recommendations={blendRecs as UIBlendRecommendation[]}
                    onContinue={handleResolutionContinue}
                    onShare={handleResolutionShare}
                  />
                )}

                {/* RESULTS SCREEN (Blends Only) */}
                {view === 'results' && blendRecs.length > 0 && (
                  <ResultsScreen
                    key={blendRecs[0]?.id} // FORCE REMOUNT on new results to trigger entry animation
                    recommendations={blendRecs as UIBlendRecommendation[]}
                    onCalculate={handleCalculate}
                    onBack={handleBack}
                    onConcludeSession={() => {
                      // Only allow QR generation for user-initiated live sessions
                      // NOT from presets or scenario cards
                      if (userInput && userInput.kind === 'blend' && userInput.mode !== 'preset') {
                        console.log('[App] User concluded session - generating QR artifact');
                        setQRShareOpen(true);
                      } else {
                        console.warn('[App] QR generation blocked - not a user-initiated session');
                      }
                    }}
                    onViewDetail={(item: any) => {
                      if (item.kind === 'stack') {
                        console.log('[CLICK]', 'ResultsScreen: onViewDetail called (STACK)', { id: item.id });
                        setStackRec(item as UIStackRecommendation);
                        setFocusedStackId(item.id);
                        setActiveStackId(null);
                        setView('stack-card');
                      } else {
                        setSelectedBlendId(item.id);
                        setView('blend-detail');
                      }
                    }}
                    onOpenConsultant={() => setShowConsultant(true)}
                  />
                )}



                {/* SHARED READ-ONLY VIEW */}
                {view === 'shared' && blendRecs.length > 0 && blendRecs[0].kind === 'blend' && (
                  <SharedResultScreen recommendation={blendRecs[0] as UIBlendRecommendation} />
                )}

                {/* CHECKOUT SCREEN (Staff Use) */}
                {view === 'checkout' && (
                  <CheckoutScreen />
                )}

                {/* SHARE SCREEN (Public Sharing) */}
                {view === 'share' && (
                  <ShareScreen />
                )}

                {/* REMOTE ACCESS PREVIEW (Customer Demo) */}
                {view === 'remote-access' && (
                  <RemoteAccessPreview />
                )}

                {/* STACK CARD VIEW (Intermediate Stack Preview) */}
                {view === 'stack-card' && stackRec && (
                  <StackCardView
                    stack={stackRec}
                    onBack={handleStackCardBack}
                    onViewDetails={handleViewStackDetails}
                    setActiveStackId={setActiveStackId}
                  />
                )}

                {/* STACK DETAIL (Stacks Only) */}
                {view === 'stack-detail' && stackRec && (
                  <StackDetailScreen
                    stack={stackRec as UIStackRecommendation}
                    onBack={() => setView('stack-card')}
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
                {calculatorOpen && calcTarget && (
                  <CalculatorModal
                    recommendation={calcTarget}
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
                    consultantMode={consultantMode} // Pass consultantMode
                    context={{
                      viewType: view as any,
                      activeEntityType: stackRec ? 'stack' : 'blend',
                      activeEntityId: stackRec?.id || blendRecs[0]?.id,
                      route: window.location.hash || '#/',
                      mode: 'live_assist',
                      screen: view as any
                    }}
                    recommendation={stackRec || blendRecs[0]}
                    onApplyResult={(result: any) => {
                      // SPECIAL PATH: MODE-DRIVEN CALIBRATION (Clarification)
                      if (consultantMode === 'clarification_required') {
                        console.log(`[${consultantMode}] Received Calibration Payload:`, result);

                        // 1. Merge Calibration Data into UserInput
                        // We rely on setUserInput having set the seed in handleSubmit
                        if (userInput) {
                          const enhancedInput: IntentSeed = {
                            ...userInput,
                            clarificationData: result // Inject structured calibration
                          };

                          // 2. Close Assistant
                          setShowConsultant(false);
                          setConsultantMode('default');
                          setConsultantText(undefined); // Reset text

                          // 3. Start Engine (Standard Flow)
                          console.log('TRANSITION: Calibration -> Resolving (Engine Start)');
                          setStackRec(null);
                          setBlendRecs([]);
                          setHasNavigatedToResult(false);
                          setUserInput(enhancedInput);
                          setIsAnalyzing(true);
                          setAnalysisProgress(20);
                          setView('resolving');
                        }
                        return;
                      }

                      // STANDARD PATH: REFACTOR/EDIT (Chat Mode)
                      addLog("Assistant: Reconfiguring Engine...");
                      const adaptedSet = Array.isArray(result) ? result
                        .map(r => adaptEngineResult(r, userInput?.text))
                        .filter(Boolean) as (UIBlendRecommendation | UIStackRecommendation)[] : [];

                      if (adaptedSet.length > 0) {
                        const firstRec = adaptedSet[0];
                        if (firstRec.kind === 'stack') {
                          console.log('[CLICK]', 'LiveConsultant: onApplyResult (STACK)', { id: firstRec.id });
                          setStackRec(firstRec as UIStackRecommendation);
                          setFocusedStackId(firstRec.id);
                          setActiveStackId(null);
                          setBlendRecs([]);
                          setView('stack-card');
                        } else {
                          setBlendRecs(adaptedSet);
                          setStackRec(null); // Clear active stack
                          setView('results');
                        }
                        setShowConsultant(false);
                      }
                    }}
                    onClose={() => {
                      setShowConsultant(false);
                      // HANDLING ABANDONMENT
                      // If user cancels during calibration, we proceed with "best effort" using current inputs
                      // This prevents getting stuck in "Analyzing" state if they close the modal
                      if (consultantMode === 'clarification_required') {
                        setConsultantMode('default');
                        setConsultantText(undefined);

                        // Trigger default generation if we have pending input and aren't already running
                        if (userInput && !isAnalyzing) {
                          console.log(`[${consultantMode}] Abandoned -> Proceeding with Default Flow`);
                          setStackRec(null);
                          setBlendRecs([]);
                          setHasNavigatedToResult(false);

                          // Tag as skipped to avoid re-trigger loops
                          const skippedInput = { ...userInput, clarificationData: { directionalIssue: 'None', stabilityContext: 'Skipped' } };
                          setUserInput(skippedInput);

                          setIsAnalyzing(true);
                          setAnalysisProgress(20);
                          setView('resolving');
                        }
                      }
                    }}
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

            {/* LIVE CONSULTANT TRIGGER FAB (Now on the Left) */}
            <button
              onClick={() => {
                if (!isAnalyzing) setShowConsultant(true);
              }}
              disabled={isAnalyzing}
              className={`fixed bottom-6 left-6 z-[101] group flex items-center justify-center w-12 h-12 rounded-full bg-[#00FFD1] text-black shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all duration-300 
                  ${isAnalyzing ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-110 hover:shadow-[0_0_30px_rgba(0,255,209,0.5)]'}
                  max-[360px]:bottom-20 max-[360px]:left-4
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
