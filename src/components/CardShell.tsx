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
            className={`relative shadow-2xl rounded-[2rem] group ${className} ${as === 'button' ? 'text-left focus:outline-none' : ''}`}
            style={{
                ...glassStyles,
                border: 'none',
            }}
            {...motionProps}
        >
            {/* The Hairline Border (Rest of card) */}
            <div className="absolute inset-0 rounded-[inherit] border border-white/5 pointer-events-none z-10" />

            {/* The "Front" Edge Iridescent Light (Top Highlight) */}
            <div
                className="absolute top-0 left-[10%] right-[10%] h-[1px] opacity-100 z-20"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
                    boxShadow: `0 0 8px ${color}30`
                }}
            />

            {/* Corner Shimmer & Edge Polish */}
            <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
                style={{
                    border: '1px solid transparent',
                    background: `linear-gradient(135deg, ${color}20 0%, transparent 40%, transparent 60%, ${color}20 100%) border-box`,
                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    maskComposite: 'exclude',
                }}
            />

            {/* Content Container */}
            <div className={`relative z-10 h-full ${noPadding ? '' : 'p-6 sm:p-8'}`}>
                {children}
            </div>
        </Component>
    );
}
