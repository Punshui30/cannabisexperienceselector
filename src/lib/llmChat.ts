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
            if (lastUserMsg.includes('anxious') || lastUserMsg.includes('anxiety') || lastUserMsg.includes('paranoid')) {
                resolve("I understand your concern. To mitigate anxiety, we can prioritize cultivars high in CBD and Caryophyllene, which offers a calming, grounding effect. Would you like me to adjust the blend to be more 'Mellow'?");
            } else if (lastUserMsg.includes('sleep') || lastUserMsg.includes('tired')) {
                resolve("The current blend has some Myrcene, but we can boost it further for better sedation. I can swap the primary cultivar for something heavier like Granddaddy Purple. Shall I do that?");
            } else if (lastUserMsg.includes('energy') || lastUserMsg.includes('focus')) {
                resolve("For more energy, we should look at Limonene-dominant profiles. I can bring the Sativa ratio up to 80% to sharpen the experience. Sound good?");
            } else {
                resolve("That's a valid point. This system optimizes for your intent, but I can fine-tune the terpene profile if you prefer a different flavor or onset time. What would you like to change?");
            }
        }, 1200);
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
