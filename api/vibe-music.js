const Replicate = require('replicate');

const terpeneToMusicMap = {
    myrcene: { tempo: "slow", mood: "dreamy", instruments: "pads, ambient guitar" },
    limonene: { tempo: "medium", mood: "uplifting", instruments: "bright synth, clean guitar" },
    pinene: { tempo: "medium-fast", mood: "clear, focused", instruments: "acoustic, light percussion" },
    linalool: { tempo: "slow", mood: "calm, cinematic", instruments: "strings, soft piano" },
    caryophyllene: { tempo: "medium", mood: "grounded, gritty", instruments: "bass, analog synth" },
    humulene: { tempo: "medium", mood: "earthy, acoustic", instruments: "woodwinds, soft drums" },
    terpinolene: { tempo: "fast", mood: "energetic, complex", instruments: "staccato synths, intricate rhythms" },
    ocimene: { tempo: "medium-fast", mood: "bright, citrusy", instruments: "shimmering synths, bells" }
};

function generateMusicPromptFromTerpenes(terpenes) {
    if (!terpenes || terpenes.length === 0) {
        return "30 second cinematic instrumental, balanced and atmospheric, smooth transition, modern feel";
    }

    const topTerpenes = [...terpenes]
        .sort((a, b) => (b.percent || 0) - (a.percent || 0))
        .slice(0, 3);

    const moods = [];
    const instruments = [];
    let tempo = "medium";

    topTerpenes.forEach((t, index) => {
        const name = t.name.toLowerCase();
        const trait = terpeneToMusicMap[name];
        if (trait) {
            moods.push(trait.mood);
            instruments.push(trait.instruments);
            if (index === 0) tempo = trait.tempo;
        }
    });

    const moodsStr = moods.join(", ");
    const instStr = instruments.join(", ");

    return `30 second cinematic instrumental, ${moodsStr}, ${tempo} tempo, ${instStr}, smooth transition build, modern atmospheric feel`;
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

    const { terpenes, inputAudio } = request.body;

    if (!terpenes) {
        return response.status(400).json({ error: 'Missing terpenes' });
    }

    const prompt = generateMusicPromptFromTerpenes(terpenes);
    const API_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;

    if (!API_TOKEN) {
        console.error('SERVER: Missing REPLICATE_API_TOKEN or REPLICATE_API_KEY');
        return response.status(500).json({ error: 'Server Configuration Error: Missing Replicate API Token' });
    }

    try {
        const replicate = new Replicate({
            auth: API_TOKEN,
        });

        // Use the simplified model identifiers as recommended
        const model = inputAudio ? "meta/musicgen-melody" : "meta/musicgen";

        console.log(`REPLICATE: Running model ${model} for prompt:`, prompt);
        if (inputAudio) console.log('REPLICATE: Using inputAudio for melody conditioning:', inputAudio);

        const input = {
            prompt: prompt,
            duration: 30
        };

        if (inputAudio) {
            input.input_audio = inputAudio;
        }

        const output = await replicate.run(model, { input });

        console.log('REPLICATE: Success, output type:', typeof output);

        let audioUrl = output;
        if (output && typeof output.url === 'function') {
            audioUrl = output.url();
        }

        console.log('REPLICATE: Final audio URL:', audioUrl);

        return response.status(200).json({ audio: audioUrl });
    } catch (error) {
        console.error('REPLICATE ERROR:', error);
        const message = error.message || 'Music generation failed';
        return response.status(500).json({ error: message, details: error.toString() });
    }
};
