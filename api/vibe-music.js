const Replicate = require('replicate');

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY,
});

// Helper for structured JSON responses
const sendJson = (res, status, data) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(status).json(data);
};

const terpeneToProfile = {
    myrcene: { mood: "dreamy and introspective", energy: "low", body: "heavy and relaxed", time: "late night wind-down" },
    limonene: { mood: "uplifting and bright", energy: "medium", body: "light and energized", time: "sunny afternoon" },
    pinene: { mood: "clear and focused", energy: "medium-high", body: "alert and grounded", time: "crisp morning" },
    linalool: { mood: "calm and cinematic", energy: "low", body: "soft and soothed", time: "dusk, golden hour" },
    caryophyllene: { mood: "grounded and gritty", energy: "medium", body: "warm and anchored", time: "evening, city lights" },
    humulene: { mood: "earthy and contemplative", energy: "low-medium", body: "settled and present", time: "quiet afternoon" },
    terpinolene: { mood: "energetic and complex", energy: "high", body: "buzzing and awake", time: "midday peak" },
    ocimene: { mood: "bright and citrusy", energy: "medium-high", body: "fresh and light", time: "early morning" }
};

function getProfileFromTerpenes(terpenes) {
    if (!terpenes || terpenes.length === 0) {
        return { mood: "balanced", energy: "medium", body: "relaxed", time: "evening" };
    }
    const topTerpenes = [...terpenes].sort((a, b) => (b.percent || 0) - (a.percent || 0)).slice(0, 3);
    const profiles = topTerpenes.map(t => terpeneToProfile[t.name.toLowerCase()]).filter(Boolean);
    if (profiles.length === 0) return { mood: "reflective", energy: "medium", body: "grounded", time: "afternoon" };
    const dominant = profiles[0];
    const moods = profiles.map(p => p.mood).join(", ");
    return { mood: moods, energy: dominant.energy, body: dominant.body, time: dominant.time };
}

function extractAudioUrl(output) {
    if (!output) return null;
    if (typeof output === "string") return output.startsWith("http") ? output : null;
    if (Array.isArray(output)) {
        for (const item of output) {
            const url = extractAudioUrl(item);
            if (url) return url;
        }
    }
    if (typeof output === "object") {
        for (const k of ["audio", "audio_url", "url", "file", "result", "output"]) {
            if (output[k]) {
                const res = extractAudioUrl(output[k]);
                if (res) return res;
            }
        }
    }
    return null;
}

