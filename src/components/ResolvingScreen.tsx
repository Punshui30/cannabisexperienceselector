import { IntentSeed, UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { LiveConsultant } from './LiveConsultant';

interface ResolvingScreenProps {
    input: IntentSeed;
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    consultantText?: string;
    onComplete: () => void;
    onRecalculate?: (feedback: string) => void;
}

export function ResolvingScreen({ input, recommendation, consultantText, onComplete, onRecalculate }: ResolvingScreenProps) {
    return (
        <div className="relative w-full h-full bg-black z-50">
            <LiveConsultant
                consultantText={consultantText}
                onClose={onComplete}
            />
        </div>
    );
}
