import { IntentSeed, UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { VoiceFeedback } from './VoiceFeedback';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    onComplete: () => void;
    onRecalculate?: (feedback: string) => void;
}

export function ResolvingScreen({ input, recommendation, onComplete, onRecalculate }: ResolvingScreenProps) {
    // Directly render the VoiceFeedback component as the "Resolving" interface.
    // This replaces the previous animation with the Active Consultation mode.
    // When recommendation arrives (is non-null), VoiceFeedback uses it.

    return (
        <div className="relative w-full h-full bg-black z-50">
            <VoiceFeedback
                recommendationName={recommendation ? recommendation.name : "Finding your match..."}
                currentRecommendation={recommendation}
                onClose={onComplete}
                onRecalculate={onRecalculate}
            />
        </div>
    );
}