module.exports = async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') return response.status(200).end();

    try {
        // ---------------------------------------------------------
        // GET: POLL PREDICTION
        // ---------------------------------------------------------
        if (request.method === 'GET') {
            const { id } = request.query;
            if (!id) return sendJson(response, 400, { ok: false, error: { message: "Missing id" } });

            const prediction = await replicate.predictions.get(id);
            console.log(`[Vibe-Music] Polling ${id}: ${prediction.status}`);

            if (prediction.status === "succeeded") {
                const audioUrl = extractAudioUrl(prediction.output);
                return sendJson(response, 200, {
                    ok: true,
                    status: "succeeded",
                    audioUrl,
                    model: prediction.model
                });
            }

            if (prediction.status === "failed" || prediction.status === "canceled") {
                console.error(`[Vibe-Music] Prediction failed:`, prediction.error || prediction.logs);
                return sendJson(response, 200, {
                    ok: false,
                    status: prediction.status,
                    error: { message: prediction.error || "Generation failed" }
                });
            }

            return sendJson(response, 200, { ok: true, status: prediction.status });
        }

        // ---------------------------------------------------------
        // POST: START TASK
        // ---------------------------------------------------------
        if (request.method === 'POST') {
            const { terpenes, genre, narration, energy, mood, bodyFeel, timeContext } = request.body;
            if (!terpenes) return sendJson(response, 400, { ok: false, error: { message: 'Missing terpenes' } });

            const profile = getProfileFromTerpenes(terpenes);
            let finalLyrics = '';
            let rawLyrics = '';

            // Step 1: Generate Lyrics (Llama 3)
            if (narration) {
                console.log("[Vibe-Music] Adapting lyrics...");
                const lyricAdapterPrompt = `You are a professional lyricist. Rewrite the following prose into a 30-second song lyric sheet.
STRICT RULE: Output ONLY the lyrics. NO conversational filler, NO "Here are the lyrics", NO "Sure thing".
Format like this:
[verse]
(lines)
[chorus]
(lines)

Input:
${narration}

Genre Style: ${genre || 'modern'}
Energy: ${energy || profile.energy}
Mood: ${mood || profile.mood}`;

                try {
                    const llmPrediction = await replicate.predictions.create({
                        model: "meta/meta-llama-3-70b-instruct",
                        input: {
                            prompt: lyricAdapterPrompt,
                            max_new_tokens: 250,
                            temperature: 0.7
                        }
                    });

                    const llmFinal = await replicate.wait(llmPrediction);
                    let rawOutput = Array.isArray(llmFinal.output) ? llmFinal.output.join('') : (llmFinal.output || '');

                    // BRUTAL CLEANUP: Take everything after the first '[' just in case it still chats
                    const firstBracket = rawOutput.indexOf('[');
                    if (firstBracket !== -1) {
                        rawLyrics = rawOutput.substring(firstBracket).trim();
                    } else {
                        rawLyrics = rawOutput.trim();
                    }

                    // Basic sanity cleanup for common chatty phrases
                    rawLyrics = rawLyrics.replace(/^(here's|here are|sure|okay|rewritten lyrics|the lyrics|here is).*?:\s*/i, '').trim();

                    finalLyrics = `##${rawLyrics}##`;
                } catch (err) {
                    console.error("[Vibe-Music] LLM Error:", err);
                    rawLyrics = `[verse]\nDrifting through the day,\nFinding focus in the morning air.\n[chorus]\nBalance in every breath.`;
                    finalLyrics = `##${rawLyrics}##`;
                }
            }

            // Step 2: Start Music Generation (Async)
            const genreStyles = {
                "Hip Hop": "Style: Professional Rap. Rhythmic rap delivery, confident flow, urban street vibe. 808 bass, crisp drums, authentic delivery. NOT singy, NOT melodic vocals.",
                "Lo-Fi": "Style: Lo-Fi hip hop. Dusty drums, vinyl crackle, warm samples, relaxed melodic delivery.",
                "Ambient": "Style: Atmospheric Ambient. Ethereal pads, no drums, cinematic soundscapes.",
                "Electronic": "Style: Modern Electronic. High energy, synth-driven, driving beat.",
                "R&B": "Style: Soulful R&B. Smooth vocals, groovy bassline, contemporary production."
            };

            const genreDesc = genreStyles[genre] || `Style: Professional ${genre || 'modern'} song with vocals.`;
            const stylePrompt = `${genreDesc} Mood: ${mood || profile.mood}. Energy: ${energy || profile.energy}. Studio production. Quality: High. Vocal: Authentic, genre-specific.`;

            const model = "minimax/music-1.5";
            console.log(`[Vibe-Music] Starting ${model} job...`);

            const prediction = await replicate.predictions.create({
                model,
                input: {
                    prompt: stylePrompt,
                    lyrics: finalLyrics
                }
            });

            return sendJson(response, 200, {
                ok: true,
                predictionId: prediction.id,
                lyrics: rawLyrics,
                status: "starting"
            });
        }

        return sendJson(response, 405, { ok: false, error: { message: 'Method Not Allowed' } });

    } catch (error) {
        console.error("[Vibe-Music] Fatal Error:", error);
        return sendJson(response, 500, {
            ok: false,
            error: { message: error.message || "Internal Server Error" }
        });
    }
};
