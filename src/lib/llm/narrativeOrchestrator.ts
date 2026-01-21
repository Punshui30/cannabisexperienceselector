
/**
 * NARRATIVE ORCHESTRATOR
 * 
 * Manages the "Claude First, GPT Fallback" strategy.
 * Ensures the user always gets a narrative, even if the primary provider fails.
 */

import { generateNarrative as generateClaude, ClaudeNarrativeInput } from './claudeNarrator';
import { generateGptNarrative } from './gptNarrator';

export interface NarrativeResult {
    text: string;
    provider: 'claude' | 'gpt';
    error?: string; // If Claude failed, log why
}

export async function orchestrateNarrative(input: ClaudeNarrativeInput): Promise<NarrativeResult | null> {

    // 1. Try Claude (Primary)
    try {
        const claudeText = await generateClaude(input);
        if (claudeText) {
            return {
                text: claudeText,
                provider: 'claude'
            };
        }
    } catch (claudeError: any) {
        // Log purely for observability, do not surface to UI
        console.info(`NARRATIVE: Claude provider failed. Switching to fallback. Reason: ${claudeError.message}`);
    }

    // 2. Fallback to GPT (Secondary)
    try {
        const gptText = await generateGptNarrative(input);
        if (gptText) {
            return {
                text: gptText,
                provider: 'gpt'
            };
        }
    } catch (gptError) {
        console.error("NARRATIVE: Critical - All providers failed.", gptError);
    }

    return null;
}
