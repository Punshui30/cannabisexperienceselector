import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';

/**
 * ENGINE SNAPSHOT STORE
 * 
 * Purpose: Provide read-only access to the last successful engine run
 * for the Live Assistant conversation facade.
 * 
 * This is a singleton that stores a snapshot of engine results.
 * The Live Assistant reads from this snapshot but NEVER writes to it.
 */

export interface EngineSnapshot {
    inputs: string | null;
    results: (UIBlendRecommendation | UIStackRecommendation)[] | null;
    summary: string | null;
    timestamp: number;
}

// Singleton instance
let currentSnapshot: EngineSnapshot = {
    inputs: null,
    results: null,
    summary: null,
    timestamp: 0
};

/**
 * Get the current engine snapshot (read-only)
 */
export function getEngineSnapshot(): EngineSnapshot {
    return { ...currentSnapshot }; // Return a copy to prevent mutation
}

/**
 * Update the engine snapshot (called only by App.tsx after successful orchestration)
 */
export function updateEngineSnapshot(snapshot: Partial<EngineSnapshot>): void {
    currentSnapshot = {
        ...currentSnapshot,
        ...snapshot,
        timestamp: Date.now()
    };
    console.log('[EngineSnapshot] Updated:', {
        hasInputs: !!currentSnapshot.inputs,
        resultCount: currentSnapshot.results?.length || 0,
        timestamp: new Date(currentSnapshot.timestamp).toISOString()
    });
}

/**
 * Check if a valid snapshot exists
 */
export function hasValidSnapshot(): boolean {
    return currentSnapshot.results !== null && currentSnapshot.results.length > 0;
}
