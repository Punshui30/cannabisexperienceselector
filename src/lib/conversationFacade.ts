import { getEngineSnapshot, hasValidSnapshot } from './engineSnapshot';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';

/**
 * CONVERSATION FACADE
 * 
 * Purpose: Lightweight chat handler that bypasses the orchestrator.
 * 
 * This facade:
 * - Reads from engine snapshot (read-only)
 * - Calls api/llm.js directly
 * - Returns text only (no state mutations)
 * - Never throws errors (graceful fallback)
 * - Truncates history to prevent token overflow
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const MAX_HISTORY_MESSAGES = 10; // Prevent token overflow
const CHAT_TIMEOUT_MS = 30000; // 30 second timeout (increased from 10s)

/**
 * Main chat function - calls LLM directly with context from snapshot
 */
export async function chat(
    messages: ChatMessage[],
    context?: {
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        screen?: string;
    }
): Promise<{ text: string; data?: any }> {
    try {
        // 1. Truncate history to prevent token overflow
        const truncatedMessages = truncateHistory(messages);

        // 2. Build system context from snapshot or props
        const systemContext = buildSystemContext(context);

        // 3. Prepare messages for LLM
        const hasSpecializedSystem = messages.some(m => m.role === 'system');

        const llmMessages: ChatMessage[] = hasSpecializedSystem
            ? [
                ...truncatedMessages.map(m => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.role === 'system' ? `${m.content}\n\n[ENGINE CONTEXT]:\n${systemContext}` : m.content
                }))
            ]
            : [
                { role: 'system' as const, content: systemContext },
                ...truncatedMessages.map(m => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content
                }))
            ];

        console.log('[ConversationFacade] Calling LLM with', llmMessages.length, 'messages');

        // 4. Call api/llm.js directly with timeout
        const response = await callLLMWithTimeout(llmMessages);

        return {
            text: response,
            data: undefined // Chat is read-only, never returns data
        };

    } catch (error) {
        console.error('[ConversationFacade] Error:', error);
        // Graceful fallback - never crash
        return {
            text: "I'm having trouble processing that right now. Please try again or rephrase your question.",
            data: undefined
        };
    }
}

/**
 * Truncate message history to prevent token overflow
 */
function truncateHistory(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length <= MAX_HISTORY_MESSAGES) {
        return messages;
    }

    // Keep the most recent messages
    const truncated = messages.slice(-MAX_HISTORY_MESSAGES);
    console.log(`[ConversationFacade] Truncated history: ${messages.length} → ${truncated.length} messages`);
    return truncated;
}

/**
 * Build system context from snapshot or props
 */
function buildSystemContext(context?: {
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    userInput?: string;
    screen?: string;
}): string {
    const baseInstruction = `You are a Guided Outcomes Intelligence Node.
    
    TONE CONTROL:
    1. ZERO PLEASANTRIES. No "I can help", "Understood", or "Great question".
    2. TECHNICAL PRECISION. Use chemotype language (High-Myrcene, CBD:THC Ratios) over marketing terms.
    3. BREVITY. 1-2 sentence maximums for general queries. 
    4. PRACTICALITY. If preparation is mentioned, dictate the exact Grind, Packing, and Use protocol (Blended vs Sequential).

    SAFETY:
    1. NO ingestion methods (smoke/vape/edible). Use "Onset", "Release", or "Arc".
    
    MODIFICATIONS:
    Immediately trigger [[REFACTOR: query]] for any requested shift.`;

    // Priority 1: Use provided context (if viewing a specific blend)
    if (context?.recommendation) {
        const rec = context.recommendation;
        const cultivarNames = rec.kind === 'blend'
            ? rec.cultivars.map(c => c.name).join(', ')
            : 'N/A';

        return `${baseInstruction}

The user is currently viewing:
BLEND: "${rec.name}"
CULTIVARS: ${cultivarNames}
ORIGINAL QUERY: "${context.userInput || 'Not specified'}"
SCREEN: "${context.screen || 'Detail View'}"

Provide helpful, conversational explanations.`;
    }

    // Priority 2: Use snapshot if available (Strict Source of Truth)
    const snapshot = getEngineSnapshot();
    if (hasValidSnapshot() && snapshot.results && snapshot.results.length > 0) {
        const primaryResult = snapshot.results[0];

        // STRICT METADATA BLOCK
        let cultivars: string[] = [];

        if (primaryResult.kind === 'blend') {
            cultivars = primaryResult.cultivars?.map(c => c.name) || [];
        } else if (primaryResult.kind === 'stack') {
            cultivars = primaryResult.layers?.flatMap(l => l.cultivars.map(c => c.name)) || [];
        }

        const metadata = {
            blendId: primaryResult.kind === 'blend' ? primaryResult.id : primaryResult.stackId,
            blendName: primaryResult.name,
            cultivars: cultivars,
            engineTimestamp: snapshot.timestamp,
            snapshotHash: `${primaryResult.kind === 'blend' ? primaryResult.id : primaryResult.stackId}-${snapshot.timestamp}`
        };

        return `${baseInstruction}

        [SYSTEM STATE INVALIDATION PROTOCOL]
        Current Engine Snapshot:
        ${JSON.stringify(metadata, null, 2)}

        GUARDRAIL RULES:
        1. Never reference cultivars or blends unless they appear in the current engine snapshot above.
        2. If a user mentions a strain not in the snapshot, state clearly: "That strain is not currently compatible with the active blend state."
        3. Do not assume continuity if the snapshot ID changes.

        The user recently received these recommendations:
        PRIMARY BLEND: "${primaryResult.name}"
        CULTIVARS: ${metadata.cultivars.join(', ')}
        ORIGINAL QUERY: "${snapshot.inputs || 'Not specified'}"
        SCREEN: "${context?.screen || 'Results'}"

        Provide helpful, conversational explanations.`;
    }

    // Priority 3: Generic mode (no snapshot yet)
    return `${baseInstruction}

    CURRENT SCREEN: ${context?.screen || 'Unknown'}
    
    The user hasn't generated any recommendations yet. 
    If Screen is 'Input', help them formulate a query.
    If Screen is 'Library', assist with strain lookup.
    If Screen is 'Splash' or 'Entry', explain the system.
    
    Provide context-aware guidance.`;
}

/**
 * Call api/llm.js with timeout protection
 */
async function callLLMWithTimeout(messages: ChatMessage[]): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
        const response = await fetch('/api/llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: 'gpt-4-turbo',
                temperature: 0.7
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || 'I apologize, but I received an empty response.';

        return text;

    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            console.error('[ConversationFacade] Request timeout');
            return "I'm taking too long to respond. Please try again with a simpler question.";
        }

        throw error; // Re-throw for outer catch
    }
}
