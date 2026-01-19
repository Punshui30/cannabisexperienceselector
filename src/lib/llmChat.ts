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
    try {
        // Build system message with context
        const systemMessage = buildSystemMessage(context);

        const response = await fetch('/api/llm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemMessage },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 500
            }),
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || data.message || 'I apologize, but I encountered an error. Please try again.';
    } catch (error) {
        console.error('LLM Chat Error:', error);
        return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
    }
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
