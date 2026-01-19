import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Call the OpenAI API endpoint for chat completions
 */
export async function callLLMChat(
    messages: ChatMessage[],
    context?: {
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        cardType?: 'primary' | 'secondary' | 'contextual';
    }
): Promise<string> {
    // FORCE SIMULATION (API Bypass)
    return simulateLLM(messages, context);

    /* API LOGIC DISABLED FOR STATIC DEPLOYMENT
    try {
        // ... (existing code)
    } catch (error) { ... }
    */
}

/**
 * Fallback Simulation for Demo/Offline Mode
 */
function simulateLLM(messages: ChatMessage[], context?: any): Promise<string> {
    return new Promise(resolve => {
        setTimeout(() => {
            const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
            const blendName = context?.recommendation?.name || 'this blend';
            const reasoning = context?.recommendation?.reasoning || 'your preferences';

            // DYNAMIC RESPONSE GENERATION
            if (lastUserMsg.includes('anxious') || lastUserMsg.includes('anxiety')) {
                resolve(`I adjusted specifically for that. We balanced the euphoric profile of ${blendName} with calming terpenes like Caryophyllene to prevent any edge. This ensures you get the lift without the racey feeling.`);
            } else if (lastUserMsg.includes('sleep') || lastUserMsg.includes('tired')) {
                resolve(`Good catch. While ${blendName} is designed to be functional (${reasoning}), I can increase the Myrcene levels to make it a dedicated sleep stack. Would you like a "Deep Sleep" variation?`);
            } else if (lastUserMsg.includes('energy') || lastUserMsg.includes('focus')) {
                resolve(`I focused on clarity here. By limiting Myrcene and boosting Limonene, I prioritized the "Clear-headed" aspect you asked for. This should keep you sharp for your ${context?.userInput || 'activity'}.`);
            } else if (lastUserMsg.includes("why") || lastUserMsg.includes("how")) {
                resolve(`I designed this based on your request for "${context?.userInput || 'your specific intent'}". I balanced the potent cannabinoids with a grounding terpene profile to satisfy that goal while maintaining control.`);
            } else {
                resolve(`That's a great question. For ${blendName}, I specifically looked for a profile that matched "${context?.userInput || 'your intent'}". I avoided anything too heavy to keep it consistent with your goal.`);
            }
        }, 1500);
    });
}

/**
 * Build system message with blend context
 */
function buildSystemMessage(context?: {
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
    userInput?: string;
    cardType?: 'primary' | 'secondary' | 'contextual';
}): string {
    if (!context?.recommendation) {
        return 'You are a cannabis consultant helping users understand their recommendations. Be concise, helpful, and knowledgeable.';
    }

    const rec = context.recommendation;
    const cardTypeLabel = context.cardType === 'primary' ? 'primary recommendation' :
        context.cardType === 'secondary' ? 'alternative approach' :
            context.cardType === 'contextual' ? 'experimental variant' : 'recommendation';

    if (rec.kind === 'blend') {
        const blend = rec as UIBlendRecommendation;
        const cultivarDetails = blend.cultivars
            .map(c => `${c.name} (${Math.round(c.ratio * 100)}%, ${c.profile})`)
            .join(', ');

        const terpenes = blend.cultivars
            .flatMap(c => c.prominentTerpenes || [])
            .filter((t, i, arr) => arr.indexOf(t) === i)
            .join(', ');

        return `You are a cannabis consultant helping a user understand their ${cardTypeLabel}.

BLEND DETAILS:
- Name: ${blend.name}
- Cultivars: ${cultivarDetails}
- Match Score: ${blend.matchScore}%
- Reasoning: ${blend.reasoning || 'Balanced blend for desired effects'}
- Prominent Terpenes: ${terpenes || 'Various'}
- Effects: Onset ${blend.effects?.onset || 'N/A'}, Peak ${blend.effects?.peak || 'N/A'}, Duration ${blend.effects?.duration || 'N/A'}

${context.userInput ? `Original User Request: "${context.userInput}"` : ''}

INSTRUCTIONS:
- Answer questions about this specific blend
- Explain ratios, cultivar choices, and effects
- Suggest adjustments if requested
- Be concise (2-3 sentences max)
- Use accessible language, not overly technical
- Reference the specific cultivars and ratios when relevant`;
    } else {
        const stack = rec as UIStackRecommendation;
        return `You are a cannabis consultant helping a user understand their stack recommendation: "${stack.name}".

STACK DETAILS:
- Description: ${stack.description}
- Match Score: ${stack.matchScore}%
- Reasoning: ${stack.reasoning || 'Multi-phase protocol'}

Answer questions concisely and helpfully about this stack.`;
    }
}
