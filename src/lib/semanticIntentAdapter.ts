
import { IntentSeed, IntentSpec } from '../types/domain';

const LLM_ENDPOINT = '/api/llm';

/**
 * SEMANTIC INTENT ADAPTER
 * 
 * Responsibilities:
 * 1. Parse raw user input (text/presets)
 * 2. normalize synonyms (e.g. "jittery" -> "anxiety")
 * 3. Extract key constraints
 * 4. Return typed IntentSpec
 * 
 * CORRECTION HANDLING:
 * - If user text implies a correction (e.g. "I said", "Actually", "No"), DISCARD previous specific weights and replace them.
 * - Do not "average" corrections with previous intent.
 * 
 * CONSTRAINTS:
 * - NO generation of blends
 * - NO invention of data
 * - STRICT JSON output
 */

const SYSTEM_PROMPT = `
You are the Semantic Intent Adapter for StrainMath™.
Your ONLY job is to extract usage intent and constraints from user input.
You DO NOT generate recommendations. You DO NOT invent strains.

Output a strict JSON object matching this schema:
{
  "targetEffects": string[], // ["focus", "calm", "sleep", "energy", "social", "creative", "pain_relief"]
  "avoidEffects": string[], // ["anxiety", "paranoia", "sedation", "munchies", "couch_lock"]
  "terpenePreferences": {
    "include": string[], // ["Limonene", "Pinene", "Myrcene", "Caryophyllene", "Linalool", "Humulene", "Terpinolene", "Ocimene"]
    "exclude": string[]
  },
  "constraints": {
    "timeOfDay": "morning" | "afternoon" | "evening" | "night",
    "experienceLevel": "new" | "regular" | "experienced",
    "sensitivity": "low" | "medium" | "high" 
  },
  "confidenceScore": number, // 0.0 to 1.0
  "cultivarExclusions": string[], // Names or IDs (e.g., "Bubba Kush") the user explicitly dislikes
  "consultationScript": string, // Expert response following 'Acknowledge, Act, Then Explain' pattern
  "reasoning": string // Brief explanation of extraction (max 1 sentence)
}

RULES:
- Map synonyms to standard effects (e.g., "racy" -> avoid: "anxiety", "uplifting" -> target: "mood").
- **Consultation Script (Critical)**: Create a proactive, expert-level response. Use 'Acknowledge, Act, Then Explain'. 
  Example for dislike: "I'll swap Bubba Kush for a functionally similar profile. I'm prioritizing clear mental states while keeping the physical relaxation you requested."
- **Exclusion Extraction**: If the user dislikes a strain or wants to replace it, add that strain name to 'cultivarExclusions'.
- **Correction Handling**: If the user text implies a correction, you must DISCARD the previous intent vector for that parameter and replace it with the new value.
- Allow simultaneous cognitive targets (e.g., "clear mind", "focus") and physical sedation.
- If input is vague, set confidenceScore low (< 0.6).
- If specific terpenes are mentioned, map them to 'include'.
- infer 'timeOfDay' if implied ("wake and bake" -> morning, "unwind" -> night).
- **USER-AWARENESS CONTRACT (NON-NEGOTIABLE)**: Every word in the 'consultationScript' and 'reasoning' must be explicitly aware of and responsive to the user's specific input. Reference their actual wording, specific preferences, or unique constraints. Generic or neutral templates are forbidden. If any generated text could apply to a different user with different input, it is a failure of the contract.
`;

export async function analyzeIntent(seed: IntentSeed, context?: { blendName?: string, cultivars?: string[], originalQuery?: string, variantType?: string }): Promise<IntentSpec> {
    const inputText = seed.text || "";

    // Construct Context Block for LLM
    const contextBlock = context ? `
CONTEXT:
- Current Blend: "${context.blendName}"
- Component Cultivars: ${context.cultivars?.join(', ')}
- Original Goal: "${context.originalQuery}"
- Variant Role: ${context.variantType || 'N/A'}
` : '';

    // 0. SHORT CIRCUIT: Empty/Too Short
    if (!inputText || inputText.length < 3) {
        return createFallbackSpec(inputText, "Input too short");
    }

    try {
        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `Input: "${inputText}"\n${contextBlock}\nMode: ${seed.mode}` }
                ],
                temperature: 0.2 // Low temp for extraction/analysis
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn('SEMANTIC ADAPTER: API Failure', response.status, errText);
            return createFallbackSpec(inputText, `API Error: ${response.status}`);
        }

        const data = await response.json();

        // Parse Structured Content
        let content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("No content received");

        // Clean markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const spec = JSON.parse(content) as IntentSpec;

        // Hydrate with original input for upstream tracking
        return {
            ...spec,
            originalInput: inputText
        };

    } catch (e) {
        console.warn('SEMANTIC ADAPTER: Parsing failed', e);
        return createFallbackSpec(inputText, "Analysis failed");
    }
}

function createFallbackSpec(originalInput: string, reason: string): IntentSpec {
    return {
        originalInput,
        targetEffects: [],
        avoidEffects: [],
        terpenePreferences: { include: [], exclude: [] },
        constraints: {},
        confidenceScore: 0.1,
        reasoning: `Fallback: ${reason}`
    };
}
