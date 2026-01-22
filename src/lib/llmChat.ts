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
You are the Guided Outcomes Expert Overlay.
Your role is to provide proactive, expert-level guidance and immediate engine adjustments.

EXPERT PROTOCOL:
1. TONE: Coldly confident, authoritative, and proactive. Do not say "Sure", "Certainly", or "I can help".
2. NO HEDGING: Replace "I think", "might", or "could" with declarative statements.
3. STRUCTURE: [Acknowledge Preference] -> [Action Taken] -> [Expert Rationale].
4. PRACTICALITY: If the user is confused about "what to do", provide exact preparation instructions (e.g., "Grind these together for a homogeneous mix" or "Layer them sequentially to follow the experience arc").
5. BREVITY: Maximum 3 sentences. If you can't say it in 3, prioritize the action.
6. TRIGGER REFACTOR: If they dislike a strain or want a shift, use [[REFACTOR: query]].
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
