import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';
import { EntryGate } from './components/EntryGate';
import { InputScreen } from './components/InputScreen';
import { ResolvingScreen } from './components/ResolvingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PresetStacks } from './components/PresetStacks';
import { CalculatorModal } from './components/CalculatorModal';
import { QRShareModal } from './components/QRShareModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { generateRecommendations, type UserInput, type UIBlendRecommendation } from './lib/engineAdapter';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets';

// Re-export types from adapter if needed elsewhere, though usually direct import is better
export type { UserInput };

export type BlendRecommendation = UIBlendRecommendation | StackedRecommendation;

export type StackedRecommendation = {
  id: string;
  name: string;
  matchScore: number;
  layers: Array<{
    layerName: string;
    cultivars: Array<{
      name: string;
      ratio: number;
      profile: string;
      characteristics: string[];
    }>;
    purpose: string;
    timing: string;
  }>;
  reasoning: string;
  totalDuration: string;
  // properties to satisfy BlendRecommendation shape for shared components
  cultivars?: never;
  effects?: never;
  timeline?: never;
};

export function isStacked(rec: BlendRecommendation): rec is StackedRecommendation {
  return 'layers' in rec;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<ViewState>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [recommendations, setRecommendations] = useState<BlendRecommendation[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<BlendRecommendation | null>(null);
  const [qrShareOpen, setQRShareOpen] = useState(false);

  const handleEnterUser = () => {
    setMode('user');
    setShowEntryGate(false);
  };

  const handleEnterAdmin = () => {
    setMode('admin');
    setShowEntryGate(false);
  };

  const handleSubmit = (input: UserInput) => {
    setUserInput(input);
    setRecommendations([]);
    setView('resolving');
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

  const handleCalculate = (rec: BlendRecommendation) => {
    setSelectedRecommendation(rec);
    setCalculatorOpen(true);
  };

  const handleBack = () => {
    setView('input');
    setRecommendations([]);
    setUserInput(null);
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
                onAdminModeToggle={() => setMode('admin')}
                isAdminMode={false}
              />
            )}
            {view === 'resolving' && userInput && (
              <ResolvingScreen
                input={userInput}
                recommendation={recommendations[0] as UIBlendRecommendation} // Undefined initially
                onComplete={() => setView('results')}
              />
            )}
            {view === 'results' && (
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
            {view === 'presets' && (
              <PresetStacks
                onBack={() => setView('input')}
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