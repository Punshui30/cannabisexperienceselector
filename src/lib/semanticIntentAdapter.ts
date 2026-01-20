
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
  "reasoning": string // Brief explanation of extraction (max 1 sentence)
}

RULES:
- Map synonyms to standard effects (e.g., "racy" -> avoid: "anxiety", "uplifting" -> target: "mood").
- Map "Affirmative Body Load" signals (e.g., "sink into the couch", "melt", "heavy", "physically relaxed") as targets for sedation/relaxation/body, NOT constraints.
- **Correction Handling**: If the user text implies a correction (e.g., "I said I did want...", "No, actually..."), you must DISCARD the previous intent vector for that parameter and replace it with the new value. Do not average or soften the change.
- Allow simultaneous cognitive targets (e.g., "clear mind", "focus") and physical sedation.
- If input is vague, set confidenceScore low (< 0.6).
- If specific terpenes are mentioned, map them to 'include'.
- infer 'timeOfDay' if implied ("wake and bake" -> morning, "unwind" -> night).
`;

export async function analyzeIntent(seed: IntentSeed): Promise<IntentSpec> {
    const inputText = seed.text || "";

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
                    { role: "user", content: `Input: "${inputText}"\nContext: ${seed.mode} mode.` }
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
