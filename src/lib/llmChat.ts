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
Your role is to provide proactive, expert-level guidance on cannabis experiences and immediate engine adjustments.

EXPert PROTOCOL:
1. Tone: Expert, confident, proactive. Avoid corporate hedging.
2. Structure: Acknowledge the user's need, perform the action, then explain the expert rationale.
3. Keep it brief: Max 3 sentences.
4. If a user expresses a preference or dislike (e.g. "I don't like Bubba Kush"), treat it as a command for immediate replacement.
5. Authority: The Primary Blend is the definitive solution; others are secondary explorations.
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
