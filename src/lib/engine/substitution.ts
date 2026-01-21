import { Cultivar, EffectVector, calculateCultivarEffect } from '../calculationEngine';

/**
 * SUBSTITUTION LOGIC
 * Finds a replacement cultivar that mathematically matches the removed cultivar's
 * functional role (Effect Vector) while respecting avoidance constraints.
 */

interface SubstitutionResult {
    success: boolean;
    replacement?: Cultivar;
    reason?: string;
    similarityScore?: number;
}

// Calculate Euclidean distance between two effect vectors (Lower is closer)
function calculateVectorDistance(v1: EffectVector, v2: EffectVector): number {
    const dEnergy = v1.energy - v2.energy;
    const dFocus = v1.focus - v2.focus;
    const dMood = v1.mood - v2.mood;
    const dBody = v1.body - v2.body;
    const dCreativity = v1.creativity - v2.creativity;
    const dAnxiety = v1.anxiety - v2.anxiety;

    return Math.sqrt(
        dEnergy * dEnergy +
        dFocus * dFocus +
        dMood * dMood +
        dBody * dBody +
        dCreativity * dCreativity +
        dAnxiety * dAnxiety
    );
}

// Main Substitution Function
export function findSubstitute(
    removedCultivarId: string,
    inventory: Cultivar[],
    avoidanceCriteria?: {
        family?: string; // e.g., "cherry", "cookie", "lemon"
        terpenes?: string[];
    }
): SubstitutionResult {
    // 1. Find the removed cultivar to get its Baseline Vector
    const removed = inventory.find(c => c.id === removedCultivarId);
    if (!removed) {
        return { success: false, reason: "Removed cultivar not found in inventory." };
    }

    const { effect: targetVector } = calculateCultivarEffect(removed);

    // 2. Filter candidates
    // - Must not be the removed cultivar
    // - Must not match avoidance criteria (fuzzy name match or terpene check)
    const candidates = inventory.filter(c => {
        if (c.id === removed.id) return false;

        // Avoidance Logic
        if (avoidanceCriteria?.family) {
            const family = avoidanceCriteria.family.toLowerCase();
            // Check name (e.g. "Cherry Pie" contains "cherry")
            if (c.name.toLowerCase().includes(family)) return false;
            // Check genetic lineage if available (mocked here by checking name)
        }

        if (avoidanceCriteria?.terpenes) {
            const hasBadTerp = avoidanceCriteria.terpenes.some(t =>
                (c.terpenes[t] || 0) > 0.05 // Threshold for avoidance
            );
            if (hasBadTerp) return false;
        }

        return true;
    });

    if (candidates.length === 0) {
        return { success: false, reason: "No valid candidates found after filtering." };
    }

    // 3. Score Candidates based on Vector Similarity
    let bestMatch: Cultivar | undefined;
    let minDistance = Infinity;

    for (const candidate of candidates) {
        const { effect: candidateVector } = calculateCultivarEffect(candidate);
        const distance = calculateVectorDistance(targetVector, candidateVector);

        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = candidate;
        }
    }

    // 4. Threshold Check
    const SIMILARITY_THRESHOLD = 1.5; // Tunable constant
    // Max distance in 6D space (assuming range -1 to 1) is sqrt(6 * 4) ~ 4.9.
    // 1.5 allows for "distinct but similar".

    if (bestMatch && minDistance <= SIMILARITY_THRESHOLD) {
        return {
            success: true,
            replacement: bestMatch,
            similarityScore: 1 - (minDistance / 5), // Rough normalized score
            reason: `Replaced ${removed.name} with ${bestMatch.name} (Dist: ${minDistance.toFixed(2)})`
        };
    }

    return {
        success: false,
        reason: "No candidate met the similarity threshold."
    };
}
