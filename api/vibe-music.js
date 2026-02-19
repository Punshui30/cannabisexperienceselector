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

function buildMusicPrompt({ mood, energy, body, time }) {
    return `
Create a 30-second cinematic instrumental track.

Style: modern ambient electronic with subtle analog warmth.
Mood: ${mood}.
Energy level: ${energy}.
Body feel: ${body}.
Time context: ${time}.

Musical direction:
- Clear melodic motif (not random pads)
- Defined chord progression
- Subtle bass movement
- Light percussive rhythm
- Emotional arc: intro → build → gentle peak → resolve
- Clean mix, no distortion
- Professional soundtrack quality

Avoid:
- Harsh noise
- Random glitch artifacts
- Empty ambient drone
- Looped repetition

Make it feel intentional and musical, like a Netflix documentary underscore.
`.trim();
}

function generateMusicPromptFromTerpenes(terpenes) {
    if (!terpenes || terpenes.length === 0) {
        return buildMusicPrompt({
            mood: "balanced and atmospheric",
            energy: "medium",
            body: "relaxed but present",
            time: "early evening"
        });
    }

    const topTerpenes = [...terpenes]
        .sort((a, b) => (b.percent || 0) - (a.percent || 0))
        .slice(0, 3);

    // Collect profiles and blend them
    const profiles = topTerpenes
        .map(t => terpeneToProfile[t.name.toLowerCase()])
        .filter(Boolean);

    if (profiles.length === 0) {
        return buildMusicPrompt({
            mood: "balanced and reflective",
            energy: "medium",
            body: "grounded and calm",
            time: "late afternoon"
        });
    }

    // Use dominant terpene for energy/body/time, blend moods
    const dominant = profiles[0];
    const moods = profiles.map(p => p.mood).join(", ");

    return buildMusicPrompt({
        mood: moods,
        energy: dominant.energy,
        body: dominant.body,
        time: dominant.time
    });
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
        const { terpenes, inputAudio } = request.body;

        if (!terpenes) {
            return response.status(400).json({ error: 'Missing terpenes' });
        }

        const prompt = generateMusicPromptFromTerpenes(terpenes);

        // Use pinned version hashes — routes to /v1/predictions (correct endpoint).
        // Calling "meta/musicgen" without a hash hits /v1/models/.../predictions which 404s.
        // Version confirmed working from Replicate playground (punshui30 account).
        const model = inputAudio
            ? "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb"
            : "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";

        console.log(`REPLICATE: Running model with version hash for prompt:`, prompt);

        const output = await replicate.run(
            model,
            {
                input: {
                    model_version: inputAudio ? "melody" : "stereo-large",
                    prompt: prompt,
                    duration: 30,
                    ...(inputAudio ? { input_audio: inputAudio } : {})
                }
            }
        );

        return response.status(200).json({ audio: output });
    } catch (error) {
        console.error("MusicGen error:", error);
        return response.status(500).json({ error: error.message });
    }
};
