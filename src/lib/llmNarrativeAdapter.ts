
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

### NAMING DISCIPLINE (STRICT)
Names must be **relatable, functional, and grounded**.

**ALLOWED PATTERNS:**
1. Functional + Context (e.g., "Calm Focus", "Social Ease", "Pain Relief")
2. Familiar Phrases (e.g., "Balanced Uplift", "Clear headed Calm")
3. Time-Based (e.g., "Morning Balance", "Nighttime Unwind")

**FORBIDDEN WORDS (Instant Fail):**
- No gemstones (Amethyst, Emerald, Ruby)
- No fantasy terms (Whisper, Dream, Ethereal, Mystic, Aura, Velvet)
- No poetic abstraction (Serene, Bliss, Nirvana, Zen)

**Examples:**
✅ VALID: "Social Focus", "Body Relief", "Evening Calm", "Creative Energy"
❌ INVALID: "Whispered Amethyst", "Velvet Dream", "Serene Sunrise", "Mystic Haze"

### CONTENT VISUALIZATION
- **Literal Nuance**: Reference specific concepts from the user's raw query (e.g., "first date", "verbal creativity", "nature walk") in the EXPLANATION, not the name.
- **Variant Distinction**:
    - Primary: Directly addresses the user's stated scenario.
    - Secondary: Explores an adjacent or deeper interpretation of the goal.
    - Contextual: Adapts to implied time, environment, or gentleness.
- **Tone**: Premium, clinical-yet-vibrant, authoritative but empathetic.
- **Body-Forward Specifics**: If user wants "couch lock", use terms like "physically grounded".

### SANITY CHECK
- If a name sounds like a perfume or a fantasy novel, REJECT IT.
- Use a boring functional name rather than a bad poetic one.
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

        // Clean markdown blocks and extract JSON
        content = content.replace(/```json/g, '').replace(/```/g, '');

        // Robust extraction: Find the first '{' and last '}'
        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1) {
            content = content.substring(firstOpen, lastClose + 1);
        }

        return JSON.parse(content) as NarrativeResult;

    } catch (e) {
        console.error('NARRATIVE ADAPTER: Failed to generate synergetic narratives', e);
        return null; // Fallback handled by orchestrator
    }
}
