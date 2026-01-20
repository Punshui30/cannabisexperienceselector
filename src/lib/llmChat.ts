import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { chat as conversationFacadeChat } from './conversationFacade';

/**
 * LIVE ASSISTANT CHAT (CONVERSATION FACADE)
 * 
 * This is now a lightweight wrapper around the conversation facade.
 * It NO LONGER calls the orchestrator or mutates engine state.
 * 
 * Purpose:
 * - Read-only chat interface
 * - Direct LLM calls via api/llm.js
 * - Graceful error handling
 * - No state mutations
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Call the conversation facade for lightweight chat
 */
export async function callLLMChat(
    messages: ChatMessage[],
    context?: {
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        cardType?: 'primary' | 'secondary' | 'contextual';
    }
): Promise<{ text: string, data?: any }> {
    console.log('[llmChat] Routing to conversation facade');

    // Route to conversation facade (read-only, lightweight)
    return conversationFacadeChat(messages, context);
}

/**
 * Trigger the heavy orchestrator (ONLY called when explicitly requested via chat)
 */
export async function triggerRefactor(
    query: string,
    context?: any
): Promise<any> {
    console.log('[llmChat] Triggering AUTHORITATIVE REFACTOR with query:', query);

    // Dynamic import to avoid circular dependency in standard chat path
    const { processIntent } = await import('./llmOrchestrator');

    // Call the engine
    return processIntent(
        { text: query, mode: 'engine' },
        context || {},
        'blend-engine'
    );
}
