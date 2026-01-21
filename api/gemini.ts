/**
 * GEMINI API PROXY
 * 
 * Primary Engine LLM for blend narratives.
 * Server-side only. Protects GEMINI_API_KEY.
 * 
 * STABILITY RULES:
 * - NEVER return 500 (prevents UI instability)
 * - Always return 200 OK with error flag on failure
 * - Let orchestrator handle Tier-1 fallback
 */

export default async function handler(request: any, response: any) {
    // CORS Header Setup
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // STRICT: Validate GEMINI_API_KEY presence
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('GEMINI: Missing GEMINI_API_KEY');
        // Return 200 OK with error flag (not 500)
        return response.status(200).json({
            ok: false,
            error: 'missing_key',
            details: 'GEMINI_API_KEY not configured in environment variables'
        });
    }

    try {
        const body = request.body || {};
        const { tier1Narrative, userIntentSummary, decisionSummary, blendSummary, toneMode } = body;

        if (!tier1Narrative || !tier1Narrative.reasoning) {
            console.warn('GEMINI: Invalid input - missing tier1Narrative');
            return response.status(200).json({
                ok: false,
                error: 'invalid_input',
                details: 'Missing tier1Narrative in request body'
            });
        }

        console.log('[GEMINI] Generating narrative enhancement...');

        // Construct prompt for Gemini
        const systemPrompt = `You are a premium cannabis experience narrator. Your role is to enhance technical blend explanations into compelling, human-readable narratives.

STRICT RULES:
- You receive a Tier-1 deterministic narrative based on engine math
- Your job is to REPHRASE and ENRICH the language ONLY
- DO NOT add new facts, claims, or cultivar information
- DO NOT change the core meaning or technical accuracy
- Keep the same cultivar names and ratios
- Maintain a ${toneMode || 'neutral'} tone

INPUT CONTEXT:
User Intent: ${userIntentSummary}
Engine Decision: ${decisionSummary}
Blend: ${tier1Narrative.name}

TIER-1 NARRATIVE TO ENHANCE:
${tier1Narrative.reasoning}

OUTPUT REQUIREMENTS:
- 2-4 sentences maximum
- Natural, conversational language
- Preserve all technical accuracy
- Reference specific cultivar names from the blend`;

        // Call Google Gemini API
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    topP: 0.9
                }
            })
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            console.warn('GEMINI: API error:', geminiResponse.status, errText.slice(0, 200));

            // Return 200 OK with error flag (not 500)
            return response.status(200).json({
                ok: false,
                error: 'api_failed',
                details: `Gemini API returned ${geminiResponse.status}`
            });
        }

        const data = await geminiResponse.json();

        // Extract narrative from Gemini response
        const narrative = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!narrative) {
            console.warn('GEMINI: Empty response from API');
            return response.status(200).json({
                ok: false,
                error: 'empty_response',
                details: 'Gemini returned no content'
            });
        }

        console.log('[GEMINI] Narrative enhancement successful');

        return response.status(200).json({
            ok: true,
            narrative: narrative.trim()
        });

    } catch (error: any) {
        console.error('[GEMINI] Critical error:', error);

        // Return 200 OK with error flag (not 500)
        return response.status(200).json({
            ok: false,
            error: 'server_error',
            details: error.message || 'Unknown error'
        });
    }
}
