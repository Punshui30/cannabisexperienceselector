import { motion, HTMLMotionProps } from 'framer-motion';
import { getGlassCardStyles } from '../lib/glassStyles';
import { ReactNode } from 'react';

interface CardShellProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    color?: string;
    secondaryColor?: string;
    className?: string; // Allow overrides
    noPadding?: boolean;
    as?: 'div' | 'button';
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
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

            {/* The "Front" Edge Iridescent Light (Top Highlight) */}
            <div
                className="absolute top-[1px] left-[15%] right-[15%] h-[2px] opacity-100 z-20"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${color}CC 20%, #ffffff 50%, ${color}CC 80%, transparent 100%)`,
                    boxShadow: `0 0 12px ${color}40`
                }}
            />

            {/* Corner Shimmer & Edge Polish */}
            <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
                style={{
                    border: '1px solid transparent',
                    background: `linear-gradient(to bottom, ${color}40 0%, transparent 30%, transparent 70%, ${color}20 100%) border-box`,
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
