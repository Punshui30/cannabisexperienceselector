import { getCultivarVisuals, getTerpeneColor, CULTIVAR_MAP } from './cultivarData';

// --- Types ---

export interface VisualState {
    isActive?: boolean;
    isHovered?: boolean;
    isSelected?: boolean;
    isMuted?: boolean;
}

export interface CultivarVisuals {
    primaryColor: string;
    secondaryColor: string;
    glowStyle: string;      // box-shadow value
    borderStyle: string;    // border value
    backgroundStyle: string; // background value (gradient/solid)
    textAccent: string;     // color value
    opacity: number;
}

export interface TerpeneVisuals {
    color: string;
    badgeStyle: {
        backgroundColor: string;
        color: string;
        border: string;
        boxShadow: string;
    };
}

// --- Primitives ---

/**
 * Universal Glow Intensity Levels
 * Controls the "premium" feel. Low is subtle, High is active/focused.
 */
const GLOW_OPACITY = {
    active: '66',  // 40% (Hex) - Strong
    passive: '26', // 15% (Hex) - Subtle
    muted: '00',   // 0%  (Hex) - Off
};

const BORDER_OPACITY = {
    active: '80',  // 50%
    passive: '20', // 12%
    muted: '10',   // 6%
};

// --- Resolvers ---

/**
 * Resolves the visual semantics for a cultivar.
 * Dictates color, glow, and border treatments based on data and state.
 */
export function resolveCultivarVisuals(
    name: string,
    type?: string,
    state: VisualState = {}
): CultivarVisuals {
    // 1. Get Canonical Data
    const data = getCultivarVisuals(name, type);
    const color = data.color;

    // 2. Determine State Context
    const isActive = state.isActive || state.isSelected || state.isHovered;
    const isMuted = state.isMuted;

    // 3. Resolve Treatments
    // Note: We avoid heavy iridescence everywhere, reserving it for active states often applied via CSS classes.
    // Here we return inline-style compatible values.

    const glowHex = isActive ? GLOW_OPACITY.active : GLOW_OPACITY.passive;
    const borderHex = isActive ? BORDER_OPACITY.active : BORDER_OPACITY.passive;

    return {
        primaryColor: color,
        secondaryColor: color, // TODO: Implement brightness shift if needed
        glowStyle: isMuted ? 'none' : `0 0 20px ${color}${glowHex}`,
        borderStyle: isMuted ? `1px solid ${color}0D` : `1px solid ${color}${borderHex}`,
        backgroundStyle: isActive
            ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
            : `linear-gradient(135deg, ${color}0A 0%, ${color}02 100%)`,
        textAccent: color,
        opacity: isMuted ? 0.5 : 1
    };
}

/**
 * Resolves the visual semantics for a terpene.
 * Provides consistent badge styling.
 */
export function resolveTerpeneVisuals(name: string, state: VisualState = {}): TerpeneVisuals {
    const color = getTerpeneColor(name);
    const isActive = state.isActive || state.isHovered;

    return {
        color,
        badgeStyle: {
            backgroundColor: `${color}15`, // 8% Opacity
            color: color,
            border: `1px solid ${color}${isActive ? '40' : '20'}`,
            boxShadow: isActive ? `0 0 8px ${color}33` : 'none'
        }
    };
}

/**
 * Resolves visual semantics for Stack Phases (Ignition, Cruise, Landing).
 */
export interface PhaseVisuals {
    color: string;
    gradient: string;
}

export function resolvePhaseVisuals(index: number): PhaseVisuals {
    const THEMES = [
        { color: "#bef264", gradient: "from-lime-400/20 to-yellow-400/5" }, // Lime/Yellow (Ignition)
        { color: "#22d3ee", gradient: "from-cyan-400/20 to-blue-500/5" },   // Cyan/Blue (Cruise)
        { color: "#a78bfa", gradient: "from-violet-400/20 to-slate-400/5" }  // Violet (Landing)
    ];
    return THEMES[index % THEMES.length];
}

// --- Helpers ---

// "Swiss Watch" Iridescent Border Utility (Exported Class Name Helper)
// To be used in className compositions: `className="... ${IRIDESCENT_BORDER_CLASS}"`
// Requires Tailwind config compatibility or standard CSS class definition.
// For now, we rely on inline styles for dynamic colors.
