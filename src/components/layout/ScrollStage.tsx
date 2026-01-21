import { ReactNode, forwardRef } from 'react';

interface ScrollStageProps {
    children: ReactNode;
    className?: string; // Allow limited extension for background colors if needed
}

/**
 * ScrollStage - The SINGLE Vertical Resolution Authority
 * 
 * Rules:
 * 1. This component MUST be the only element with overflow-y-auto in the main layout.
 * 2. It must be flex-1 to fill the AppShell.
 * 3. It applies the Safe Area padding for the footer.
 */
export const ScrollStage = forwardRef<HTMLDivElement, ScrollStageProps>(({ children, className = '' }, ref) => {
    return (
        <div
            ref={ref}
            id="scroll-stage"
            className={`flex-1 w-full overflow-y-auto overflow-x-hidden relative overscroll-contain pb-safe-footer ${className}`}
            style={{
                WebkitOverflowScrolling: 'touch', // Critical for iOS momentum
            }}
        >
            {children}
        </div>
    );
});

ScrollStage.displayName = 'ScrollStage';
