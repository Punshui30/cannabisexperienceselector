
import { EngineResult, IntentSpec } from '../types/domain';

const LLM_ENDPOINT = '/api/llm';

/**
 * NARRATIVE ADAPTER
 * 
 * Responsibilities:
 * 1. Generate vivid, experiential names for all 3 variants.
 * 2. Generate detailed "Why This Blend" explanations.
 * 3. Reference specific user query concepts (literal matching).
 * 4. Maintain STRICT FACTUAL INTEGRITY (no engine math changes).
 */

const NARRATIVE_SYSTEM_PROMPT = `
You are the Experiential Narrative Engine for StrainMath™.
Your job is to generate grounded, dispensary-style names and clear explanations for cannabis blends.

NAMING DISCIPLINE (STRICT)
Names must be relatable, functional, and grounded.

ALLOWED PATTERNS:
1. Functional + Context (e.g., "Calm Focus", "Social Ease", "Pain Relief")
2. Familiar Phrases (e.g., "Balanced Uplift", "Clear headed Calm")
3. Time-Based (e.g., "Morning Balance", "Nighttime Unwind")

FORBIDDEN WORDS (Instant Fail):
- No gemstones (Amethyst, Emerald, Ruby)
- No fantasy terms (Whisper, Dream, Ethereal, Mystic, Aura, Velvet)
- No poetic abstraction (Serene, Bliss, Nirvana, Zen)

Examples:
VALID: "Social Focus", "Body Relief", "Evening Calm", "Creative Energy"
INVALID: "Whispered Amethyst", "Velvet Dream", "Serene Sunrise", "Mystic Haze"

CONTENT VISUALIZATION
- Literal Nuance: Reference specific concepts from the user's raw query (e.g., "first date", "verbal creativity", "nature walk") in the EXPLANATION, not the name.
- Variant Distinction (STRICT):
    - Primary: THE ANSWER. Frame this as the definitive recommendation. It satisfies the user's intent most directly.
    - Secondary: THE OPTION. Frame this as "If you prefer..." or "A different approach...".
    - Contextual: THE SITUATIONAL ALTERNATIVE. Frame this as "For later..." or "If the setting changes...".
- Tone: Premium, clinical-yet-vibrant, authoritative but empathetic.
- Body-Forward Specifics: If user wants "couch lock", use terms like "physically grounded".

CRITICAL OUTPUT RULES
- You must respond with VALID JSON ONLY.
- DO NOT use markdown code blocks (no \`\`\`).
- DO NOT use headings or intro text.
- JUST THE JSON OBJECT.
`.trim();

export interface NarrativeResult {
    primary: { name: string; explanation: string };
    secondary: { name: string; explanation: string };
    contextual: { name: string; explanation: string };
}

export async function generateNarratives(
    userInput: string,
    intent: IntentSpec,
    variants: { primary: EngineResult; secondary: EngineResult; contextual: EngineResult }
): Promise<NarrativeResult | null> {

    const promptInput = {
        userInput,
        intent,
        blends: {
            primary: {
                cultivars: (variants.primary.cultivars || []).map(c => c.name),
                metrics: variants.primary.blendEvaluation?.breakdown || {}
            },
            secondary: {
                cultivars: (variants.secondary.cultivars || []).map(c => c.name),
                metrics: variants.secondary.blendEvaluation?.breakdown || {}
            },
            contextual: {
                cultivars: (variants.contextual.cultivars || []).map(c => c.name),
                metrics: variants.contextual.blendEvaluation?.breakdown || {}
            }
        }
    };

    const MAX_RETRIES = 1;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const messages = [
                { role: "system", content: NARRATIVE_SYSTEM_PROMPT },
                { role: "user", content: `Generate narratives for this request:\n\n${JSON.stringify(promptInput, null, 2)}` }
            ];

            // If this is a retry, append the error context to force correction
            if (attempt > 0) {
                console.warn(`NARRATIVE ADAPTER: Retrying generation (Attempt ${attempt + 1})`);
                messages.push({
                    role: "user",
                    content: "The previous response was NOT valid JSON. Please generate ONLY the raw JSON object. No markdown."
                });
            }

            const response = await fetch(LLM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-4-turbo',
                    messages,
                    temperature: 0.7
                })
            });

            if (!response.ok) throw new Error(`Narrative API failed: ${response.status}`);

            const data = await response.json();
            let content = data.choices?.[0]?.message?.content;
            if (!content) throw new Error("No narrative content received");

            // Clean markdown blocks just in case they ignored the rule
            content = content.replace(/```json/g, '').replace(/```/g, '');

            // Robust extraction: Find the first '{' and last '}'
            const firstOpen = content.indexOf('{');
            const lastClose = content.lastIndexOf('}');

            if (firstOpen !== -1 && lastClose !== -1) {
                content = content.substring(firstOpen, lastClose + 1);
            }

            let parsed = JSON.parse(content);

            // AUTO-CORRECTION: Handle common wrapping errors
            if (parsed.blends) parsed = parsed.blends;
            if (parsed.responses) parsed = parsed.responses;
            if (parsed.variants) parsed = parsed.variants;

            // VALIDATION: Ensure keys exist
            if (parsed && parsed.primary && parsed.secondary && parsed.contextual) {
                return parsed as NarrativeResult;
            }
            console.warn('NARRATIVE ADAPTER: partial JSON received, missing keys', Object.keys(parsed || {}));
            // Continue to retry loop if validation fails
            throw new Error("Missing specific variant keys in JSON");

        } catch (e: any) {
            console.warn(`NARRATIVE ADAPTER: Attempt ${attempt + 1} failed:`, e.message);

            if (attempt === MAX_RETRIES) {
                console.error('NARRATIVE ADAPTER: Failed to generate synergetic narratives after retries', e);
                return null; // Fallback handled by orchestrator
            }
        }
    }

    return null;
}

const CONVERSATION_SYSTEM_PROMPT = `
You are the StrainMath™ Expert Guided outcomes Consultant.
Your role is to provide proactive, elite-level guidance on cannabis chemotypes and experience architecture.

CONSULTANT PROTOCOL:
1. Tone: Expert, boutique, confident. Use precise functional language.
2. Structure: Acknowledge the user's intent, perform any analysis, then explain the expert rationale.
3. Keep it brief: Max 2 sentences unless the user requests technical depth.
4. Authority: You are the primary intelligence for this session. Guide the user toward optimal outcomes.
`.trim();

export async function generateConversationalResponse(
    userInput: string,
    context?: string
): Promise<string> {
    try {
        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: "system", content: CONVERSATION_SYSTEM_PROMPT },
                    { role: "user", content: `User: "${userInput}"\nContext: ${context || 'General Chat'}` }
                ],
                temperature: 0.5
            })
        });

        if (!response.ok) return "I'm having trouble connecting to the network right now.";

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I heard you, but I'm not sure what to say.";

    } catch (e) {
        console.error("CONVERSATIONAL ADAPTER FAILED", e);
        return "I'm having a brief connection issue. Please try again.";
    }
}
