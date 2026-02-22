const Replicate = require('replicate');

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY,
});

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

const genreToStyle = {
    "Ambient": "Style: Ambient. Drone, pads, slow evolution, space and stillness.",
    "Hip Hop": "Style: Hip Hop instrumental. Boom bap or trap-style drums, strong kick and snare, 808-style bass.",
    "Lo-Fi": "Style: Lo-Fi hip hop. Dusty drums, vinyl crackle, warm piano or Rhodes.",
    "R&B": "Style: R&B instrumental. Smooth chords, soulful keys or guitar, slow groove.",
    "Electronic": "Style: Electronic. Synths, sequenced bass, four-on-the-floor or broken beat.",
    "Indie / Alternative": "Style: Indie / alternative rock. Guitars, organic drums, melodic.",
    "Acoustic": "Style: Acoustic. Real guitar, piano, or strings.",
    "Folk": "Style: Folk. Acoustic guitar, fingerpicking, earthy.",
    "Bluegrass": "Style: Bluegrass. Acoustic guitar, banjo, fiddle, mandolin.",
    "Jazz": "Style: Jazz. Piano or guitar comping, walking bass.",
    "Cinematic": "Style: Cinematic / film score. Orchestral or hybrid, emotional arc.",
    "Soul": "Style: Soul. Hammond or Rhodes, warm bass, tight drums.",
    "Chillwave": "Style: Chillwave. Synth pads, soft drums, reverb.",
    "Downtempo": "Style: Downtempo. Laid-back beat, bass-heavy, atmospheric."
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

module.exports = async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (request.method === 'OPTIONS') return response.status(200).end();
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { terpenes, genre, narration, cultivars, mode, mood, energy, bodyFeel, timeContext } = request.body;
        if (!terpenes) return response.status(400).json({ error: 'Missing terpenes' });

        const profile = getProfileFromTerpenes(terpenes);
        const genreStyle = genreToStyle[genre] || `Style: ${genre || 'modern'}.`;

        let finalLyrics = '';
        let debugLyrics = '';

        if (mode === 'lyrics_song') {
            if (!narration) return response.status(400).json({ error: 'Missing narration for lyric adaptation' });

            console.log("LYRIC_ADAPTER: Converting prose to lyrics via Llama 3...");
            const lyricAdapterPrompt = `SYSTEM: You are a lyric adapter that turns prose into modern lyrics.
USER:
Convert the following recommendation narration into lyrics for a cool, modern song.
The narration is NOT lyric-ready; rewrite it into a lyric sheet.

Constraints:
- Keep the core vibe and meaning, but DO NOT copy sentences.
- No strain names, no product/dispensary/brand language, no marketing.
- No medical claims or health promises.
- Avoid corny words: “vibe,” “journey,” “elevate,” “magic,” “healing,” “therapy,” “unlock.”
- Use vivid sensory imagery and confident, modern phrasing.
- Make it genre-appropriate: ${genre || 'modern'}.
- Target duration: 30s (lyrics should match that length; keep it short).
- Tone: cool, understated, confident.
- Energy: ${energy || profile.energy}; Body feel: ${bodyFeel || profile.body}; Time: ${timeContext || profile.time}.
- No profanity unless settings explicitly allow it.
- Lines should be short (most lines 3–8 words). Avoid forced rhymes.

Input narration:
"""
${narration}
"""

Output format MUST be exactly (no extra text):

[verse]
(4–6 short lines)

[chorus]
(2–4 short lines, catchy, repeatable)

(optional)
[bridge]
(2 short lines)`;

            try {
                const llmPrediction = await replicate.predictions.create({
                    model: "meta/meta-llama-3-70b-instruct",
                    input: {
                        prompt: lyricAdapterPrompt,
                        max_new_tokens: 512,
                        temperature: 0.7
                    }
                });
                const llmFinal = await replicate.wait(llmPrediction);
                // Extract LLM output (usually an array of strings or single string)
                finalLyrics = Array.isArray(llmFinal.output) ? llmFinal.output.join('') : (llmFinal.output || '');
                debugLyrics = finalLyrics;
                // Add ## for minimax accompaniment if needed later
                finalLyrics = `##${finalLyrics.trim()}##`;
            } catch (err) {
                console.error("Lyric Adapter failed, falling back to basic lyrics:", err);
                finalLyrics = (cultivars && cultivars.length > 0)
                    ? `##[Verse]\nIn the ${profile.time}, feel the power of ${cultivars.map(c => c.name).join(", ")}.\n${narration ? narration.split('.').slice(0, 1).join('.') + '.' : 'A perfect balance for your journey.'}\n\n[Chorus]\nA ${profile.mood} vibe, let the energy flow,\nStrainMath resonance, watch the body glow.\n${profile.energy} energy, ${profile.body} in every breath.##`
                    : `##[Verse]\nFinding the balance in every breath today.\nA journey of focus, a path to the light.\n\n[Chorus]\nStrainMath resonance, feel the body glow.\nA perfect harmony, let the energy flow.##`;
            }
        } else {
            finalLyrics = (cultivars && cultivars.length > 0)
                ? `##[Verse]\nIn the ${profile.time}, feel the power of ${cultivars.map(c => c.name).join(", ")}.\n${narration ? narration.split('.').slice(0, 1).join('.') + '.' : 'A perfect balance for your journey.'}\n\n[Chorus]\nA ${profile.mood} vibe, let the energy flow,\nStrainMath resonance, watch the body glow.\n${profile.energy} energy, ${profile.body} in every breath.##`
                : `##[Verse]\nFinding the balance in every breath today.\nA journey of focus, a path to the light.\n\n[Chorus]\nStrainMath resonance, feel the body glow.\nA perfect harmony, let the energy flow.##`;
        }

        const stylePrompt = `Create a ${genre || 'modern'} song with vocals. Modern production, melodic hook, clear structure. Mood: ${mood || profile.mood}. Energy: ${energy || profile.energy}. Time: ${timeContext || profile.time}. Keep it musical and catchy. No cheesy phrases.`;

        const models = ["minimax/music-1.5", "minimax/music-01", "fofr/yue"];
        let audioUrl = null;
        let lastError = null;
        let usedModel = "";

        for (const model of models) {
            try {
                console.log(`REPLICATE: Trying ${model}...`);
                const input = {
                    prompt: stylePrompt,
                    lyrics: finalLyrics
                };

                // fofr/yue might need different input keys or handle differently
                if (model === "fofr/yue") {
                    input.lyrics = finalLyrics.replace(/##/g, ''); // yue doesn't like ##
                }

                const prediction = await replicate.predictions.create({ model, input });
                const final = await replicate.wait(prediction);

                if (final.status === "succeeded") {
                    audioUrl = extractAudioUrl(final.output);
                    if (audioUrl) {
                        usedModel = model;
                        break;
                    }
                } else {
                    console.warn(`Model ${model} failed with status: ${final.status}`);
                    lastError = `Status: ${final.status}`;
                }
            } catch (err) {
                console.error(`Error with model ${model}:`, err.message);
                lastError = err.message;
            }
        }

        function extractAudioUrl(output) {
            if (!output) return null;
            if (typeof output === "string") return output.startsWith("http") ? output : null;
            if (Array.isArray(output)) {
                // Some models return multiple files, try to find an audio one
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

        if (!audioUrl) {
            return response.status(500).json({ error: `Could not generate audio after trying all models. Last error: ${lastError}` });
        }

        return response.status(200).json({
            audio: audioUrl,
            lyrics: debugLyrics || finalLyrics.replace(/##/g, ''),
            model: usedModel
        });
    } catch (error) {
        console.error("MusicGen error:", error);
        return response.status(500).json({ error: error.message });
    }
};
