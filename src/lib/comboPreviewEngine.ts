/**
 * COMBO PREVIEW ENGINE — v3  (dynamic ratios + LLM narrative)
 *
 * - Accepts per-cultivar ratios (must sum to 1.0).
 * - Computes weighted THC/CBD and effect vector.
 * - Derives topEffects, watchOuts, bestTime from vector.
 * - Calls LLM (via /api/llm) for narrative — debounce enforced by caller.
 * - No hardcoded fallback copy.
 *
 * Debug contract:
 *   console.log("[COMBO_DYNAMIC_PREVIEW]", { ids, ratios, weightedTHC, weightedCBD, combinedVector, bestTime, topEffects, riskVector })
 *   console.warn("[COMBO_PREVIEW_FAIL]", { ids, error })
 */

import { INVENTORY } from './inventory';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EffectVector {
    energy: number;  // -1 = deep calm, +1 = electric uplift
    focus: number;  // -1 = dreamy/spacey, +1 = sharp clarity
    mood: number;  // -1 = introspective/quiet, +1 = social/euphoric
    body: number;  // -1 = light/airy, +1 = heavy/sedating body lock
    creativity: number;  // -1 = grounded, +1 = creative/divergent
    anxiety: number;  // -1 = strongly anxiolytic, +1 = anxiety-provoking
}

export interface ComboPreviewResult {
    cultivarIds: string[];
    cultivarNames: string[];
    ratios: number[];          // e.g. [0.4, 0.35, 0.25]
    outcomeLabels: string[];
    summary: string;            // LLM-generated; initially empty, set by generateNarrative()
    topEffects: string[];
    watchOuts: string[];
    bestTime: 'day' | 'afternoon' | 'evening' | 'night' | 'unknown';
    avgTHC: number | null;
    avgCBD: number | null;
    _vector: EffectVector;
}

// ── Terpene influence table ───────────────────────────────────────────────────

