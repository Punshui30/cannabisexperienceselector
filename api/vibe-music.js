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
            const { terpenes, genre, narration, energy: reqEnergy, mood: reqMood, bodyFeel, timeContext, cultivars } = request.body;
            if (!terpenes) return sendJson(response, 400, { ok: false, error: { message: 'Missing terpenes' } });

            const profile = getProfileFromTerpenes(terpenes);
            const mood = reqMood || profile.mood;
            const energy = reqEnergy || profile.energy;
            const cultivarNames = Array.isArray(cultivars) ? cultivars.map(c => typeof c === 'string' ? c : c.name) : [];

            let finalLyrics = '';
            let rawLyrics = '';

            // ---------------------------------------------------------
            // TWO-PASS LYRIC GENERATION
            // ---------------------------------------------------------

            const BANNED_WORDS = ['vibe', 'journey', 'elevate', 'magic', 'healing', 'therapy', 'unlock', 'experience', 'curated', 'formula', 'terpene'];
            const INSTRUCTIONAL_PHRASES = ['designed to', 'we built this', 'let me explain', 'this blend', 'your outcome', 'here’s how', 'this means'];

            const checkCringe = (text) => {
                const lower = text.toLowerCase();
                if (BANNED_WORDS.some(word => lower.includes(word))) return true;
                if (INSTRUCTIONAL_PHRASES.some(phrase => lower.includes(phrase))) return true;
                return false;
            };

            const llmRequest = async (prompt) => {
                const prediction = await replicate.predictions.create({
                    model: "meta/meta-llama-3-70b-instruct",
                    input: {
                        prompt,
                        max_new_tokens: 500,
                        temperature: 0.75
                    }
                });
                const result = await replicate.wait(prediction);
                return Array.isArray(result.output) ? result.output.join('') : (result.output || '');
            };

            const cleanLyrics = (raw) => {
                const firstBracket = raw.indexOf('[');
                let cleaned = firstBracket !== -1 ? raw.substring(firstBracket).trim() : raw.trim();
                return cleaned.replace(/^(here's|here are|sure|okay|rewritten lyrics|the lyrics|here is).*?:\s*/i, '').trim();
            };

            if (narration) {
                console.log("[Vibe-Music] Starting Two-Pass Lyric Generation...");

                // PASS 1: DRAFT
                const pass1Prompt = `SYSTEM: You are a modern songwriter. Write lyrics that sound like a real current song.
USER:
Write lyrics for a ${genre || 'modern'} track with vocals using the vibe below. Do NOT write an explanation. Do NOT sound like an ad.

Vibe targets:
- Mood: ${mood}
- Energy: ${energy}
- Body feel: ${bodyFeel || profile.body || 'relaxed'}
- Time context: ${timeContext || profile.time || 'now'}

Must include cultivar name-drops naturally (not as a list):
${cultivarNames.join(", ")}

Hard rules (anti-corny):
- No instructional language (avoid "let me explain", "here's how", "this means", "designed to", "we built this").
- No brand/product/dispensary language.
- No medical claims.
- Avoid these words entirely: ${BANNED_WORDS.join(", ")}.
- Avoid filler affirmations: "feel so good", "take you higher", "all night long" unless genre-appropriate and used sparingly.
- No "poem voice" (no Victorian words, no overly ornate metaphors).
- Use modern phrasing, tight lines, and concrete imagery.

Structure:
[verse] 6 lines (short, punchy, 3–9 words per line)
[chorus] 4 lines (catchy, repeatable)
[verse] 4 lines (variation)
[chorus] 4 lines (repeat)

Cultivar integration rules:
- Mention each cultivar at most ONCE.
- Use them like proper nouns in the world of the song, not as product labels.

Use this prose only as inspiration:
"""
${narration}
"""

Output only the lyric sheet with tags. No extra text.`;

                try {
                    let pass1Output = await llmRequest(pass1Prompt);
                    let draftLyrics = cleanLyrics(pass1Output);
                    console.log("[Vibe-Music] Pass 1 Complete.");

                    // PASS 2: CRITIC + REWRITE
                    const pass2Prompt = `SYSTEM: You are a lyric doctor who removes cringe and makes lyrics sound like a real modern song.
USER:
Rewrite these lyrics to sound current and non-corny while keeping the same vibe and meaning.

Rewrite rules:
- Remove any instructional/marketing tone.
- Replace generic phrases with specific modern imagery.
- Keep lines short and singable.
- Keep cultivar name-drops subtle and natural (each at most once).
- Keep the same section structure and tags.
- No forced rhymes. Light internal rhyme is okay.
- Avoid these words: ${BANNED_WORDS.join(", ")}.

Lyrics to fix:
${draftLyrics}

Output only the revised lyric sheet with tags. No commentary.`;

                    let pass2Output = await llmRequest(pass2Prompt);
                    rawLyrics = cleanLyrics(pass2Output);
                    console.log("[Vibe-Music] Pass 2 Complete.");

                    // CRINGE DETECTOR
                    if (checkCringe(rawLyrics)) {
                        console.log("[Vibe-Music] Cringe Detected! Running Pass 3...");
                        const pass3Prompt = `SYSTEM: Emergency rewrite. The previous lyrics still sound like an advertisement or use banned cheesy words.
USER:
Rewrite the following lyrics one last time. BE BRUTAL. Remove every word that sounds like a product description. 
Banned words: ${BANNED_WORDS.join(", ")}. 
Instructional phrases to REMOVE: ${INSTRUCTIONAL_PHRASES.join(", ")}.
Ensure the cultivars are still there but feel completely natural.

Lyrics:
${rawLyrics}

Output only the revised lyric sheet with tags.`;
                        let pass3Output = await llmRequest(pass3Prompt);
                        rawLyrics = cleanLyrics(pass3Output);
                    }

                    // Ensure cultivars survived
                    cultivarNames.forEach(name => {
                        if (!rawLyrics.toLowerCase().includes(name.toLowerCase())) {
                            console.log(`[Vibe-Music] Cultivar ${name} missing, re-inserting...`);
                            // Subtly append to a verse if missing
                            rawLyrics = rawLyrics.replace(/\[verse\]/i, `[verse]\n(Echoing ${name})\n`);
                        }
                    });
                } catch (llmErr) {
                    console.warn("[Vibe-Music] LLM Generation failed, using raw narration fallback.");
                    rawLyrics = narration;
                }
            }

            // FINAL VALIDATION: Minimax fails if lyrics are < 10 chars
            if (!rawLyrics || rawLyrics.trim().length < 20) {
                console.log("[Vibe-Music] Lyrics too short, building robust backup...");
                const backupLyrics = `[verse]\n${narration || "A custom blend for a unique experience."}\n[chorus]\nFeaturing ${cultivarNames.join(" and ") || 'premium cultivars'}.\nDesigned for your specific goal.`;
                rawLyrics = backupLyrics;
            }

            // Clean up any double tags if the LLM hallucinated them
            rawLyrics = rawLyrics.replace(/##/g, '').trim();
            console.log(`[Vibe-Music] FINAL LYRIC SUBMISSION (Length: ${rawLyrics.length}):`, rawLyrics.substring(0, 50) + "...");

            finalLyrics = `##${rawLyrics}##`;

            // Step 2: Start Music Generation (Async)
            const genreStyles = {
                "Hip Hop": "Style: Pro rap. Confident flow, rhythmic delivery, 808 bass, crisp hi-hats. NOT melodic, NOT singy.",
                "Lo-Fi": "Style: Lo-fi hip hop. Dusty drums, vinyl crackle, warm Fender Rhodes keys. Chill, relaxed delivery.",
                "Ambient": "Style: Atmospheric ambient. Ethereal layered pads, cinematic, no drums. Soft texture throughout.",
                "Electronic": "Style: Modern electronic. High energy, punchy synths, four-on-the-floor or trap beat.",
                "R&B": "Style: Contemporary R&B. Smooth vocals, lush harmonies, soulful chord stabs, modern trap hi-hats.",
                "Indie / Alternative": "Style: Indie alternative. Guitar-driven, slightly reverb-heavy, emotionally resonant vocals, warm production.",
                "Acoustic": "Style: Acoustic singer-songwriter. Clean acoustic guitar, intimate distant reverb, breathy close-mic vocals.",
                "Folk": "Style: Modern folk. Fingerpicked guitar, earnest storytelling vocals, subtle percussion, organic instruments.",
                "Bluegrass": "Style: Contemporary bluegrass. Banjo, fiddle, upright bass, tight vocal harmonies, medium tempo.",
                "Jazz": "Style: Modern jazz. Brushed drums, upright bass, Rhodes piano, cool relaxed vocal over swinging feel.",
                "Cinematic": "Style: Cinematic score with vocals. Orchestral strings, dramatic swells, powerful female or male lead.",
                "Soul": "Style: Classic soul. Warm organ, punchy horns, gospel-inflected vocals, soulful conviction.",
                "Chillwave": "Style: Chillwave. Dreamy synths, reverb-soaked vocals, beach nostalgia, woozy lo-fi textures.",
                "Downtempo": "Style: Downtempo trip-hop. Slow boom-bap beat, dark bass, atmospheric pads, spoken or sung vocals.",
            };

            const genreDesc = genreStyles[genre] || `Style: ${genre || 'modern'} with authentic vocals and full production.`;
            const stylePrompt = `${genreDesc} Mood: ${mood}. Energy: ${energy}. Studio production quality. Authentic vocal delivery specific to the genre.`;

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
