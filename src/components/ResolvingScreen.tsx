import { useState, useEffect } from 'react';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation, EnginePhase } from '../types/domain';
import { V3SignalInterface } from './V3SignalInterface';
import { AlertTriangle, ArrowLeft, SearchX } from 'lucide-react';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    consultantText?: string;
    onComplete: () => void;
    onRecalculate?: (feedback: string) => void;
    onBack?: () => void;
    progress?: number; // Controlled progress from parent
    phase?: EnginePhase;
    hasResults?: boolean; // Guard: only complete when results exist
    error?: string | null;
}

export function ResolvingScreen({ input, recommendation, consultantText, onComplete, onRecalculate, onBack, progress = 0, phase = 'idle', hasResults = false, error }: ResolvingScreenProps) {
    const [timedOut, setTimedOut] = useState(false);

    // HARD BLOCK: Only complete when results exist AND phase is terminal
    useEffect(() => {
        if (phase === 'chat' && hasResults && !error) {
            // Small delay for visual completion
            const timeout = setTimeout(() => {
                onComplete();
            }, 300);
            return () => clearTimeout(timeout);
        }
        // If phase is 'chat' but no results, wait silently
        // This is expected for Strain Mode + Tavily async latency

        // If phase is 'chat' but no results for too long, show empty state
        if (phase === 'chat' && !hasResults && !error) {
            const timeout = setTimeout(() => {
                setTimedOut(true);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [phase, hasResults, onComplete, error]);

    if (error || timedOut) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/90 backdrop-blur-xl relative z-50">
                <div className={`w-16 h-16 rounded-full ${timedOut ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'} border flex items-center justify-center mb-6`}>
                    {timedOut ? <SearchX className="text-amber-500" size={32} /> : <AlertTriangle className="text-red-500" size={32} />}
                </div>

                <h2 className="text-xl font-light text-white mb-2">
                    {timedOut ? "No Matches Found" : "Analysis Interrupted"}
                </h2>
                <p className="text-white/50 text-sm max-w-xs mb-8 leading-relaxed">
                    {timedOut ? "We couldn't find a confident match for your request. Try adjusting your description." : error}
                </p>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-medium uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Return to Input</span>
                </button>
            </div>
        );
    }

    return (
        <V3SignalInterface
            phase={phase || 'idle'}
            onComplete={() => {
                // Guard: Only complete if results exist
                if (hasResults) {
                    onComplete();
                }
                // Otherwise, wait silently - V3SignalInterface will keep showing "Complete" status
            }}
            inputText={input.text}
        />
    );
}