const TERPENE_INFLUENCES: Record<string, EffectVector> = {
    limonene: { energy: 0.6, focus: 0.3, mood: 0.8, body: 0.0, creativity: 0.5, anxiety: -0.4 },
    pinene: { energy: 0.4, focus: 0.7, mood: 0.2, body: 0.0, creativity: 0.3, anxiety: -0.3 },
    myrcene: { energy: -0.7, focus: -0.3, mood: 0.1, body: 0.8, creativity: 0.0, anxiety: -0.5 },
    linalool: { energy: -0.4, focus: 0.0, mood: 0.3, body: 0.3, creativity: 0.2, anxiety: -0.7 },
    caryophyllene: { energy: 0.0, focus: 0.1, mood: 0.2, body: 0.5, creativity: 0.0, anxiety: -0.6 },
    humulene: { energy: -0.2, focus: 0.2, mood: 0.0, body: 0.3, creativity: 0.1, anxiety: 0.0 },
    terpinolene: { energy: 0.5, focus: 0.2, mood: 0.6, body: 0.1, creativity: 0.7, anxiety: 0.1 },
    ocimene: { energy: 0.3, focus: 0.1, mood: 0.5, body: 0.0, creativity: 0.4, anxiety: -0.2 },
    bisabolol: { energy: -0.3, focus: 0.0, mood: 0.2, body: 0.2, creativity: 0.0, anxiety: -0.5 },
    camphene: { energy: 0.2, focus: 0.3, mood: 0.0, body: 0.1, creativity: 0.0, anxiety: 0.0 },
    valencene: { energy: 0.3, focus: 0.2, mood: 0.4, body: 0.0, creativity: 0.3, anxiety: -0.1 },
    geraniol: { energy: 0.1, focus: 0.0, mood: 0.4, body: 0.1, creativity: 0.3, anxiety: -0.3 },
    nerolidol: { energy: -0.5, focus: -0.1, mood: 0.2, body: 0.4, creativity: 0.1, anxiety: -0.4 },
    terpineol: { energy: -0.4, focus: 0.0, mood: 0.2, body: 0.3, creativity: 0.1, anxiety: -0.4 },
    eucalyptol: { energy: 0.3, focus: 0.5, mood: 0.1, body: 0.0, creativity: 0.2, anxiety: 0.0 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min = -1, max = 1): number {
    return Math.min(max, Math.max(min, v));
}

function buildCultivarVector(terpenes: Record<string, number>): EffectVector | null {
    const entries = Object.entries(terpenes);
    if (entries.length === 0) return null;

    const vec: EffectVector = { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 };
    let totalWeight = 0;

    for (const [tName, tAmt] of entries) {
        const inf = TERPENE_INFLUENCES[tName.toLowerCase()];
        if (!inf) continue;
        const w = tAmt as number;
        vec.energy += inf.energy * w;
        vec.focus += inf.focus * w;
        vec.mood += inf.mood * w;
        vec.body += inf.body * w;
        vec.creativity += inf.creativity * w;
        vec.anxiety += inf.anxiety * w;
        totalWeight += w;
    }

    if (totalWeight === 0) return null;

    return {
        energy: clamp(vec.energy / totalWeight),
        focus: clamp(vec.focus / totalWeight),
        mood: clamp(vec.mood / totalWeight),
        body: clamp(vec.body / totalWeight),
        creativity: clamp(vec.creativity / totalWeight),
        anxiety: clamp(vec.anxiety / totalWeight),
    };
}

function weightedAverageVectors(vectors: EffectVector[], weights: number[]): EffectVector {
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    if (totalWeight === 0) return { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 };

    const sum = vectors.reduce<EffectVector>((acc, v, i) => ({
        energy: acc.energy + v.energy * weights[i],
        focus: acc.focus + v.focus * weights[i],
        mood: acc.mood + v.mood * weights[i],
        body: acc.body + v.body * weights[i],
        creativity: acc.creativity + v.creativity * weights[i],
        anxiety: acc.anxiety + v.anxiety * weights[i],
    }), { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 });

    return {
        energy: clamp(sum.energy / totalWeight),
        focus: clamp(sum.focus / totalWeight),
        mood: clamp(sum.mood / totalWeight),
        body: clamp(sum.body / totalWeight),
        creativity: clamp(sum.creativity / totalWeight),
        anxiety: clamp(sum.anxiety / totalWeight),
    };
}

// ── Outcome labels ────────────────────────────────────────────────────────────

function vectorToOutcomeLabels(v: EffectVector): string[] {
    const axes: Array<[string, number]> = [
        ['energy', v.energy],
        ['body', v.body],
        ['focus', v.focus],
        ['mood', v.mood],
        ['creativity', v.creativity],
    ];
    axes.sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

    const labelMap: Record<string, [string, string]> = {
        energy: ['Uplifting', 'Calming'],
        body: ['Body-heavy', 'Light'],
        focus: ['Clear-headed', 'Dreamy'],
        mood: ['Euphoric', 'Introspective'],
        creativity: ['Creative', 'Grounded'],
    };

    const labels = axes.slice(0, 2).map(([axis, val]) => {
        const [pos, neg] = labelMap[axis];
        return val >= 0 ? pos : neg;
    });

    return [...new Set(labels)];
}

// ── Top effects ───────────────────────────────────────────────────────────────

function vectorToEffectStrings(v: EffectVector): string[] {
    const effects: string[] = [];
    if (v.energy > 0.35) effects.push('Strong uplift');
    else if (v.energy > 0.15) effects.push('Mild energising');
    if (v.energy < -0.35) effects.push('Deep sedation');
    else if (v.energy < -0.15) effects.push('Heavy body relaxation');
    if (v.focus > 0.3) effects.push('Mental clarity');
    if (v.focus < -0.2) effects.push('Dreamy / spacey headspace');
    if (v.mood > 0.35) effects.push('Euphoria & mood lift');
    else if (v.mood > 0.15) effects.push('Gentle mood elevation');
    if (v.body > 0.45) effects.push('Full body relaxation');
    else if (v.body > 0.25) effects.push('Physical ease');
    if (v.creativity > 0.3) effects.push('Creative spark');
    if (v.anxiety < -0.4) effects.push('Strong anxiety relief');
    else if (v.anxiety < -0.25) effects.push('Mild anxiety reduction');
    return effects.slice(0, 5);
}

// ── Watch-outs ────────────────────────────────────────────────────────────────

function vectorToWatchOuts(v: EffectVector, avgThc: number | null): string[] {
    const w: string[] = [];
    if (v.anxiety > 0.1) w.push('May heighten anxiety — start very low.');
    if (v.anxiety > 0.05 && v.mood > 0.4) w.push('Paranoia risk with higher doses — pace yourself.');
    if (avgThc !== null && avgThc > 23) w.push(`Avg THC ${avgThc.toFixed(1)}% — high-potency, go slow.`);
    else if (avgThc !== null && avgThc > 20) w.push('Moderately high THC — first-time users start small.');
    if (v.body > 0.5 && v.energy < 0) w.push('Couch-lock potential — plan for a stationary session.');
    if (v.focus < -0.3) w.push('Impairs focus — not ideal before tasks requiring clarity.');
    if (v.energy < -0.4) w.push('Strong sedating tendency — avoid driving or machinery.');
    if (v.body > 0.3) w.push('Likely dry mouth — stay hydrated.');
    return w.slice(0, 3);
}

// ── Best time ─────────────────────────────────────────────────────────────────

function vectorToBestTime(v: EffectVector): 'day' | 'afternoon' | 'evening' | 'night' | 'unknown' {
    if (v.body > 0.45 && v.energy < -0.1) return 'night';
    if (v.body > 0.25 || v.energy < -0.05) return 'evening';
    if (v.energy > 0.2 && v.focus > 0.0) return 'day';
    if (v.mood > 0.2 || v.creativity > 0.2) return 'afternoon';
    return 'unknown';
}

// ── Main compute ──────────────────────────────────────────────────────────────

/**
 * Compute the dynamic combo preview from per-cultivar ratios.
 * ratios must be the same length as strainIds and should sum to 1.0 (normalized internally).
 */
export function computeComboPreview(
    strainIds: string[],
    ratios: number[],
): ComboPreviewResult {
    if (!strainIds.length) throw new Error('No strain IDs');

    // Normalize ratios so they sum to 1
    const total = ratios.reduce((s, r) => s + r, 0);
    const normalizedRatios = ratios.map(r => (total > 0 ? r / total : 1 / ratios.length));

    const cultivars = strainIds
        .map(id => INVENTORY.cultivars.find(c => c.id === id))
        .filter(Boolean) as typeof INVENTORY.cultivars;

    if (!cultivars.length) throw new Error('No valid cultivars found');

    // Build per-cultivar terpene vectors
    const cultivarVectors: Array<EffectVector | null> = cultivars.map(c =>
        buildCultivarVector(c.terpenes || {})
    );

    // Filter out nulls for the weighted average (keep weights in sync)
    const validPairs: Array<{ vec: EffectVector; weight: number }> = [];
    cultivarVectors.forEach((vec, i) => {
        if (vec) validPairs.push({ vec, weight: normalizedRatios[i] });
        else console.warn('[COMBO_PREVIEW_WARN] No terpene data for cultivar — excluded from vector', { id: cultivars[i].id });
    });

    if (!validPairs.length) throw new Error('All cultivars missing terpene data');

    const blended = weightedAverageVectors(
        validPairs.map(p => p.vec),
        validPairs.map(p => p.weight),
    );

    // Weighted THC / CBD — null if any cultivar is missing numeric data
    const hasTHC = cultivars.every(c => typeof c.thcPercent === 'number' && c.thcPercent > 0);
    const hasCBD = cultivars.every(c => typeof c.cbdPercent === 'number');
    const avgTHC = hasTHC
        ? Math.round(cultivars.reduce((s, c, i) => s + c.thcPercent * normalizedRatios[i], 0) * 10) / 10
        : null;
    const avgCBD = hasCBD
        ? Math.round(cultivars.reduce((s, c, i) => s + c.cbdPercent * normalizedRatios[i], 0) * 100) / 100
        : null;

    const outcomeLabels = vectorToOutcomeLabels(blended);
    const topEffects = vectorToEffectStrings(blended);
    const watchOuts = vectorToWatchOuts(blended, avgTHC);
    const bestTime = vectorToBestTime(blended);

    const result: ComboPreviewResult = {
        cultivarIds: strainIds,
        cultivarNames: cultivars.map(c => c.name),
        ratios: normalizedRatios,
        outcomeLabels,
        summary: '', // filled in by generateNarrative()
        topEffects,
        watchOuts,
        bestTime,
        avgTHC,
        avgCBD,
        _vector: blended,
    };

    console.log('[COMBO_DYNAMIC_PREVIEW]', {
        ids: strainIds,
        ratios: normalizedRatios.map(r => `${Math.round(r * 100)}%`),
        weightedTHC: avgTHC,
        weightedCBD: avgCBD,
        combinedVector: blended,
        bestTime,
        topEffects,
        riskVector: { anxiety: blended.anxiety, body: blended.body },
    });

    return result;
}

// ── LLM narrative generation ──────────────────────────────────────────────────

/**
 * Call the LLM to produce a 4–6 sentence natural-language narrative.
 * Returns the narrative string or null on failure.
 */
export async function generateNarrative(result: ComboPreviewResult): Promise<string | null> {
    const ratioLines = result.cultivarNames
        .map((name, i) => `- ${name} (${Math.round(result.ratios[i] * 100)}%)`)
        .join('\n');

    const prompt = [
        'You are a cannabis formulation narrator.',
        'Write a 4–6 sentence natural-language description of this custom blend.',
        '',
        'Inputs:',
        `Cultivars:\n${ratioLines}`,
        `Weighted THC: ${result.avgTHC !== null ? result.avgTHC + '%' : 'unknown'}`,
        `Weighted CBD: ${result.avgCBD !== null ? result.avgCBD + '%' : 'unknown'}`,
        `Primary effects: ${result.topEffects.join(', ') || 'none identified'}`,
        `Best time of day: ${result.bestTime}`,
        `Risk signals: ${result.watchOuts.join('; ') || 'none'}`,
        '',
        'Instructions:',
        'Explain how the specific ratios shape the experience — heavier cultivars dominate.',
        'Do not mention calculations or percentages in your response.',
        'Speak clearly and conversationally.',
        'Avoid medical claims.',
        'No filler phrases ("great choice", "perfect blend").',
        'No generic cannabis clichés.',
        'Be specific to these cultivars and their ratios.',
    ].join('\n');

    try {
        const response = await fetch('/api/llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a concise, clinical cannabis formulation narrator.' },
                    { role: 'user', content: prompt },
                ],
            }),
        });

        if (!response.ok) {
            console.warn('[COMBO_NARRATIVE_FAIL]', { status: response.status });
            return null;
        }

        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content || data.text || data.content || data.response || '';
        return text.trim() || null;
    } catch (err) {
        console.warn('[COMBO_NARRATIVE_FAIL]', { error: err });
        return null;
    }
}
