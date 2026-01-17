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
import { AdminPanel } from './components/admin/AdminPanel';
import { generateRecommendations, interpretIntent, IntentValidation } from './lib/engineAdapter';
import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends'; // Import BlendScenario
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail';

import { EngineResult, IntentSeed, UIStackRecommendation, OutcomeExemplar, UIBlendRecommendation } from './types/domain';

// --- Domain Types ---
// UserInput is now strictly IntentSeed
type UserInput = IntentSeed;


export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<ViewState>('splash');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>(''); // New State
  const [recommendations, setRecommendations] = useState<EngineResult[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<EngineResult | null>(null);
  const [qrShareOpen, setQRShareOpen] = useState(false);

  // Phase 2 State: Interpretation
  const [interpretationIssue, setInterpretationIssue] = useState<IntentValidation | null>(null);

  const handleEnterUser = () => {
    setMode('user');
    setShowEntryGate(false);
    setView('input'); // Explicitly enter Input Flow
  };

  const handleEnterAdmin = () => {
    setMode('admin');
    setShowEntryGate(false);
    setView('input'); // Default to input view under admin mode logic
  };

  const handleSubmit = (input: UserInput) => {
    // PHASE 2: INTERPRETATION
    const validation = interpretIntent(input);

    if (!validation.isValid) {
      // Intent Incomplete -> Show Follow-Up
      setInterpretationIssue(validation);
      // Stay in Input View, but trigger "refinement" UI (could be a modal or just state passed to InputScreen)
      // For now, we'll alert or use a temporary overlay. 
      // BETTER: Pass this state to InputScreen or show a global Toast.
      // We will show a toast.
      return;
    }

    // Intent Complete -> Proceed to Phase 3
    setInterpretationIssue(null);
    console.log('TRANSITION: Input -> Resolving (Engine Start)');
    // Rule 2: Clear Preset State & Start Engine
    setSelectedRecommendation(null);
    setUserInput(input);
    setRecommendations([]);
    setView('resolving');
  };

  const handleSelectPreset = (exemplar: OutcomeExemplar | BlendScenario) => {
    // Handle BlendScenario (Input Screen Population)
    if ('inputText' in exemplar) {
      console.log('TRANSITION: Scenario Selected -> Populate Input');
      setInitialInputText(exemplar.inputText);
      return; // Stay on InputScreen, just populate
    }

    // Handle OutcomeExemplar (Result Navigation)
    console.log(`TRANSITION: Preset (${exemplar.kind}) -> Static View`);
    // Rule 1: Presets are terminal. Clear Engine State.
    setUserInput(null);
    setRecommendations([]); // Assuming single recommendation for preset results or we wrap it

    if (exemplar.kind === 'blend') {
      // ... legacy path, should ideally be removed if all are text inputs
      setSelectedRecommendation(exemplar.data);
      setView('results');
    } else {
      setSelectedRecommendation(exemplar.data);
      setView('stack-detail');
    }
  };


  // Async Calculation Effect
  useEffect(() => {
    if (view === 'resolving' && userInput && recommendations.length === 0) {
      // Small timeout to allow UI to invoke the "Analyzing" state first
      const timer = setTimeout(() => {
        const recs = generateRecommendations(userInput);
        setRecommendations(recs);
      }, 500); // 500ms delay to ensure transition is smooth
      return () => clearTimeout(timer);
    }
  }, [view, userInput, recommendations.length]);

  const handleCalculate = (rec: EngineResult) => {
    // Calculator currently primarily designed for blends, but we pass generic result
    setSelectedRecommendation(rec);
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    setView('input');
    setRecommendations([]);
    setUserInput(null);
  };

  // Refinement Handler (for Follow-Up Prompt)
  const handleRefine = () => {
    // Just dismiss issue, user is already at Input
    setInterpretationIssue(null);
  };

  return (
    <div className="dark min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black flex flex-col">
      {/* Interpretation Toast */}
      <AnimatePresence>
        {interpretationIssue && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-6 right-6 z-50 bg-[#7C3AED] text-white p-4 rounded-xl shadow-2xl flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-sm">Wait, tell us more.</p>
              <p className="text-xs text-white/80">{interpretationIssue.followUpQuestion}</p>
            </div>
            <button onClick={handleRefine} className="bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg text-xs font-semibold ml-4">
              Okay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
            <div
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border backdrop-blur-xl"
              style={{
                backgroundColor: 'rgba(255, 170, 0, 0.2)',
                borderColor: '#ffaa00',
                boxShadow: '0 0 20px rgba(255, 170, 0, 0.4)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: '#ffaa00',
                    boxShadow: '0 0 8px #ffaa00',
                  }}
                />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#ffaa00' }}>
                  Admin Mode
                </span>
              </div>
            </div>
            <AdminPanel
              onExitAdmin={() => setMode('user')}
              onEnterDemoMode={() => {
                setView('input');
              }}
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
                initialText={initialInputText} // Pass Prop
              />
            )}
            {view === 'resolving' && userInput && (
              <ResolvingScreen
                input={userInput}
                recommendation={recommendations[0] || null}
                onComplete={() => setView('results')}
              />
            )}
            {/* STRICT BLEND RESULTS */}
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
            {/* STRICT STACK DETAIL (From Presets) */}
            {view === 'stack-detail' && selectedRecommendation && (
              <StackDetailScreen
                stack={selectedRecommendation}
                onBack={() => setView('presets')}
              />
            )}

            {/* STRICT STACK RESULTS (From Engine) */}
            {view === 'results' && recommendations.length > 0 && recommendations[0].kind === 'stack' && (
              // Note: Engine currently produces blends mostly, but if it produces a stack:
              <StackDetailScreen
                stack={recommendations[0]}
                onBack={() => setView('input')}
              />
            )}
            {view === 'presets' && (
              <PresetStacks
                onBack={() => setView('input')}
                onSelect={handleSelectPreset}
              />
            )}
            {calculatorOpen && selectedRecommendation && (
              <CalculatorModal
                recommendation={selectedRecommendation}
                onClose={() => setCalculatorOpen(false)}
              />
            )}
            {qrShareOpen && selectedRecommendation && (
              <QRShareModal
                recommendation={selectedRecommendation}
                onClose={() => setQRShareOpen(false)}
              />
            )}
          </>
        )}
      </main>

      {/* Admin Quick Access */}
      {!showSplash && !showEntryGate && mode !== 'admin' && (
        <button
          onClick={() => setMode('admin')}
          className="fixed bottom-4 left-4 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white/60 hover:bg-white/10 transition-all"
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