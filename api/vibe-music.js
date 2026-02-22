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
        const { terpenes, genre, narration, cultivars } = request.body;
        if (!terpenes) return response.status(400).json({ error: 'Missing terpenes' });

        const profile = getProfileFromTerpenes(terpenes);
        const genreStyle = genreToStyle[genre] || `Style: ${genre || 'modern'}.`;

        const lyrics = (cultivars && cultivars.length > 0)
            ? `##[Verse]\nIn the ${profile.time}, feel the power of ${cultivars.map(c => c.name).join(", ")}.\n${narration ? narration.split('.').slice(0, 1).join('.') + '.' : 'A perfect balance for your journey.'}\n\n[Chorus]\nA ${profile.mood} vibe, let the energy flow,\nStrainMath resonance, watch the body glow.\n${profile.energy} energy, ${profile.body} in every breath.##`
            : `##[Verse]\nFinding the balance in every breath today.\nA journey of focus, a path to the light.\n\n[Chorus]\nStrainMath resonance, feel the body glow.\nA perfect harmony, let the energy flow.##`;

        const model = "minimax/music-1.5";
        const input = {
            prompt: `A professional ${genre || 'modern'} ${profile.mood} song with ${profile.energy} energy. ${genreStyle} Studio-grade vocals.`,
            lyrics: lyrics
        };

        console.log(`REPLICATE: Running ${model} with lyrics.`);

        const prediction = await replicate.predictions.create({ model, input });
        const final = await replicate.wait(prediction);

        if (final.status !== "succeeded") {
            return response.status(500).json({ error: `Replicate failed: ${final.status}` });
        }

        function extractAudioUrl(output) {
            if (!output) return null;
            if (typeof output === "string") return output.startsWith("http") ? output : null;
            if (Array.isArray(output)) return extractAudioUrl(output[0]);
            if (typeof output === "object") {
                for (const k of ["audio", "audio_url", "url", "file", "result"]) {
                    if (output[k]) return extractAudioUrl(output[k]);
                }
            }
            return null;
        }

        const audioUrl = extractAudioUrl(final.output);
        if (!audioUrl) return response.status(500).json({ error: "Could not extract audio URL" });

        return response.status(200).json({ audio: audioUrl });
    } catch (error) {
        console.error("MusicGen error:", error);
        return response.status(500).json({ error: error.message });
    }
};
