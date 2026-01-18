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
    // Focus Stacks - Electric Greens & Blues
    "Jack Herer": { color: "#00FF9D", terpenes: ["Terpinolene", "Ocimene", "Pinene"] }, // Neon Mint
    "Blue Dream": { color: "#3B82F6", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] }, // Electric Blue
    "ACDC": { color: "#D946EF", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] }, // Hot Magenta
    "Harlequin": { color: "#FF00FF", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] }, // Neon Pink

    // Sleep/Deep Stacks - Deep Neon Purples & Indigos
    "Granddaddy Purple": { color: "#7C3AED", terpenes: ["Myrcene", "Linalool", "Caryophyllene"] }, // Deep Violet
    "Northern Lights": { color: "#6366F1", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] }, // Indigo Neon
    "Bubba Kush": { color: "#4F46E5", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] }, // Electric Indigo

    // Social/Fun - Vivid Warm Tones
    "Gelato": { color: "#FFaa00", terpenes: ["Caryophyllene", "Limonene", "Humulene"] }, // Bright Amber
    "Zkittlez": { color: "#FF4500", terpenes: ["Caryophyllene", "Humulene", "Linalool"] }, // Neon Orange-Red
    "Durban Poison": { color: "#FFFF00", terpenes: ["Terpinolene", "Myrcene", "Ocimene"] }, // Pure Yellow
    "Cannatonic": { color: "#10B981", terpenes: ["Myrcene", "Pinene", "Linalool"] }, // Emerald
    "Super Lemon Haze": { color: "#FAFF00", terpenes: ["Terpinolene", "Limonene", "Caryophyllene"] }, // High-Vis Yellow
    "Tangie": { color: "#FF5E00", terpenes: ["Limonene"] }, // Hyper Orange

    // Balance/Recovery - Rich Accents
    "GSC": { color: "#A855F7", terpenes: ["Caryophyllene", "Limonene", "Humulene"] }, // Purple
    "OG Kush": { color: "#22D3EE", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] }, // Cyan
    "GG4": { color: "#9CA3AF", terpenes: ["Caryophyllene", "Myrcene", "Humulene"] }, // Silver
    "Lemon Haze": { color: "#FDE047", terpenes: ["Limonene", "Terpinolene", "Caryophyllene"] },
    "Sour Tangie": { color: "#F97316", terpenes: ["Limonene", "Caryophyllene", "Myrcene"] },
    "Blueberry": { color: "#2563EB", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] }, // Royal Blue
    "Strawberry Cough": { color: "#F43F5E", terpenes: ["Caryophyllene", "Limonene", "Pinene"] }, // Rose Red
    "Wedding Cake": { color: "#F472B6", terpenes: ["Limonene", "Caryophyllene", "Myrcene"] },

    // Fallback
    "Unknown": { color: "#94A3B8", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] }
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

import { UIStackRecommendation } from '../types/domain';

export function getStackTerpeneProfile(stack: UIStackRecommendation): { name: string; weight: number; color: string }[] {
    const terpeneWeights: Record<string, number> = {};
    const layerWeight = 1 / (stack.layers?.length || 1);

    stack.layers.forEach(layer => {
        layer.cultivars.forEach(cultivar => {
            const visuals = getCultivarVisuals(cultivar.name);
            const cultivarWeight = (cultivar.ratio || 1) * layerWeight;

            visuals.terpenes.forEach((t, idx) => {
                // Weight degradation: Primary terpene gets more weight than secondary
                // Visuals.terpenes is ordered list.
                const prominence = 1 / (idx + 1);

                if (!terpeneWeights[t]) terpeneWeights[t] = 0;
                terpeneWeights[t] += (cultivarWeight * prominence);
            });
        });
    });

    return Object.entries(terpeneWeights)
        .map(([name, weight]) => ({
            name,
            weight,
            color: getTerpeneColor(name)
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);
}
