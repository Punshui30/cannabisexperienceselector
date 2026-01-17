import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';
import { EntryGate } from './components/EntryGate';
import { InputScreen } from './components/InputScreen';
import { ResolvingScreen } from './components/ResolvingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PresetStacks } from './components/PresetStacks';
import { StackDetailScreen } from './components/StackDetailScreen';
import { StaticBlendScreen } from './components/StaticBlendScreen';
import { CalculatorModal } from './components/CalculatorModal';
import { QRShareModal } from './components/QRShareModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { generateRecommendations, interpretIntent, IntentValidation } from './lib/engineAdapter';
import { BlendScenario } from './data/presetBlends';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail' | 'static-blend';

import { EngineResult, IntentSeed, OutcomeExemplar } from './types/domain';

type UserInput = IntentSeed;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<ViewState>('splash');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [recommendations, setRecommendations] = useState<EngineResult[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<EngineResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<BlendScenario | null>(null);
  const [qrShareOpen, setQRShareOpen] = useState(false);

  // Phase 2 State: Blocking Interpretation Modal
  const [interpretationIssue, setInterpretationIssue] = useState<IntentValidation | null>(null);

  // Draft Intent for Input Screen (returned from Static View)
  const [draftIntent, setDraftIntent] = useState<string>('');

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
    // PHASE 2: INTERPRETATION (Modal Trigger)
    const validation = interpretIntent(input);

    if (!validation.isValid) {
      // Intent Incomplete -> Show Follow-Up Blocking Modal
      setInterpretationIssue(validation);
      return;
    }

    // Intent Complete -> Proceed to Phase 3 (Engine)
    setInterpretationIssue(null);
    console.log('TRANSITION: Input -> Resolving (Engine Start)');

    // Rule: Clear Static State
    setSelectedRecommendation(null);
    setSelectedScenario(null);

    setUserInput(input);
    setRecommendations([]);
    setView('resolving');
  };

  const handleSelectPreset = (exemplar: OutcomeExemplar | BlendScenario) => {
    // STRICT ROUTING SEPARATION

    if ('visualProfile' in exemplar) {
      // BlendScenario -> StaticBlendScreen
      console.log(`TRANSITION: Scenario Preset -> Static Blend View`);
      setSelectedScenario(exemplar as BlendScenario);

      // Ensure Engine State is CLEARED
      setUserInput(null);
      setRecommendations([]);

      setView('static-blend');
    } else {
      // Stack Exemplar -> StackDetailScreen (or Presets)
      const stackExemplar = exemplar as OutcomeExemplar;
      console.log(`TRANSITION: Stack Preset (${stackExemplar.kind}) -> Static View`);

      setUserInput(null);
      setRecommendations([]);

      if (stackExemplar.kind === 'blend') {
        // Legacy catch, ideally unused if Scenarios replace blend presets
        // We map to ResultsScreen for visualization ONLY if it's legacy data
        setSelectedRecommendation(stackExemplar.data);
        setView('results');
      } else {
        setSelectedRecommendation(stackExemplar.data);
        setView('stack-detail');
      }
    }
  };

  // Async Calculation Effect (Active ONLY in resolving view)
  useEffect(() => {
    if (view === 'resolving' && userInput && recommendations.length === 0) {
      // Visual Bridge: Allow "Analyzing" state to be seen
      const timer = setTimeout(() => {
        const recs = generateRecommendations(userInput);
        setRecommendations(recs);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [view, userInput, recommendations.length]);

  const handleCalculate = (rec: EngineResult) => {
    setSelectedRecommendation(rec);
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    setView('input');
    setRecommendations([]);
    setUserInput(null);
    setSelectedScenario(null);
  };

  // Refinement / Use Intent Handler
  const handleRefine = () => {
    setInterpretationIssue(null);
    // Stay on Input
  };

  return (
    <div className="dark min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black flex flex-col">

      {/* Phase 2: Blocking Interpretation Modal */}
      <AnimatePresence>
        {interpretationIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#d4a259]" />

              <h3 className="text-xl font-bold mb-3 text-white">Hold on a sec</h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                {interpretationIssue.reason || "We need a bit more detail."}
                <br /><br />
                <span className="text-[#d4a259] font-medium">{interpretationIssue.followUpQuestion}</span>
              </p>

              <button
                onClick={handleRefine}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors"
              >
                Okay, I'll add that
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[60%] bg-[#7C3AED]/60 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#d4a259]/40 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {mode === 'admin' ? (
          <AdminPanel onUseScenario={(s) => { }} onExit={() => handleEnterUser()} />
        ) : (
          <>
            {view === 'splash' && (
              <SplashScreen onComplete={() => setView('entry')} />
            )}

            {view === 'entry' && (
              <EntryGate onEnter={handleEnterUser} />
            )}

            {view === 'input' && (
              <InputScreen
                onSubmit={handleSubmit}
                onSelectPreset={handleSelectPreset}
                isAdmin={false}
                initialText={draftIntent}
              />
            )}

            {view === 'resolving' && userInput && (
              <ResolvingScreen
                input={userInput}
                recommendation={recommendations[0] || null}
                onComplete={() => setView('results')}
              />
            )}

            {view === 'results' && (
              <ResultsScreen
                recommendations={recommendations}
                onBack={handleBack}
                onCalculate={handleCalculate}
                onShare={() => setQRShareOpen(true)}
                onRefine={() => setView('input')}
              />
            )}

            {view === 'static-blend' && selectedScenario && (
              <StaticBlendScreen
                scenario={selectedScenario}
                onBack={handleBack}
                onUse={(text) => {
                  setDraftIntent(text);
                  setView('input');
                }}
              />
            )}

            {view === 'stack-detail' && selectedRecommendation && (
              <StackDetailScreen
                result={selectedRecommendation}
                onBack={handleBack}
              />
            )}

            {view === 'presets' && (
              <PresetStacks onSelectStack={(stack) => handleSelectPreset({ kind: 'stack', data: stack } as OutcomeExemplar)} />
            )}

          </>
        )}
      </div>

      <CalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        result={selectedRecommendation}
      />

      <QRShareModal
        isOpen={qrShareOpen}
        onClose={() => setQRShareOpen(false)}
        result={selectedRecommendation}
      />
    </div>
  );
}