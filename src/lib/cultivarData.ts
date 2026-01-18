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
    // --- FOCUS & ENERGY (Sativas & Sativa-Dominant) ---
    "Jack Herer": { color: "#00FF9D", terpenes: ["Terpinolene", "Ocimene", "Pinene"] },
    "Durban Poison": { color: "#FFFF00", terpenes: ["Terpinolene", "Myrcene", "Ocimene"] },
    "Super Lemon Haze": { color: "#FAFF00", terpenes: ["Terpinolene", "Limonene", "Caryophyllene"] },
    "Sour Diesel": { color: "#32CD32", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },
    "Green Crack": { color: "#76FF03", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "Tangie": { color: "#FF5E00", terpenes: ["Limonene", "Myrcene", "Pinene"] },
    "Maui Wowie": { color: "#FFE135", terpenes: ["Myrcene", "Pinene", "Linalool"] },
    "Strawberry Cough": { color: "#FF0040", terpenes: ["Caryophyllene", "Limonene", "Pinene"] },
    "Chocolope": { color: "#8B4513", terpenes: ["Caryophyllene", "Myrcene", "Limonene"] },
    "Amnesia Haze": { color: "#CCFF00", terpenes: ["Terpinolene", "Caryophyllene", "Humulene"] },
    "Clementine": { color: "#FF8C00", terpenes: ["Terpinolene", "Ocimene", "Myrcene"] },
    "Red Congolese": { color: "#FF2400", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "Super Silver Haze": { color: "#C0C0C0", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] },
    "Ghost Train Haze": { color: "#BFFF00", terpenes: ["Terpinolene", "Myrcene", "Limonene"] },
    "Harlequin": { color: "#FF69B4", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "XJ-13": { color: "#00FF7F", terpenes: ["Terpinolene", "Caryophyllene", "Pinene"] },
    "Island Sweet Skunk": { color: "#FFD700", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "J1": { color: "#98FB98", terpenes: ["Terpinolene", "Caryophyllene", "Ocimene"] },
    "Golden Goat": { color: "#D4AF37", terpenes: ["Terpinolene", "Caryophyllene", "Myrcene"] },
    "Alaskan Thunder Fuck": { color: "#50C878", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] },

    // --- SOCIAL & HYBRID ---
    "Gelato": { color: "#FFaa00", terpenes: ["Caryophyllene", "Limonene", "Humulene"] },
    "GSC": { color: "#A855F7", terpenes: ["Caryophyllene", "Limonene", "Humulene"] },
    "Wedding Cake": { color: "#F472B6", terpenes: ["Limonene", "Caryophyllene", "Myrcene"] },
    "Zkittlez": { color: "#FF4500", terpenes: ["Caryophyllene", "Humulene", "Linalool"] },
    "Blue Dream": { color: "#3B82F6", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "White Widow": { color: "#E0FFFF", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "Chemdawg": { color: "#9ACD32", terpenes: ["Caryophyllene", "Myrcene", "Limonene"] },
    "OG Kush": { color: "#22D3EE", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] },
    "Pineapple Express": { color: "#E6E6FA", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },
    "Sherbert": { color: "#FF1493", terpenes: ["Caryophyllene", "Limonene", "Humulene"] },
    "Trainwreck": { color: "#808000", terpenes: ["Terpinolene", "Myrcene", "Pinene"] },
    "AK-47": { color: "#CD5C5C", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "Bruce Banner": { color: "#006400", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },
    "MAC 1": { color: "#FFDAB9", terpenes: ["Limonene", "Pinene", "Caryophyllene"] },
    "Runtz": { color: "#FF00FF", terpenes: ["Caryophyllene", "Limonene", "Linalool"] },
    "Sundae Driver": { color: "#DA70D6", terpenes: ["Limonene", "Caryophyllene", "Linalool"] },
    "Mimosa": { color: "#FFA500", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "Apple Fritter": { color: "#8FBC8F", terpenes: ["Caryophyllene", "Limonene", "Pinene"] },
    "Do-Si-Dos": { color: "#BA55D3", terpenes: ["Limonene", "Caryophyllene", "Linalool"] },
    "Cherry Pie": { color: "#8B0000", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },

    // --- RELAX & SLEEP (Indicas & Indica-Dominant) ---
    "Granddaddy Purple": { color: "#7C3AED", terpenes: ["Myrcene", "Linalool", "Caryophyllene"] },
    "Northern Lights": { color: "#6366F1", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] },
    "Bubba Kush": { color: "#4F46E5", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },
    "Purple Punch": { color: "#9400D3", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },
    "Skywalker OG": { color: "#4682B4", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] },
    "Blueberry": { color: "#2563EB", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "King Louis XIII": { color: "#191970", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] },
    "Hindu Kush": { color: "#556B2F", terpenes: ["Caryophyllene", "Myrcene", "Limonene"] },
    "Big Bud": { color: "#800080", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "Grape Ape": { color: "#4B0082", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "9 Pound Hammer": { color: "#483D8B", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "Afghan Kush": { color: "#008080", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "LA Confidential": { color: "#2F4F4F", terpenes: ["Pinene", "Myrcene", "Caryophyllene"] },
    "Master Kush": { color: "#2E8B57", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] },
    "Platinum OG": { color: "#C0C0C0", terpenes: ["Myrcene", "Limonene", "Caryophyllene"] },
    "Mazar": { color: "#000080", terpenes: ["Myrcene", "Caryophyllene", "Pinene"] },
    "Blackberry Kush": { color: "#32174D", terpenes: ["Caryophyllene", "Limonene", "Myrcene"] },
    "Tahoe OG": { color: "#008B8B", terpenes: ["Limonene", "Myrcene", "Caryophyllene"] },
    "Forbidden Fruit": { color: "#DB7093", terpenes: ["Myrcene", "Caryophyllene", "Limonene"] },

    // --- CBD & SPECIFIC ---
    "ACDC": { color: "#D946EF", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "Cannatonic": { color: "#10B981", terpenes: ["Myrcene", "Pinene", "Linalool"] },
    "Harle-Tsu": { color: "#FFA07A", terpenes: ["Myrcene", "Terpinolene", "Pinene"] },
    "Charlotte's Web": { color: "#FFFFF0", terpenes: ["Myrcene", "Caryophyllene", "Linalool"] },
    "Ringo's Gift": { color: "#F0E68C", terpenes: ["Myrcene", "Pinene", "Caryophyllene"] },
    "Pennywise": { color: "#BDB76B", terpenes: ["Myrcene", "Pinene", "Terpinolene"] },

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
