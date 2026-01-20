import { CSSProperties } from 'react';

/**
 * Generates the "Swiss Luxury" Glass Border Style with premium iridescent treatment.
 * Features two-layer border system: hairline perimeter + subtle iridescent hint.
 * 
 * Usage:
 * <div style={getGlassCardStyles(color1, color2)} className="rounded-2xl ..." />
 */
export function getGlassCardStyles(primaryColor: string = '#00FFD1', secondaryColor?: string): CSSProperties {
    const gradientColor = secondaryColor || primaryColor;

    return {
        background: `
            linear-gradient(135deg, 
                rgba(255, 255, 255, 0.03) 0%, 
                rgba(0, 0, 0, 0.4) 100%
            )
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',

        // Layer 2: Hairline perimeter with subtle iridescent hint
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
            inset 0 0 0 1px ${primaryColor}30,
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.2)
        `,

        // Note: borderImage doesn't respect border-radius, removed for clean rounded corners
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
