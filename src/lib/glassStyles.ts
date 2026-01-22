import { CSSProperties } from 'react';

/**
 * Generates the "Swiss Luxury" Glass Border Style with premium iridescent treatment.
 * Features two-layer border system: hairline perimeter + subtle iridescent hint.
 * 
 * Usage:
 * <div style={getGlassCardStyles(color1, color2)} className="rounded-2xl ..." />
 */
/**
 * Generates the "Swiss Luxury" Glass Border Style with premium iridescent treatment.
 * 
 * New "Iridescent Hairline" Logic:
 * Uses a double-glow system to create that expensive, microscopic color-shift look
 * without breaking the dark/black aesthetic.
 */
export function getGlassCardStyles(primaryColor: string = '#00FFD1', secondaryColor?: string): CSSProperties {
    const accent = primaryColor || '#00FFD1';

    return {
        background: 'rgba(0,0,0,0.6)', // Darker, cleaner base
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        position: 'relative',

        // Layer 1: The true black core
        backgroundColor: '#000000',

        // Layer 2: Iridescent Hairline Border (using an inset shadow fix)
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `
            inset 0 0 0 0.5px ${accent}30, 
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
            0 16px 48px -12px rgba(0, 0, 0, 0.9),
            0 0 0px 1px rgba(255,255,255,0.03)
        `,
    };
}

/**
 * Iridescent Overlay Component (React usage)
 * Since borderImage doesn't respect border-radius, we use a 1px masked pseudo-border.
 */
export const IRIDESCENT_BORDER_CLASS = "before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/5 before:rounded-[inherit] before:content-[''] before:[mask-composite:exclude] before:[mask:linear-gradient(#fff_0_0)_content-box,_linear-gradient(#fff_0_0)]";

/**
 * Returns the "Hover" state bloom styles.
 */
export function getGlassHoverStyles(primaryColor: string): CSSProperties {
    const c1 = primaryColor || '#ffffff';
    return {
        boxShadow: `
            0 24px 64px -12px rgba(0, 0, 0, 0.9),
            0 0 20px -5px ${c1}30,
            inset 0 0 0 1px ${c1}40
        `,
        borderColor: `${c1}80`
    };
}
