import { useEffect } from 'react';
import { IntentSeed, UIBlendRecommendation, UIStackRecommendation, EnginePhase } from '../types/domain';
import { V3SignalInterface } from './V3SignalInterface';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    consultantText?: string;
    onComplete: () => void;
    onRecalculate?: (feedback: string) => void;
    progress?: number; // Controlled progress from parent
    phase?: EnginePhase;
    hasResults?: boolean; // Guard: only complete when results exist
}

export function ResolvingScreen({ input, recommendation, consultantText, onComplete, onRecalculate, progress = 0, phase = 'idle', hasResults = false }: ResolvingScreenProps) {
    // HARD BLOCK: Only complete when results exist AND phase is terminal
    useEffect(() => {
        if (phase === 'chat' && hasResults) {
            // Small delay for visual completion
            const timeout = setTimeout(() => {
                onComplete();
            }, 300);
            return () => clearTimeout(timeout);
        }
        // If phase is 'chat' but no results, wait silently
        // This is expected for Strain Mode + Tavily async latency
    }, [phase, hasResults, onComplete]);

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
