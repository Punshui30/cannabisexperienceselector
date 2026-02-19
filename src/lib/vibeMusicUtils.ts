export interface TerpeneTrait {
    tempo: string;
    mood: string;
    instruments: string;
}

export const terpeneToMusicMap: Record<string, TerpeneTrait> = {
    myrcene: { tempo: "slow", mood: "dreamy", instruments: "pads, ambient guitar" },
    limonene: { tempo: "medium", mood: "uplifting", instruments: "bright synth, clean guitar" },
    pinene: { tempo: "medium-fast", mood: "clear, focused", instruments: "acoustic, light percussion" },
    linalool: { tempo: "slow", mood: "calm, cinematic", instruments: "strings, soft piano" },
    caryophyllene: { tempo: "medium", mood: "grounded, gritty", instruments: "bass, analog synth" },
    humulene: { tempo: "medium", mood: "earthy, acoustic", instruments: "woodwinds, soft drums" },
    terpinolene: { tempo: "fast", mood: "energetic, complex", instruments: "staccato synths, intricate rhythms" },
    ocimene: { tempo: "medium-fast", mood: "bright, citrusy", instruments: "shimmering synths, bells" }
};

export function generateMusicPromptFromTerpenes(terpenes: { name: string, percent: number }[]): string {
    if (!terpenes || terpenes.length === 0) {
        return "30 second cinematic instrumental, balanced and atmospheric, smooth transition, modern feel";
    }

    // Sort by percentage and take top 3
    const topTerpenes = [...terpenes]
        .sort((a, b) => (b.percent || 0) - (a.percent || 0))
        .slice(0, 3);

    const moods: string[] = [];
    const instruments: string[] = [];
    let tempo = "medium";

    topTerpenes.forEach((t, index) => {
        const trait = terpeneToMusicMap[t.name.toLowerCase()];
        if (trait) {
            moods.push(trait.mood);
            instruments.push(trait.instruments);
            // Use the tempo of the primary terpene
            if (index === 0) tempo = trait.tempo;
        }
    });

    const moodsStr = moods.join(", ");
    const instStr = instruments.join(", ");

    return `30 second cinematic instrumental, ${moodsStr}, ${tempo} tempo, ${instStr}, smooth transition build, modern atmospheric feel`;
}
