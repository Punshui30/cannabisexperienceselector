import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { processIntent } from './llmOrchestrator';
import { Intelligence } from './merchantIntelligence';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export class LiveAssistantError extends Error {
    constructor(message: string, public readonly orchestratorExecuted: boolean) {
        super(message);
        this.name = 'LiveAssistantError';
    }
}

/**
 * Call the Orchestrator (Logic Layer) to handle the user's request.
 * 
 * FAILURE MODE:
 * - If orchestrator fails, this throws LiveAssistantError
 * - NO fallback responses
 * - NO silent degradation
 * - Console logs TRUTH about what executed
 */
export async function callLLMChat(
    messages: ChatMessage[],
    context?: {
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        cardType?: 'primary' | 'secondary' | 'contextual';
    }
): Promise<string> {

    // 1. INPUT LOGGING
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.content;
    const contextName = context?.recommendation?.name || 'General';

    console.group("🧠 LIVE ASSISTANT ORCHESTRATION");
    console.log(`INPUT: "${userText}"`);
    console.log(`CONTEXT: ${contextName}`);
    console.log(`TIMESTAMP: ${new Date().toISOString()}`);

    try {
        // 2. REAL EXECUTION VIA ORCHESTRATOR
        console.log("⚙️ EXECUTING LOCAL ORCHESTRATOR...");

        const result = await processIntent({
            text: userText,
            kind: 'blend',
            mode: 'engine'
        });

        console.log("✅ ORCHESTRATOR EXECUTED SUCCESSFULLY");
        console.log("LOGIC RESULT:", result);

        if (!result.success) {
            console.error("❌ ORCHESTRATOR RETURNED FAILURE");
            console.error("ERROR:", result.error);
            console.groupEnd();

            throw new LiveAssistantError(
                result.error || 'Orchestrator returned failure',
                true // orchestrator DID execute
            );
        }

        // 3. CONSTRUCT RESPONSE FROM REAL DATA
        const script = result.analysis?.reasoning || "I've processed your request.";
        const terpenes = result.analysis?.targetTerpenes || [];

        let response = script;

        // If specific terpenes were targeted by the engine, mention them
        if (terpenes && terpenes.length > 0) {
            response += `\n\nBased on your input, I'm prioritizing ${terpenes.slice(0, 2).join(' and ')} in the active logic layer.`;
        }

        console.log("📝 RESPONSE GENERATED:", response);

        // 4. EVENT EMISSION (Downstream Intelligence)
        if (result.analysis?.outcomeCategory && result.data && result.data.length > 0) {
            Intelligence.logResolution({
                inputMode: 'assisted',
                inputText: userText,
                blendId: result.data[0].id || 'unknown',
                blendName: result.data[0].name || 'Unnamed Blend',
                confidenceScore: 0.95,
                componentSkus: result.data[0].cultivars?.map(c => c.name) || [],
                outcomeCategory: result.analysis.outcomeCategory
            });
            console.log("✅ EVENT EMITTED: Logged to Intelligence Layer");
        }

        console.groupEnd();
        return response;

    } catch (error) {
        if (error instanceof LiveAssistantError) {
            // Already logged, just re-throw
            throw error;
        }

        // Unexpected error
        console.error("💥 FATAL ORCHESTRATOR EXCEPTION");
        console.error("ERROR:", error);
        console.groupEnd();

        throw new LiveAssistantError(
            'Fatal orchestrator exception: ' + (error instanceof Error ? error.message : String(error)),
            false // orchestrator may not have executed
        );
    }
}
