import { useState, useEffect } from 'react';
import { InputScreen } from './components/InputScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { CalculatorModal } from './components/CalculatorModal';
import { EntryGate } from './components/EntryGate';
import { AdminPanel } from './components/admin/AdminPanel';
import { PresetStacks, type PresetStack } from './components/PresetStacks';
import { QRShareModal } from './components/QRShareModal';
import { SplashScreen } from './components/SplashScreen';
import { generateRecommendations, type UserInput, type UICultivar, type UIBlendRecommendation } from './lib/engineAdapter';

export type InputMode = 'describe' | 'product' | 'strain';

// Re-export types from adapter
export type { UserInput, UICultivar };

export type BlendRecommendation = UIBlendRecommendation;

// Helper function for type checking (always false since we only have blends now)
export function isStacked(_rec: BlendRecommendation): boolean {
  return false;
}

export type StackedRecommendation = {
  id: string;
  name: string;
  matchScore: number;
  layers: Array<{
    layerName: string;
    cultivars: Array<{
      name: string;
      ratio: number;
      profile: string; // Changed from role to profile to match UICultivar
      characteristics: string[];
    }>;
    purpose: string;
    timing: string;
  }>;
  reasoning: string;
  totalDuration: string;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEntryGate, setShowEntryGate] = useState(true); // Always show entry gate
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [view, setView] = useState<'input' | 'results' | 'presets'>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [recommendations, setRecommendations] = useState<BlendRecommendation[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<BlendRecommendation | null>(null);
  const [qrShareOpen, setQRShareOpen] = useState(false);

  // NO localStorage persistence - Entry Gate required every session
  // NO "completed" state - Entry Gate always appears on app load

  const handleEnterUser = () => {
    setMode('user');
    setShowEntryGate(false);
  };

  const handleEnterAdmin = () => {
    setMode('admin');
    setShowEntryGate(false);
  };

  const handleSubmit = async (input: UserInput) => {
    setUserInput(input);

    // Processing
    const recs = generateRecommendations(input);
    setRecommendations(recs);
    setView('results');
  };

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
    <div className="dark min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-[#ffaa00] selection:text-black">
      {/* Global Background Effects - Moved here for persistence */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#BF5AF2]/10 rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00FFD1]/5 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-700" />
      </div>

      <main className="relative z-10 w-full h-full flex flex-col">
        {showEntryGate ? (
          <EntryGate
            onEnterUser={handleEnterUser}
            onEnterAdmin={handleEnterAdmin}
          />
        ) : mode === 'admin' ? (
          <>
            {/* Admin Mode Indicator */}
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
                // Demo mode logic
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
                onSelectPreset={(stack: PresetStack) => {
                  // Convert PresetStack to BlendRecommendation (UIBlendRecommendation)
                  const recommendation: BlendRecommendation = {
                    id: stack.id,
                    name: stack.name,
                    cultivars: stack.stack.layers.flatMap(layer => layer.cultivars.map(c => ({
                      name: c.name,
                      ratio: c.ratio,
                      profile: c.profile || 'Balanced',
                      characteristics: c.characteristics || []
                    }))),
                    matchScore: 98,
                    reasoning: stack.stack.reasoning,
                    effects: {
                      onset: '5-10m',
                      peak: '30-45m',
                      duration: stack.stack.totalDuration
                    },
                    timeline: [
                      { time: '0-10 min', feeling: 'Onset' },
                      { time: '10-30 min', feeling: 'Building' },
                      { time: '30-90 min', feeling: 'Peak Effects' },
                      { time: "90+ min", feeling: "Tapering" }
                    ]
                  };
                  setRecommendations([recommendation]);
                  setView('results');
                }}
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
    </div>
  );
}