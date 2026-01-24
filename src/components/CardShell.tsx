import { motion, HTMLMotionProps } from 'motion/react';
import { getGlassCardStyles } from '../lib/glassStyles';
import { ReactNode } from 'react';

interface CardShellProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    color?: string;
    secondaryColor?: string;
    className?: string; // Allow overrides
    noPadding?: boolean;
    as?: 'div' | 'button';
}

export function CardShell({
    children,
    color = '#ffffff',
    secondaryColor,
    className = '',
    noPadding = false,
    as = 'div',
    ...motionProps
}: CardShellProps) {
    const glassStyles = getGlassCardStyles(color, secondaryColor);
    const Component = (as === 'button' ? motion.button : motion.div) as any;

    return (
        <Component
            className={`relative shadow-2xl rounded-[2rem] group overflow-hidden ${className} ${as === 'button' ? 'text-left focus:outline-none' : ''}`}
            style={{
                ...glassStyles,
                border: 'none',
            }}
            {...motionProps}
        >
            {/* The Hairline Border (Rest of card) */}
            <div className="absolute inset-0 rounded-[inherit] border border-white/5 pointer-events-none z-10" />

            {/* IRIDESCENT PERIMETER STROKE (1.5px, Low Opacity Brand Blend) */}
            <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none z-20"
                style={{
                    padding: '1.5px',
                    background: `linear-gradient(135deg, #10B98120, #8B5CF620, #F59E0B20)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            />

            {/* SUBTLE INNER GLOW (Depth without Motion) */}
            <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
                style={{
                    boxShadow: `inset 0 0 18px rgba(255, 255, 255, 0.03)`,
                }}
            />

            {/* Content Container */}
            <div className={`relative z-10 h-full ${noPadding ? '' : 'p-6 sm:p-8'}`}>
                {children}
            </div>
        </Component>
    );
}
