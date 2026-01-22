import { motion, HTMLMotionProps } from 'motion/react';
import { getGlassCardStyles } from '../lib/glassStyles';
import { ReactNode } from 'react';

interface CardShellProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    color?: string;
    secondaryColor?: string;
    className?: string; // Allow overrides
    noPadding?: boolean;
}

export function CardShell({
    children,
    color = '#ffffff',
    secondaryColor,
    className = '',
    noPadding = false,
    ...motionProps
}: CardShellProps) {
    const glassStyles = getGlassCardStyles(color, secondaryColor);

    return (
        <motion.div
            className={`relative overflow-hidden shadow-2xl rounded-[2rem] group ${className}`}
            style={{
                ...glassStyles,
                border: 'none', // Use pseudo-border for higher fidelity
            }}
            {...motionProps}
        >
            {/* High-Fidelity Masked Iridescent Border */}
            <div className="absolute inset-0 p-[1px] rounded-[inherit] pointer-events-none z-0"
                style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, ${color}40 100%)`,
                }}>
                <div className="w-full h-full bg-black rounded-[inherit]" />
            </div>

            {/* Content Container */}
            <div className={`relative z-10 h-full ${noPadding ? '' : 'p-6 sm:p-8'}`}>
                {children}
            </div>
        </motion.div>
    );
}
