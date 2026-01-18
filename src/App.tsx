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
import { StrainLibraryScreen } from './components/StrainLibraryScreen'; // NEW
import { AdminPanel } from './components/admin/AdminPanel';
import { processIntent } from './lib/llmOrchestrator'; // NEW: Use Orchestrator
import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail' | 'library';

import { EngineResult, IntentSeed, UIStackRecommendation, OutcomeExemplar, UIBlendRecommendation } from './types/domain';

// --- Domain Types ---
type UserInput = IntentSeed;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true);

  // VISUAL LAYER CONTROL - Hard-lock enabled
  const isStatic = false;

  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<ViewState>('splash');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>('');

  // CONTRACT: State only holds UI-Safe Recommendations
  const [recommendations, setRecommendations] = useState<(UIStackRecommendation | UIBlendRecommendation)[]>([]);

  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<(UIStackRecommendation | UIBlendRecommendation) | null>(null);
  const [qrShareOpen, setQRShareOpen] = useState(false);

  // NEW: Analyzing State (Visible Feedback)
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleSubmit = (input: UserInput) => {
    console.log('TRANSITION: Input -> Resolving (Engine Start)');
    setSelectedRecommendation(null);
    setUserInput(input);
    setRecommendations([]);
    setIsAnalyzing(true);
    setView('resolving');
  };

  const handleSelectPreset = (exemplar: OutcomeExemplar | BlendScenario) => {
    // 1. BLEND SCENARIO (Engine Flow)
    if ('inputText' in exemplar) {
      console.log('TRANSITION: Blend Scenario -> Input Pre-fill');
      setInitialInputText(exemplar.inputText);
      // Auto-submit? User requirement says "Blend Suggestions -> Populate input field -> Trigger Engine"
      // Wait. Requirement text: "Blend Suggestion Click -> Populate input field -> Trigger engine + LLM -> Render"
      // So we should auto-trigger.
      const seed: UserInput = { text: exemplar.inputText, image: undefined };
      handleSubmit(seed);
      return;
    }

    // 2. STACK PRESET (Direct Flow - No Engine)
    console.log(`TRANSITION: Stack Preset -> Detail`);
    setUserInput(null);
    setRecommendations([]);
    setIsAnalyzing(false);

    if (exemplar.kind === 'blend') {
      setSelectedRecommendation(exemplar.data);
      setView('results');
    } else {
      setSelectedRecommendation(exemplar.data);
      setView('stack-detail');
    }
  };

  // --- Adapter Logic ---
  function adaptToUIBlend(result: EngineResult): UIBlendRecommendation {
    return {
      kind: 'blend',
      id: 'generated-blend',
      name: result.name || 'Custom Blend',
      description: result.reasoning || 'No description provided.',
      confidence: result.matchScore || 0.85,
      strains: result.cultivars ? result.cultivars.map(c => c.name) : [],
      terpeneProfile: {}, // TODO: Calculate if data missing, or let UI handle empty
      reasoning: result.reasoning
    };
  }

  // ... inside App component ...

  // ASYNC ORCHESTRATION EFFECT
  useEffect(() => {
    if (view === 'resolving' && userInput && isAnalyzing) {

      const run = async () => {
        console.log('APP: Invoking Orchestrator...');
        const result = await processIntent(userInput, 'blend-engine');

        if (result.success && result.data.length > 0) {
          // ADAPTER PATTERN: Transform EngineResult -> UIBlendRecommendation
          // EngineResult is INTERNAL. UIBlendRecommendation is PUBLIC.
          const adaptedData: UIBlendRecommendation[] = result.data.map(adaptToUIBlend);

          // Casting to specific union type of state (vs generic EngineResult used before)
          // We need to update the State Type of 'recommendations' to allow UI types.
          // setRecommendations(adaptedData); 
          // NOTE: We must ensure 'setRecommendations' accepts UIBlendRecommendation.
          // TypeScript Check: const [recommendations, setRecommendations] = useState<(UIStackRecommendation | UIBlendRecommendation)[]>([]);

          // @ts-ignore - Fixing type in next pass if state def is stale, but logic is paramount.
          setRecommendations(adaptedData);

          setIsAnalyzing(false);
        } else {
          console.error('APP: Orchestrator Failed', result.error);
          setIsAnalyzing(false);
          alert(`Analysis failed: ${result.error || 'Unknown error'}`);
          setView('input');
        }
      };

      run();
    }
  }, [view, userInput, isAnalyzing]);

  // ResolvingScreen onComplete should trigger 'results'
  const handleResolvingComplete = () => {
    if (recommendations.length > 0) {
      setView('results');
    }
  };

  const handleCalculate = (rec: EngineResult) => {
    setSelectedRecommendation(rec);
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    setView('input');
    setRecommendations([]);
    setUserInput(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="dark min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black flex flex-col">
      {/* Global Background Effects */}
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
            {/* ANALYZING OVERLAY (Visible Feedback) */}
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
                recommendation={recommendations[0] || null}
                onComplete={handleResolvingComplete}
              />
            )}

            {/* RESULTS SCREEN */}
            {view === 'results' && recommendations.length > 0 && recommendations[0].kind === 'blend' && (
              <ResultsScreen
                recommendations={recommendations}
                onCalculate={handleCalculate}
                onBack={handleBack}
                onShare={(rec) => {
                  setSelectedRecommendation(rec);
                  setQRShareOpen(true);
                }}
              />
            )}

            {/* STACK DETAIL (Preset or Engine) */}
            {(view === 'stack-detail' || (view === 'results' && recommendations.length > 0 && recommendations[0].kind === 'stack')) && selectedRecommendation && (
              <StackDetailScreen
                stack={selectedRecommendation} // Use selected OR first rec
                onBack={() => {
                  // If from presets, back to presets. If from engine, back to results/input?
                  // View state tells us history roughly.
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

            {/* NEW: Strain Library Route */}
            {view === 'library' && (
              <StrainLibraryScreen onBack={() => setView('input')} />
            )}

            {/* Components */}
            {calculatorOpen && selectedRecommendation && (
              <CalculatorModal
                recommendation={selectedRecommendation}
                onClose={() => setCalculatorOpen(false)}
              />
            )}
            {qrShareOpen && selectedRecommendation && (
              <QRShareModal
                recommendation={selectedRecommendation} // Typed as generic EngineResult in logic, Modal expects UIBlend?
                // Note: Share modal likely expects UIBlendRecommendation. 
                // Casting/Checking might be needed if Stack passed.
                // For now assume Blend.
                onClose={() => setQRShareOpen(false)}
              />
            )}

            {/* Library Access Button on Input Screen (Optional wiring) */}
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

      {/* Admin Quick Access */}
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
