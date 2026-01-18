import { CSSProperties } from 'react';

/**
 * Generates the "Swiss Luxury" Glass Border Style.
 * Renders a 1px gradient border with inner glow and subtle bloom.
 * 
 * Usage:
 * <div style={getGlassCardStyles(color1, color2)} className="rounded-2xl ..." />
 */
export function getGlassCardStyles(primaryColor: string, secondaryColor: string = '#ffffff'): CSSProperties {
    // Ensure valid colors (fallback to white if missing)
    const c1 = primaryColor || '#ffffff';
    const c2 = secondaryColor || primaryColor || '#ffffff';

    return {
        // The Border Gradient (via border-box background)
        // We use the standard "double background" trick for rounded gradient borders
        // Layer 1: The Card Body (Black/Transparent) - Padding Box
        // Layer 2: The Border Gradient - Border Box
        background: `
            linear-gradient(rgba(10, 10, 10, 0.6), rgba(0, 0, 0, 0.9)) padding-box, 
            linear-gradient(135deg, ${c1}40 0%, ${c2}20 45%, rgba(255,255,255,0.2) 50%, ${c1}30 100%) border-box
        `,
        border: '1px solid transparent',

        // Soft Inner Glow (Inset Shadow)
        boxShadow: `
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.05), 
            inset 0 0 20px -10px ${c1}20
        `,

        // Ensure backdrop filter works if used with transparency
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
    };
}

/**
 * Returns the "Hover" state bloom styles.
 * Use via state or styled-components, or merge if using inline hover logic (difficult in plain React).
 * Ideally applied via a class that triggers vars, but here we provide the raw values for Framer Motion variants.
 */
export function getGlassHoverStyles(primaryColor: string): CSSProperties {
    const c1 = primaryColor || '#ffffff';
    return {
        // Outer Bloom on Hover
        boxShadow: `
            0 8px 32px -8px ${c1}30,
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)
        `,
        borderColor: `${c1}60` // Slight border boost if using border-color fallback
    };
}
