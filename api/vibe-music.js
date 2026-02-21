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

// Strong, genre-specific style so each option sounds clearly like that genre
const genreToStyle = {
    "Ambient": "Style: Ambient. Drone, pads, slow evolution, space and stillness. No beat or only very subtle pulse. Ethereal, cinematic, headphone music.",
    "Hip Hop": "Style: Hip Hop instrumental. Boom bap or trap-style drums, strong kick and snare, 808-style bass, chopped or smooth melody. Clear beat, head-nod groove, no singing—pure beat.",
    "Lo-Fi": "Style: Lo-Fi hip hop. Dusty drums, vinyl crackle, warm piano or Rhodes, relaxed boom bap groove. Bedroom producer, study beats, nostalgic and cozy.",
    "R&B": "Style: R&B instrumental. Smooth chords, soulful keys or guitar, slow groove, brushed or soft drums. Sensual, late-night, no vocals—instrumental only.",
    "Electronic": "Style: Electronic. Synths, sequenced bass, four-on-the-floor or broken beat, modern production. Can be house, techno, or IDM-inspired—clear electronic palette.",
    "Indie / Alternative": "Style: Indie / alternative rock instrumental. Guitars, organic drums, melodic and slightly raw. Think soundtrack or band instrumental, not electronic.",
    "Acoustic": "Style: Acoustic instrumental. Real guitar, piano, or strings; minimal or no electronic elements. Organic, intimate, singer-songwriter vibe without vocals.",
    "Folk": "Style: Folk instrumental. Acoustic guitar, fingerpicking, maybe mandolin or light percussion. Storytelling feel, warm and earthy.",
    "Bluegrass": "Style: Bluegrass instrumental. Acoustic guitar, banjo, fiddle, mandolin; driving rhythm, Appalachian feel. No drums or very light—string-band forward.",
    "Jazz": "Style: Jazz instrumental. Piano or guitar comping, walking or melodic bass, brushed or light drums. Swing or ballad feel, no vocals.",
    "Cinematic": "Style: Cinematic / film score. Orchestral or hybrid, emotional arc, big or intimate. Clear theme and development, no lyrics.",
    "Soul": "Style: Soul instrumental. Hammond or Rhodes, warm bass, tight drums. Stax/Motown feel, groove-focused, instrumental only.",
    "Chillwave": "Style: Chillwave. Synth pads, soft drums, reverb, 80s-inspired but relaxed. Nostalgic, dreamy, no harsh edges.",
    "Downtempo": "Style: Downtempo. Laid-back beat, bass-heavy, atmospheric. Trip-hop or lounge adjacent, smooth and moody."
};

function buildMusicPrompt({ mood, energy, body, time, genre }) {
    const genreStyle = (genre && genreToStyle[genre])
        ? genreToStyle[genre]
        : (genre ? `Style: ${genre}. Clear melody, solid groove, authentic to the genre, shareable.` : "Style: modern ambient electronic with subtle analog warmth.");
    return `
Create a 30-second instrumental track the user will want to listen to and share.

${genreStyle}
Mood: ${mood}.
Energy level: ${energy}.
Body feel: ${body}.
Time context: ${time}.

Musical direction:
- Clear melodic motif (not random pads or drones)
- Defined chord progression
- Solid rhythm or groove appropriate to the style
- Emotional arc: intro → build → peak → resolve
- Clean mix, no distortion
- Professional, shareable quality

Avoid:
- Harsh noise
- Random glitch artifacts
- Empty ambient drone
- Looped repetition

Make it intentional and musical—something that fits the vibe but stands on its own as a track.
`.trim();
}

function generateMusicPromptFromTerpenes(terpenes, genre) {
    const opts = (overrides) => ({ ...overrides, genre: genre || null });
    if (!terpenes || terpenes.length === 0) {
        return buildMusicPrompt(opts({
            mood: "balanced and atmospheric",
            energy: "medium",
            body: "relaxed but present",
            time: "early evening"
        }));
    }

    const topTerpenes = [...terpenes]
        .sort((a, b) => (b.percent || 0) - (a.percent || 0))
        .slice(0, 3);

    const profiles = topTerpenes
        .map(t => terpeneToProfile[t.name.toLowerCase()])
        .filter(Boolean);

    if (profiles.length === 0) {
        return buildMusicPrompt(opts({
            mood: "balanced and reflective",
            energy: "medium",
            body: "grounded and calm",
            time: "late afternoon"
        }));
    }

    const dominant = profiles[0];
    const moods = profiles.map(p => p.mood).join(", ");

    return buildMusicPrompt(opts({
        mood: moods,
        energy: dominant.energy,
        body: dominant.body,
        time: dominant.time
    }));
}

module.exports = async function handler(request, response) {
    // CORS Headers
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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


    try {
        const { terpenes, inputAudio, genre } = request.body;

        if (!terpenes) {
            return response.status(400).json({ error: 'Missing terpenes' });
        }

        const prompt = generateMusicPromptFromTerpenes(terpenes, genre);

        // Replicate requires version hash for meta/musicgen (slug-only returns 404). Use pinned version.
        const MODEL_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";
        const model = "meta/musicgen:" + MODEL_VERSION;

        console.log(`REPLICATE: Running ${model} for prompt:`, prompt);

        const input = {
            prompt: prompt,
            duration: 30,
        };

        if (inputAudio) {
            input.input_audio = inputAudio;
        }
        // Omit model_version to avoid 422 from some Replicate model versions; slug is enough.

        const raw = await replicate.run(model, { input });

        // Deep-resolve Replicate FileOutput-like objects anywhere in the response
        async function resolveDeep(value) {
            if (!value) return value;

            if (typeof value === "object" && typeof value.url === "function") {
                try {
                    const u = await value.url();
                    return u;
                } catch {
                    return value;
                }
            }

            if (Array.isArray(value)) {
                const out = [];
                for (const v of value) out.push(await resolveDeep(v));
                return out;
            }

            if (typeof value === "object") {
                const out = {};
                for (const [k, v] of Object.entries(value)) {
                    out[k] = await resolveDeep(v);
                }
                return out;
            }

            return value;
        }

        function extractAudioUrl(output) {
            if (!output) return null;

            if (typeof output === "string") return output.startsWith("http") ? output : null;

            if (Array.isArray(output)) {
                for (const item of output) {
                    const url = extractAudioUrl(item);
                    if (url) return url;
                }
                return null;
            }

            if (typeof output === "object") {
                for (const k of ["audio", "audio_url", "url", "output", "file", "files"]) {
                    if (output[k]) {
                        const url = extractAudioUrl(output[k]);
                        if (url) return url;
                    }
                }
                for (const v of Object.values(output)) {
                    const url = extractAudioUrl(v);
                    if (url) return url;
                }
            }

            return null;
        }

        // Resolve FileOutputs everywhere BEFORE extraction (raw may contain FileOutput deep in tree)
        const resolved = await resolveDeep(raw);
        const audioUrl = extractAudioUrl(resolved);

        if (!audioUrl) {
            console.error("REPLICATE raw (type):", typeof raw, Array.isArray(raw) ? "array" : "not array");
            console.error("REPLICATE resolved:", JSON.stringify(resolved, null, 2));
            return response.status(500).json({ error: 'Could not extract audio URL from Replicate output' });
        }

        console.log("REPLICATE: Output URL OK");
        return response.status(200).json({ audio: audioUrl });
    } catch (error) {
        console.error("MusicGen error:", error);
        return response.status(500).json({ error: error.message });
    }
};

