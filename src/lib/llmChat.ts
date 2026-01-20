import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { processIntent } from './llmOrchestrator';
import { Intelligence } from './merchantIntelligence';
import { generateLiveFeedCommentary } from './llmLiveFeedAdapter';

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
): Promise<{ text: string, data?: any }> {

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

        // Extract usable context
        // Extract usable context
        // PROMPT 3: Inject deep context into assistant session
        const assistantContext = context?.recommendation ? `
SYSTEM CONTEXT:
- CURRENT BLEND: "${context.recommendation.name}"
- CULTIVARS: ${context.recommendation.kind === 'blend' ? (context.recommendation as any).cultivars.map((c: any) => c.name).join(', ') : 'N/A'}
- ORIGINAL QUERY: "${context.userInput || 'General exploration'}"
- VARIANT TYPE: ${context.cardType || 'Primary'}

INSTRUCTION: 
Assume we are discussing THIS blend unless the user explicitly redirects. 
Provide conversational explanation, clarification, or help with refinement.
Do not ask them to restate context.
` : "SYSTEM CONTEXT: Global Assistant Mode. No specific blend selected.";

        const orchestratorContext = context?.recommendation && context.recommendation.kind === 'blend' ? {
            screen: 'BlendDetail',
            blendName: context.recommendation.name,
            blendConfig: context.recommendation,
            cultivars: context.recommendation.cultivars.map((c: any) => c.name)
        } : context?.recommendation && context.recommendation.kind === 'stack' ? {
            screen: 'StackDetail',
            blendName: context.recommendation.name,
            blendConfig: undefined, // Stacks don't have blend config
            cultivars: []
        } : undefined;

        const result = await processIntent({
            text: `${assistantContext}\n\nUSER MESSAGE: ${userText}`,
            kind: 'blend',
            mode: 'engine'
        }, orchestratorContext);

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

        // 3. CONSTRUCT ASSISTANT-MODE RESPONSE
        // PROMPT 2: Strictly conversational, no internal logs
        const responseText = result.analysis?.consultationScript || result.analysis?.reasoning || "I've updated the recommendations for you.";

        console.log("📝 RESPONSE GENERATED:", responseText);

        // 4. EVENT EMISSION (Downstream Intelligence)
        if (result.analysis?.outcomeCategory && result.data && result.data.length > 0) {
            const firstResult = result.data[0];
            generateLiveFeedCommentary({
                blendName: firstResult.name || 'Unnamed Blend',
                cultivars: firstResult.cultivars?.map((c: any) => c.name) || [],
                outcomeCategory: result.analysis.outcomeCategory,
                userInput: userText
            }).then(commentary => {
                if (commentary) {
                    Intelligence.logResolution({
                        inputMode: 'assisted',
                        inputText: userText,
                        blendId: firstResult.id || 'unknown',
                        blendName: firstResult.name || 'Unnamed Blend',
                        confidenceScore: 0.95,
                        componentSkus: firstResult.cultivars?.map((c: any) => c.name) || [],
                        outcomeCategory: (result.analysis?.outcomeCategory as any) || 'Other',
                        commentary: commentary
                    });
                    console.log("✅ EVENT EMITTED: Logged to Intelligence Layer with LLM Commentary");
                }
            });
        }

        console.groupEnd();

        return {
            text: responseText,
            data: result.data // Pass back the actual EngineResult[]
        };

    } catch (error) {
        if (error instanceof LiveAssistantError) {
            // Already logged, just re-throw
            throw error;
        }

        // Unexpected error
        console.error("❌ LLM CHAT ERROR:", error);
        console.error("ERROR:", error);
        console.groupEnd();

        // Return error response instead of throwing
        return {
            text: "I'm having trouble connecting to the engine right now. Please try again.",
            data: undefined
        };
    }
}
