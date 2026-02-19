/**
 * STACK WEIGHT NORMALIZATION
 * --------------------------
 * Ensures that cultivar compositions in a stack total exactly 100%.
 * Handles equal weighting and explicit weight normalization.
 */

export interface WeightedCultivar {
    name: string;
    weight?: number; // Equivalent to 'ratio' in our domain
    [key: string]: any;
}

export interface NormalizedComposition {
    name: string;
    percent: number;
    original: any;
}

export function normalizeStackWeights(
    cultivars: WeightedCultivar[]
): NormalizedComposition[] {
    if (!cultivars || cultivars.length === 0) return [];

    // 1. Assign default weights if missing (1 each)
    const items = cultivars.map(c => ({
        name: c.name,
        weight: c.weight !== undefined ? c.weight : (c.ratio !== undefined ? c.ratio : 1),
        original: c
    }));

    // 2. Compute total weight
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

    if (totalWeight === 0) {
        return items.map(item => ({
            name: item.name,
            percent: 0,
            original: item.original
        }));
    }

    // 3. Compute raw percentages
    const result: NormalizedComposition[] = items.map(item => ({
        name: item.name,
        percent: (item.weight / totalWeight) * 100,
        original: item.original
    }));

    // 4. Round to whole numbers (as requested) and fix rounding errors
    // We'll use 1 decimal place as mentioned in requirements ("whole numbers or 1 decimal max")
    // Let's stick to 0 decimal places for cleaner UI if possible, or 1 for accuracy.
    // Requirement says "34% / 33% / 33%", so whole numbers.
    let roundedTotal = 0;
    const finalResult = result.map(item => {
        const rounded = Math.round(item.percent);
        roundedTotal += rounded;
        return { ...item, percent: rounded };
    });

    // 5. Adjust last item to absorb rounding error
    const diff = 100 - roundedTotal;
    if (diff !== 0 && finalResult.length > 0) {
        finalResult[finalResult.length - 1].percent += diff;
    }

    return finalResult;
}
