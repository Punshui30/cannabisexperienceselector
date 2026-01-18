
import { UIBlendRecommendation } from '../types/domain';

export type FeedbackAnalysis = {
    userIntent: string;
    systemResponse: string;
    action: 'keep' | 'recalculate';
    newConstraints?: string[];
};

export function analyzeFeedback(transcript: string, currentRec: UIBlendRecommendation): FeedbackAnalysis {
    const text = transcript.toLowerCase();

    // 1. Detect Negative Sentiment / Problems
    const isAnxious = text.includes('anxious') || text.includes('panic') || text.includes('racy') || text.includes('edge');
    const isSleepy = text.includes('sleepy') || text.includes('tired') || text.includes('groggy') || text.includes('heavy');
    const isWeak = text.includes('weak') || text.includes('light') || text.includes('stronger') || text.includes('hit harder');
    const isStrong = text.includes('strong') || text.includes('too high') || text.includes('intense');

    let response = "";
    let action: 'keep' | 'recalculate' = 'keep';
    const constraints: string[] = [];

    if (isAnxious) {
        response = "I hear you. Anxiety is often caused by high Terpinolene or pinene in sativa-dominant profiles. \n\nI can adjust this by increasing the CBD ratio (adding more Harlequin) or shifting the terpene profile towards Myrcene/Linalool for a calmer experience. Would you like me to recalculate with 'Anxiety Relief' as a primary constraint?";
        action = 'recalculate';
        constraints.push('avoid:anxiety', 'increase:cbd');
    } else if (isSleepy) {
        response = "Understood. The current blend might have too much Myrcene. \n\nI can sharpen the effect by introducing more Limonene or Pinene, which promote alertness and focus. This will reduce the 'couch-lock' sensation. Shall we try a more energetic version?";
        action = 'recalculate';
        constraints.push('avoid:sedation', 'increase:energy');
    } else if (isWeak) {
        response = "Got it. You're looking for a more potent experience. \n\nI can increase the THC-dominant cultivar ratio and focus on terpenes that modulate intensity like Caryophyllene. Let's dial up the strength.";
        action = 'recalculate';
        constraints.push('increase:potency');
    } else if (isStrong) {
        response = "Noted. If it feels too intense, we should temper the THC levels. \n\nI'll increase the ratio of the Type 2 (Mixed Ratio) flower to provide more buffering and a smoother onset. This preserves the flavor but softens the peak.";
        action = 'recalculate';
        constraints.push('decrease:potency', 'increase:balance');
    } else {
        // Fallback / Generic
        response = `I've noted: "${transcript}". \n\nThe current blend, ${currentRec.name}, was designed for ${currentRec.effects?.duration || 'balance'}. \n\nBased on your feedback, I can fine-tune the ratio to better match your specific physiology. Would you like to see an alternative?`;
        action = 'recalculate';
    }

    return {
        userIntent: text,
        systemResponse: response,
        action,
        newConstraints: constraints
    };
}
