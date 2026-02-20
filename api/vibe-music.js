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

        // Model names without hashes as per latest Replicate best practices/user feedback
        // Use melody model specifically when input audio is provided
        const model = inputAudio ? "facebook/musicgen-melody" : "meta/musicgen";

        console.log(`REPLICATE: Running ${model} for prompt:`, prompt);

        const input = {
            prompt: prompt,
            duration: 30,
        };

        if (inputAudio) {
            input.input_audio = inputAudio;
            // The melody model uses the melody input to guide the generation
        } else {
            // Standard musicgen parameters
            input.model_version = "stereo-large";
        }

        const output = await replicate.run(model, { input });

        // Robustly extract the URL from the output (could be string or object with .url())
        let audioUrl = "";
        if (typeof output === 'string') {
            audioUrl = output;
        } else if (output && typeof output.url === 'function') {
            audioUrl = output.url();
        } else if (output && output.url) {
            audioUrl = output.url;
        } else if (Array.isArray(output) && output.length > 0) {
            audioUrl = output[0];
        } else {
            audioUrl = output;
        }

        console.log("REPLICATE: Output received:", audioUrl);

        return response.status(200).json({ audio: audioUrl });
    } catch (error) {
        console.error("MusicGen error:", error);
        return response.status(500).json({ error: error.message });
    }
};

