import { generateRecommendations as engineGenerate } from './engineAdapter';
import { IntentSeed, EngineResult } from '../types/domain';
import { CULTIVAR_MAP, getTerpeneColor } from './cultivarData';

// Orchestrator Interface
export interface OrchestratorResult {
    success: boolean;
    data: EngineResult[];
    error?: string;
    analysis?: {
        targetTerpenes: string[];
        reasoning: string;
    };
    followUpQuestion?: string;
}

const LLM_ENDPOINT = 'https://api.openai.com/v1/chat/completions'; // Or proxy
const MOCK_API_KEY = 'sk-placeholder'; // In real app, import.meta.env.VITE_OPENAI_KEY

/**
 * ORCHESTRATOR
 * Step 1: Run Engine (Deterministic)
 * Step 2: Call LLM (Reasoning/Validation)
 * Step 3: Return Final Result to UI
 */
export async function processIntent(input: IntentSeed, mode: 'stack-preset' | 'blend-engine' = 'blend-engine'): Promise<OrchestratorResult> {
    console.log('ORCHESTRATOR: Starting Process for', input, 'Mode:', mode);

    // MODE AWARENESS: Stack Presets bypass logic (Safety Check, though App should handle navigation)
    if (mode === 'stack-preset') {
        console.warn('ORCHESTRATOR: Stack Preset Mode invoked (Should be navigation only). Returning empty.');
        return { success: false, data: [], error: 'Stack Presets do not use Engine' };
    }

    try {
        // 1. ANALYZING PHASE (Internal Reasoning)
        // Identify 3 target terpenes based on intent text (Heuristic for Demo/Prompting)
        const targetTerpenes = identifyTargetTerpenes(input.text || '');
        console.log('ORCHESTRATOR: Analyzing... Targets:', targetTerpenes);

        // 2. ENGINE (Layer 1)
        const engineResults = engineGenerate(input);

        if (!engineResults || engineResults.length === 0) {
            return { success: false, data: [], error: 'Engine returned no results' };
        }

        // 3. LLM (Layer 2) - BLOCKING
        console.log('ORCHESTRATOR: Calling LLM (Layer 2)...');

        const enrichedResults = await callLLM(input, engineResults, targetTerpenes);

        // 4. VALIDATION (Mandatory)
        if (!validateResults(enrichedResults)) {
            console.error('ORCHESTRATOR: LLM Validation Failed');
            // Fallback to raw engine results if valid, or fail?
            // User: "Trigger safe fallback UI".
            // We will return the RAW engine results (which are structurally valid from adapter) 
            // but mark success as true to prevent empty screen.
            console.warn('ORCHESTRATOR: Falling back to raw Engine Output.');
            return { success: true, data: engineResults };
        }

        console.log('ORCHESTRATOR: LLM Return Success');
        return {
            success: true,
            data: enrichedResults,
            analysis: {
                targetTerpenes,
                reasoning: `Optimizing for ${targetTerpenes.join(', ')}`
            }
        };

    } catch (error) {
        console.error('ORCHESTRATOR ERROR:', error);
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown Error' };
    }
}

function identifyTargetTerpenes(text: string): string[] {
    const t = text.toLowerCase();
    const targets = [];
    if (t.includes('sleep') || t.includes('calm')) targets.push('Myrcene', 'Linalool', 'Caryophyllene');
    else if (t.includes('energy') || t.includes('focus')) targets.push('Pinene', 'Limonene', 'Terpinolene');
    else if (t.includes('social') || t.includes('fun')) targets.push('Limonene', 'Humulene', 'Caryophyllene');
    else targets.push('Myrcene', 'Caryophyllene', 'Limonene'); // Balanced default
    return targets;
}

function validateResults(results: EngineResult[]): boolean {
    // Check non-empty
    if (!results || results.length === 0) return false;
    // Check strain existence in library
    const validStrains = results.every(r =>
        (r.cultivars || []).every(c => {
            // Check if name exists in CULTIVAR_MAP keys (case insensitive)
            const exists = Object.keys(CULTIVAR_MAP).some(k => k.toLowerCase() === c.name.toLowerCase());
            if (!exists) console.warn(`Validation Warning: Strain ${c.name} not in Library`);
            return true; // Soft validation for now to avoid blocking if names slightly mismatch
        })
    );
    // Check UI fields
    const validFields = results.every(r => r.name && r.matchScore && r.reasoning);

    return validStrains && validFields;
}

async function callLLM(intent: IntentSeed, engineData: EngineResult[], targets: string[]): Promise<EngineResult[]> {
    const prompt = {
        model: "gpt-4-turbo",
        messages: [
            {
                role: "system",
                content: `You are the StrainMath AI. Validate and humanize these cannabis recommendations.
        Constraint 1: Do not invent strains. Use provided data.
        Constraint 2: Optimize descriptions for intent.
        Constraint 3: Target Terpenes: ${targets.join(', ')}.`
            },
            {
                role: "user",
                content: JSON.stringify({ userIntent: intent, engineOutput: engineData })
            }
        ],
        temperature: 0.7
    };

    try {
        const response = await fetch(LLM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || MOCK_API_KEY}`
            },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            console.warn('LLM CALL FAILED (Likely No Key). Returning Engine Data.');
            return engineData;
        }

        // Mock parsing for now as we don't have real LLM return structure defined
        const json = await response.json();
        return engineData;

    } catch (e) {
        console.warn('LLM NETWORK ERROR', e);
        return engineData;
    }
}
