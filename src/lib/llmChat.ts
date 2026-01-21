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
You are the Guided Outcomes System Overlay.
You are NOT a conversational AI. You are a functional interface layer.

RULES:
1. MAX 3 sentences per response.
2. NO EMOJIS.
3. NO fillers (e.g. "Sure", "I understand", "Let me check").
4. Tone: Analytical, dry, confident.
5. If the user asks for an adjustment, acknowledge it as a command: "Updating parameters for [intent]."
6. If the user asks a question, answer efficiently.
7. AUTHORITY: Treat the Primary Blend as the definitive answer. Treat others as optional explorations.
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
    return processIntent(
        { text: query, mode: 'engine', kind: 'blend' },
        context || {},
        'blend-engine'
    );
}
