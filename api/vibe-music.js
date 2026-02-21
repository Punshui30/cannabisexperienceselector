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

function buildMusicPrompt({ mood, energy, body, time, genre }) {
    const genreStyle = genre
        ? `Style: ${genre}. Keep the genre authentic and musical—clear melody, solid groove or structure, something people would actually want to listen to and share.`
        : "Style: modern ambient electronic with subtle analog warmth.";
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

        // Replicate can return: string URL, FileOutput, array, or full prediction { output: "https://..." }
        async function resolveUrl(val) {
            if (typeof val === 'string' && val.startsWith('http')) return val;
            if (!val) return null;
            if (typeof val.url === 'function') {
                try {
                    const u = val.url();
                    const resolved = typeof u?.then === 'function' ? await u : u;
                    return (typeof resolved === 'string' && resolved.startsWith('http')) ? resolved : null;
                } catch (e) {
                    return null;
                }
            }
            if (typeof val.url === 'string' && val.url.startsWith('http')) return val.url;
            return null;
        }

        let audioUrl = null;

        // 1) Explicit prediction shape (what Replicate HTTP API returns; SDK may pass through)
        if (raw && typeof raw === 'object' && raw.output !== undefined) {
            let out = raw.output;
            if (out && typeof out.then === 'function') out = await out;
            if (typeof out === 'string' && out.startsWith('http')) audioUrl = out;
            else if (Array.isArray(out) && out.length > 0) audioUrl = await resolveUrl(out[0]) || (typeof out[0] === 'string' && out[0].startsWith('http') ? out[0] : null);
            else audioUrl = await resolveUrl(out);
        }
        // 2) Direct string or array from SDK
        if (typeof audioUrl !== 'string' || !audioUrl.startsWith('http')) {
            if (typeof raw === 'string' && raw.startsWith('http')) audioUrl = raw;
            else if (Array.isArray(raw) && raw.length > 0) audioUrl = await resolveUrl(raw[0]) || (typeof raw[0] === 'string' && raw[0].startsWith('http') ? raw[0] : null);
            else if (audioUrl == null) audioUrl = await resolveUrl(raw);
        }
        // 3) Regex fallback: replicate.delivery and generic https
        if ((typeof audioUrl !== 'string' || !audioUrl.startsWith('http')) && raw != null) {
            const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
            const replicateMatch = str.match(/https:\/\/replicate\.delivery\/[^\s"']+/);
            const anyMatch = str.match(/https?:\/\/[^\s"'<>\\]+/);
            if (replicateMatch) audioUrl = replicateMatch[0];
            else if (anyMatch) audioUrl = anyMatch[0];
        }

        if (typeof audioUrl !== 'string' || !audioUrl.startsWith('http')) {
            const hint = raw && typeof raw === 'object' ? Object.keys(raw).join(',') : typeof raw;
            console.error("REPLICATE: Could not extract audio URL. type:", typeof raw, "keys:", hint);
            return response.status(500).json({ error: 'Music model did not return a playable URL' });
        }

        console.log("REPLICATE: Output URL OK");
        return response.status(200).json({ audio: audioUrl });
    } catch (error) {
        console.error("MusicGen error:", error);
        return response.status(500).json({ error: error.message });
    }
};

