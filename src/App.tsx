import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';
import { EntryGate } from './components/EntryGate';
import { InputScreen } from './components/InputScreen';
import { ResolvingScreen } from './components/ResolvingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PresetStacks } from './components/PresetStacks';
import { StackDetailScreen } from './components/StackDetailScreen'; // New Import
import { CalculatorModal } from './components/CalculatorModal';
import { QRShareModal } from './components/QRShareModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { generateRecommendations, interpretIntent, IntentValidation } from './lib/engineAdapter';
import './index.css';

export type ViewState = 'splash' | 'entry' | 'input' | 'resolving' | 'results' | 'presets' | 'stack-detail';

import { BLEND_SCENARIOS, BlendScenario } from './data/presetBlends'; // Import BlendScenario

// ...

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<ViewState>('splash');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [initialInputText, setInitialInputText] = useState<string>(''); // New State
  const [recommendations, setRecommendations] = useState<EngineResult[]>([]);
  // ...

  const handleSelectPreset = (exemplar: OutcomeExemplar | BlendScenario) => {
    // Handle BlendScenario (Input Screen Population)
    if ('inputText' in exemplar) {
      console.log('TRANSITION: Scenario Selected -> Populate Input');
      setInitialInputText(exemplar.inputText);
      return; // Stay on InputScreen, just populate
    }

    // Handle OutcomeExemplar (Result Navigation)
    console.log(`TRANSITION: Preset (${exemplar.kind}) -> Static View`);
    setUserInput(null);
    setRecommendations([]);

    if (exemplar.kind === 'blend') {
      setSelectedRecommendation(exemplar.data);
      setView('results');
    } else {
      setSelectedRecommendation(exemplar.data);
      setView('stack-detail');
    }
  };

  // ... (inside Return)
  {
    view === 'input' && (
      <InputScreen
        onSubmit={handleSubmit}
        onBrowsePresets={() => setView('presets')}
        onSelectPreset={handleSelectPreset}
        onAdminModeToggle={() => setMode('admin')}
        isAdminMode={false}
        initialText={initialInputText} // Pass Prop
      />
    )
  }
  {
    view === 'resolving' && userInput && (
      <ResolvingScreen
        input={userInput}
        recommendation={recommendations[0] || null}
        onComplete={() => setView('results')}
      />
    )
  }
  {/* STRICT BLEND RESULTS */ }
  {
    view === 'results' && recommendations.length > 0 && recommendations[0].kind === 'blend' && (
      <ResultsScreen
        recommendations={recommendations}
        onCalculate={handleCalculate}
        onBack={handleBack}
        onShare={(rec) => {
          setSelectedRecommendation(rec);
          setQRShareOpen(true);
        }}
      />
    )
  }
  {/* STRICT STACK DETAIL (From Presets) */ }
  {
    view === 'stack-detail' && selectedRecommendation && (
      <StackDetailScreen
        stack={selectedRecommendation}
        onBack={() => setView('presets')}
      />
    )
  }

  {/* STRICT STACK RESULTS (From Engine) */ }
  {
    view === 'results' && recommendations.length > 0 && recommendations[0].kind === 'stack' && (
      // Note: Engine currently produces blends mostly, but if it produces a stack:
      <StackDetailScreen
        stack={recommendations[0]}
        onBack={() => setView('input')}
      />
    )
  }
  {
    view === 'presets' && (
      <PresetStacks
        onBack={() => setView('input')}
        onSelect={handleSelectPreset}
      />
    )
  }
  {
    calculatorOpen && selectedRecommendation && (
      <CalculatorModal
        recommendation={selectedRecommendation}
        onClose={() => setCalculatorOpen(false)}
      />
    )
  }
  {
    qrShareOpen && selectedRecommendation && (
      <QRShareModal
        recommendation={selectedRecommendation}
        onClose={() => setQRShareOpen(false)}
      />
    )
  }
          </>
        )
}
      </main >

  {/* Admin Quick Access */ }
{
  !showSplash && !showEntryGate && mode !== 'admin' && (
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
  )
}
    </div >
  );
}