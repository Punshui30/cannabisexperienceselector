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
    return (
        <motion.div
            className={`relative overflow-hidden shadow-2xl rounded-3xl group ${className}`}
            style={getGlassCardStyles(color, secondaryColor)}
            {...motionProps}
        >
            {/* Standard Background Effect (Optional extra depth) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-black/40 pointer-events-none" />

            {/* Content Container */}
            <div className={`relative z-10 h-full ${noPadding ? '' : 'p-6 sm:p-8'}`}>
                {children}
            </div>
        </motion.div>
    );
}
