
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
Your job is to generate vivid, premium names and explanations for cannabis blends.

### INPUTS
You will receive:
1. The user's original raw query.
2. The parsed intent (effects, constraints).
3. Data for 3 distinct blends (Primary, Secondary, Contextual).

### OUTPUT SCHEMA
You MUST return a strict JSON object with exactly this structure:
{
  "primary": { "name": "...", "explanation": "..." },
  "secondary": { "name": "...", "explanation": "..." },
  "contextual": { "name": "...", "explanation": "..." }
}

### CONTENT RULES
- **Experiential Names**: Use vivid, verb-driven, or scenic language of the outcome (e.g., "Sunlit Focus", "Grounded Presence", "Midnight Solitude").
- **Literal Nuance**: You MUST reference specific concepts from the user's raw query (e.g., "first date", "verbal creativity", "nature walk").
- **Variant Distinction**:
    - Primary: Directly addresses the user's stated scenario.
    - Secondary: Explores an adjacent or deeper interpretation of the goal.
    - Contextual: Adapts to implied time, environment, or gentleness.
- **Tone**: Premium, clinical-yet-vibrant, authoritative but empathetic.
- **Avoid**: Clichés like "direct match", "perfect for you", or generic effect labels.

### FACTUAL INTEGRITY (NON-NEGOTIABLE)
- DO NOT reorder cultivars.
- DO NOT invent new effects or chemistry.
- Reference the cultivars named in the input to explain WHY they work for THIS user.
`;

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

    try {
        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: "system", content: NARRATIVE_SYSTEM_PROMPT },
                    { role: "user", content: `Generate narratives for this request:\n\n${JSON.stringify(promptInput, null, 2)}` }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`Narrative API failed: ${response.status}`);

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("No narrative content received");

        // Clean markdown blocks
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(content) as NarrativeResult;

    } catch (e) {
        console.error('NARRATIVE ADAPTER: Failed to generate synergetic narratives', e);
        return null; // Fallback handled by orchestrator
    }
}
