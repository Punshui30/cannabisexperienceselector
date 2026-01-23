import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { chat as conversationFacadeChat } from './conversationFacade';

/**
 * LIVE CONSULTANT (SYSTEM OVERLAY)
 * 
 * STRICT RULES:
 * - NOT a chatbot.
 * - NO emojis.
 * - NO pleasantries ("Sure!", "I can help with that").
 * - MAX 2-3 sentences.
 * - Tone: Clinical, authoritative, neutral.
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const SYSTEM_OVERLAY_PROMPT = `
[STRICT PROTOCOL: GUIDED OUTCOMES EXPERT OVERLAY]

You are the authoritative control node for the StrainMath™ engine. 
Your goal is to provide clinical-grade guidance and immediate engine adaptation.

CRITICAL REFLEX:
- If the user requests ANY change (add, remove, replace, shift effects, change time of day), you MUST append [[REFACTOR: query]] to your response.
- Example: "Adding Pinene for morning clarity. [[REFACTOR: add morning clarity component]]"
- Example: "Swapping Super Lemon Haze for Jack Herer. [[REFACTOR: replace Super Lemon Haze with Jack Herer]]"

EXPERT CONSTRAINTS:
1. ZERO PLEASANTRIES. No "Sure", "I can help", or "I understand".
2. NO EMOJIS.
3. CLINICAL TONE. Use terms like "chemotype," "entourage effect," and "metabolic arc."
4. MAX 2 SENTENCES. Prioritize the action over explanation.
5. NO INGESTION VERBS. Use "Onset," "Peak," "Release," or "Arc."
`.trim();


/**
 * Call the conversation facade with strict System Overlay constraints
 */
export async function callLLMChat(
    messages: ChatMessage[],
    context?: {
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        cardType?: 'primary' | 'secondary' | 'contextual';
    }
): Promise<{ text: string, data?: any }> {

    // Inject the System Overlay Persona at the root
    const strictMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_OVERLAY_PROMPT },
        ...messages
    ];

    return conversationFacadeChat(strictMessages, context);
}

/**
 * Trigger the heavy orchestrator (ONLY called when explicitly requested via chat)
 */
export async function triggerRefactor(
    query: string,
    context?: any
): Promise<any> {
    const { processIntent } = await import('./llmOrchestrator');
    const kind = context?.recommendation?.kind || 'blend';

    return processIntent(
        { text: query, mode: 'engine', kind },
        context || {},
        'blend-engine'
    );
}
