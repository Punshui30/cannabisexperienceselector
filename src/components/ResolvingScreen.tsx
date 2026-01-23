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
}

export function ResolvingScreen({ input, recommendation, consultantText, onComplete, onRecalculate, progress = 0, phase = 'idle' }: ResolvingScreenProps) {
    // Auto-complete when progress reaches 100% (legacy compatibility)
    useEffect(() => {
        if (progress >= 100 && phase === 'chat') {
            console.log('[ResolvingScreen_V9.0] Terminal phase detected, transitioning...');
            const timeout = setTimeout(() => {
                onComplete();
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [progress, phase, onComplete]);

    return (
        <V3SignalInterface
            phase={phase || 'idle'}
            onComplete={onComplete}
            inputText={input.text}
        />
    );
}
