
import { Decision } from '../types/decision';
import { IntentSeed } from '../types/domain';

const LLM_ENDPOINT = '/api/llm';

const SYSTEM_PROMPT = `
You are the Decision Matrix for the StrainMath™ Live Assistant.
Your ONLY job is to classify the user's input to determine the system's "Next Action".
Do NOT answer the user. Do NOT generate narratives.
Output a strict JSON object matching this schema:

{
  "intent": "generate_blend" | "refine_blend" | "explain_concept" | "answer_question" | "handle_greeting" | "handle_error" | "unknown",
  "requires_engine_mutation": boolean,
  "requires_user_confirmation": boolean,
  "requires_clarification": boolean,
  "target_entities": string[],
  "response_mode": "action_then_explain" | "narrative_only" | "silent_action",
  "confidence": "high" | "medium" | "low",
  "reasoning": "Brief chain of thought why this decision was made"
}

CLARIFICATION GATE LOGIC (STRICT):
Set "requires_clarification": true ONLY if ALL these conditions are met:
1. User input references a specific strain, experience, or past usage.
2. Language implies inconsistency, variability, or unreliability (e.g., "sometimes", "batch to batch", "hit or miss", "inconsistent").
3. Directional signal is MISSING or INSUFFICIENT.
   - Directional signal examples: "too strong", "too weak", "want more energy", "less anxiety".
   - If user says "I want [X] but [Y] is too strong", directional signal is PRESENT -> requires_clarification: false.
   - If user says "I use [X] but it's inconsistent" (without saying HOW it's inconsistent or what they want instead) -> requires_clarification: true.
4. "requires_engine_mutation" must also be true.

LOGIC RULES:
1. **Mutation Triggers** (requires_engine_mutation: true):
   - User expresses a need/desire for a product/experience (e.g., "I need sleep", "Something for pain").
   - User mentions specific strains or brands (e.g., "White Gummy by Don Murphy", "Blue Dream"). This ALWAYS requires a blend generation.
   - **Evidence Context**: If "External Verify Evidence" is provided, use it to confirm if an entity is a valid cannabis product. If confirmed, ALWAYS set requires_engine_mutation: true.
   - User critiques current results (e.g., "Too sleepy", "Not strong enough").
   - User mentions specific strains to add/remove.

2. **Non-Mutation Triggers** (requires_engine_mutation: false):
   - Educational questions (e.g., "What is limonene?", "Why implies this?").
   - General chat/greetings.
   - Clarifications that don't change the goal.

3. **Response Modes**:
   - "action_then_explain": Standard for new blends or refinements.
   - "narrative_only": Standard for questions/greetings.

4. **Entities**: 
   - Extract EVERYTHING that looks like a product name, strain name (e.g. "White Gummy"), or brand name (e.g. "Don Murphy").
   - If a user says "I want [Product]", intent MUST be "generate_blend" and the product name MUST be in "target_entities".
`;

export async function decideAction(
    seed: IntentSeed,
    context?: {
        currentBlendName?: string,
        screen?: string,
        evidence?: any,
        contextBound?: boolean,
        stackMode?: boolean,
        activeEntityId?: string
    }
): Promise<Decision> {
    const inputText = seed.text || "";

    // 0. QUICK CHECK: Empty input
    if (!inputText || inputText.length < 2) {
        return createFallbackDecision("Input too short");
    }

    // 1. SPECIAL CASE: Stack Mode (Context-Bound Mutations)
    // When assistant is opened in stack context, default to stack augmentation
    if (context?.stackMode) {
        console.log('[DECISION] Stack mode activated - prioritizing stack augmentation');

        // Check if user wants to create something new (opt-out of context)
        if (inputText.match(/(new|create|separate|different|another|from scratch)/i)) {
            console.log('[DECISION] User opted out of stack context - proceeding with normal logic');
        } else {
            // Force stack augmentation for modification requests
            const modificationKeywords = /(add|change|modify|adjust|extend|append|layer|phase|morning|wake|evening|night|sleep)/i;

            if (modificationKeywords.test(inputText) || inputText.includes('AUGMENT_STACK:')) {
                console.log('[DECISION] Stack augmentation detected');
                return {
                    intent: 'augment_stack',
                    requires_engine_mutation: true,
                    requires_user_confirmation: false,
                    target_entities: [context.activeEntityId || ''],
                    response_mode: 'action_then_explain',
                    confidence: 'high',
                    reasoning: `Stack augmentation requested for stack ${context.activeEntityId}`
                };
            }
        }
    }

    // 2. SPECIAL CASE: Image Input (Vision API)
    // If user uploaded an image, ALWAYS trigger engine mutation
    if (seed.image) {
        console.log('[DECISION] Image input detected - forcing engine mutation');
        return {
            intent: 'generate_blend',
            requires_engine_mutation: true,
            requires_user_confirmation: false,
            target_entities: [],
            response_mode: 'action_then_explain',
            confidence: 'high',
            reasoning: 'Image input detected - extracting strain data from product label'
        };
    }

    try {
        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `User Input: "${inputText}"
Context: Screen=${context?.screen || 'N/A'}, CurrentBlend=${context?.currentBlendName || 'None'}
External Verify Evidence: ${context?.evidence ? JSON.stringify(context.evidence) : "None"}
Mode: ${seed.mode}`
                    }
                ],
                temperature: 0.1 // Deterministic
            })
        });

        if (!response.ok) {
            console.warn('DECISION KERNEL: API Failure', response.status);
            return createFallbackDecision(`API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No content received");

        // Clean markdown
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const decision = JSON.parse(content) as Decision;

        // Safety Fallback: Ensure critical fields exist
        if (typeof decision.requires_engine_mutation !== 'boolean') {
            decision.requires_engine_mutation = true; // Default to safe mutation if unsure
        }

        return decision;

    } catch (e) {
        console.error('DECISION KERNEL: Parsing failed', e);
        return createFallbackDecision("Parsing Failure");
    }
}

function createFallbackDecision(reason: string): Decision {
    return {
        intent: 'generate_blend', // Default to action to be safe/responsive
        requires_engine_mutation: true,
        requires_user_confirmation: false,
        target_entities: [],
        response_mode: 'action_then_explain',
        confidence: 'low',
        reasoning: `Fallback triggered: ${reason}`
    };
}
