// Canonical Mapping for Visuals & Credibility
// Maps Cultivar Name -> { color, terpenes }

export const TERPENE_COLORS: Record<string, string> = {
    "Myrcene": "#7C3AED", // Deep Purple (Sedating)
    "Limonene": "#FACC15", // Bright Yellow (Mood)
    "Caryophyllene": "#EA580C", // Orange/Spice (Relief)
    "Pinene": "#10B981", // Green (Focus)
    "Linalool": "#C084FC", // Lavender (Calm)
    "Terpinolene": "#A3E635", // Lime (Uplifting)
    "Ocimene": "#F472B6", // Pink (Sweet)
    "Humulene": "#8B5CF6", // Violet (Suppress)
    "Unknown": "#9CA3AF"
};

export interface CultivarVisualConfig {
    color: string;
    terpenes: string[];
}

export const CULTIVAR_MAP: Record<string, CultivarVisualConfig> = {
    // Focus Stacks
    "Jack Herer": { color: "#10B981", terpenes: ["Terpinolene", "Ocimene", "Pinene"] }, // Sativa - Green/Energy
    "Blue Dream": { color: "#3B82F6", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] }, // Hybrid - Blue/Calm
    "ACDC": { color: "#C026D3", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] }, // CBD - Purple/Comfort
    "Harlequin": { color: "#EC4899", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] }, // CBD - Pink

    // Sleep/Deep Stacks
    "Granddaddy Purple": { color: "#7C3AED", terpenes: ["Myrcene", "Linalool", "Caryophyllene"] }, // Indica - Deep Purple
    "Northern Lights": { color: "#4F46E5", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] }, // Indica - Indigo

    // Social/Fun
    "Gelato": { color: "#F59E0B", terpenes: ["Caryophyllene", "Limonene", "Humulene"] }, // Hybrid - Amber
    "Zkittlez": { color: "#EF4444", terpenes: ["Caryophyllene", "Humulene", "Linalool"] }, // Indica - Red/Sweet
    "Durban Poison": { color: "#FACC15", terpenes: ["Terpinolene", "Myrcene", "Ocimene"] }, // Sativa - Yellow/Bright
    "Cannatonic": { color: "#34D399", terpenes: ["Myrcene", "Pinene", "Linalool"] },
    "Super Lemon Haze": { color: "#FDE047", terpenes: ["Terpinolene", "Limonene", "Caryophyllene"] },

    // Balance/Recovery
    "GSC": { color: "#A855F7", terpenes: ["Caryophyllene", "Limonene", "Humulene"] },
    "OG Kush": { color: "#166534", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] },
    "GG4": { color: "#52525B", terpenes: ["Caryophyllene", "Myrcene", "Humulene"] },
    "Bubba Kush": { color: "#312E81", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },

    // Fallback
    "Unknown": { color: "#9CA3AF", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] }
};

export function getCultivarVisuals(name: string): CultivarVisualConfig {
    // Normalize checking
    const keys = Object.keys(CULTIVAR_MAP);
    const normalizedKey = keys.find(k => k.toLowerCase() === name.trim().toLowerCase());
    return normalizedKey ? CULTIVAR_MAP[normalizedKey] : CULTIVAR_MAP["Unknown"];
}

export function getTerpeneColor(terpeneName: string): string {
    return TERPENE_COLORS[terpeneName] || TERPENE_COLORS["Unknown"];
}
