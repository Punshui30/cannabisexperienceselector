/**
 * COMBO PREVIEW ENGINE — v2
 *
 * Deterministic equal-ratio blend preview for "Predict this combo".
 * No external calls. No Tavily. No Perplexity.
 *
 * All text output is derived strictly from computed vectors.
 * NO generic fallback copy. If data is missing → null / empty array / "unknown".
 *
 * Debug contract:
 *   console.log("[COMBO_PREVIEW_OK]", { ids, names, bestTime, avgTHC, avgCBD, topEffects, watchOuts, vector })
 *   console.warn("[COMBO_PREVIEW_FAIL]", { ids, error })
 */

import { INVENTORY } from './inventory';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EffectVector {
    energy: number;  // -1 = deep calm, +1 = electric uplift
    focus: number;  // -1 = dreamy/spacey, +1 = sharp clarity
    mood: number;  // -1 = introspective/quiet, +1 = social/euphoric
    body: number;  // -1 = light/airy, +1 = heavy/sedating body lock
    creativity: number;  // -1 = grounded, +1 = creative/divergent
    anxiety: number;  // -1 = strongly anxiolytic, +1 = anxiety-provoking
}

// Copied from calculationEngine — NOT re-imported to avoid circular deps
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

// ── Output type ───────────────────────────────────────────────────────────────

export interface ComboPreviewResult {
    cultivarIds: string[];
    cultivarNames: string[];
    assumedRatios: number[];
    outcomeLabels: string[];   // e.g. ["Calm + Heavy", "Social"]
    summary: string;     // references cultivar names + specific computed traits
    topEffects: string[];   // strictly from vector; empty array if nothing qualifies
    watchOuts: string[];   // strictly from risk vector; empty array if nothing qualifies
    bestTime: 'day' | 'afternoon' | 'evening' | 'night' | 'unknown';
    avgTHC: number | null;  // null if any cultivar is missing the data
    avgCBD: number | null;  // null if any cultivar is missing the data
    // Internal — exposed for debug / verification
    _vector: EffectVector;
}

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
        if (!inf) continue; // skip unknown terpenes — no fallback
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

function averageVectors(vectors: EffectVector[]): EffectVector {
    const n = vectors.length;
    const sum = vectors.reduce<EffectVector>((acc, v) => ({
        energy: acc.energy + v.energy,
        focus: acc.focus + v.focus,
        mood: acc.mood + v.mood,
        body: acc.body + v.body,
        creativity: acc.creativity + v.creativity,
        anxiety: acc.anxiety + v.anxiety,
    }), { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 });

    return {
        energy: clamp(sum.energy / n),
        focus: clamp(sum.focus / n),
        mood: clamp(sum.mood / n),
        body: clamp(sum.body / n),
        creativity: clamp(sum.creativity / n),
        anxiety: clamp(sum.anxiety / n),
    };
}

// ── Outcome labels (2 dominant axes) ─────────────────────────────────────────

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

// ── Top effects  (strictly threshold-gated; no fallback) ─────────────────────

function vectorToEffectStrings(v: EffectVector): string[] {
    const effects: string[] = [];

    // Positive energy
    if (v.energy > 0.35) effects.push('Strong uplift');
    else if (v.energy > 0.15) effects.push('Mild energising');

    // Negative energy = body sedation onset
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

// ── Watch-outs (strictly risk-gated; no final catch-all fallback) ─────────────

function vectorToWatchOuts(v: EffectVector, avgThc: number | null): string[] {
    const w: string[] = [];

    if (v.anxiety > 0.1) w.push('May heighten anxiety in sensitive users — start very low.');
    if (v.anxiety > 0.05 && v.mood > 0.4) w.push('Paranoia risk with higher doses — pace yourself.');
    if (avgThc !== null && avgThc > 23) w.push(`Avg THC ${avgThc.toFixed(1)}% — high-potency combo, go slow.`);
    else if (avgThc !== null && avgThc > 20) w.push('Moderately high THC — first-time users should start small.');
    if (v.body > 0.5 && v.energy < 0) w.push('Couch-lock potential — plan for a stationary session.');
    if (v.focus < -0.3) w.push('Impairs concentration — not ideal before tasks requiring focus.');
    if (v.energy < -0.4) w.push('Strong sedating tendency — avoid driving or operating machinery.');

    // Dry mouth is universal for high myrcene/terpinolene combos — derive from vector proxy
    // body > 0.3 is a reasonable proxy for high myrcene presence
    if (v.body > 0.3) w.push('Likely dry mouth — stay hydrated.');

    return w.slice(0, 3);
}

// ── Best time (4-way, with wider thresholds to actually differentiate) ────────

function vectorToBestTime(v: EffectVector): 'day' | 'afternoon' | 'evening' | 'night' | 'unknown' {
    // Night: strongly sedating
    if (v.body > 0.45 && v.energy < -0.1) return 'night';
    // Evening: relaxing but not full knock-out
    if (v.body > 0.25 || v.energy < -0.05) return 'evening';
    // Day: energising and clear
    if (v.energy > 0.2 && v.focus > 0.0) return 'day';
    // Afternoon: uplifting mood but not sharp focus
    if (v.mood > 0.2 || v.creativity > 0.2) return 'afternoon';
    return 'unknown';
}

// ── Summary builder — strictly data-driven ────────────────────────────────────

function buildSummary(
    names: string[],
    labels: string[],
    bestTime: string,
    v: EffectVector,
    avgThc: number | null,
): string {
    const nameList = names.join(', ');

    // Energy descriptor
    let energyDesc = '';
    if (v.energy > 0.4) energyDesc = 'strongly uplifting';
    else if (v.energy > 0.15) energyDesc = 'mildly energising';
    else if (v.energy < -0.4) energyDesc = 'deeply sedating';
    else if (v.energy < -0.15) energyDesc = 'body-heavy with a calming pull';
    else energyDesc = 'balanced in energy';

    // Body descriptor
    let bodyDesc = '';
    if (v.body > 0.5) bodyDesc = 'with a heavy physical finish';
    else if (v.body > 0.3) bodyDesc = 'with noticeable body ease';
    else if (v.body > 0.15) bodyDesc = 'and mild physical relaxation';

    // Mood descriptor
    let moodDesc = '';
    if (v.mood > 0.45) moodDesc = ' — expect a euphoric, social mood lift';
    else if (v.mood > 0.25) moodDesc = ' — mood brightens noticeably';
    else if (v.mood < -0.15) moodDesc = ' — leans introspective and quiet';

    // Time label
    const timeLabel: Record<string, string> = {
        day: 'daytime activities',
        afternoon: 'afternoon or creative sessions',
        evening: 'evening wind-down',
        night: 'nighttime rest',
        unknown: 'use at your own pace',
    };

    // THC note
    const thcNote = avgThc !== null
        ? (avgThc > 22 ? ` At avg ${avgThc.toFixed(1)}% THC, start with a small amount.` : '')
        : '';

    return `Equal parts ${nameList} produce a ${energyDesc} experience${bodyDesc}${moodDesc}, best suited for ${timeLabel[bestTime] ?? 'flexible timing'}.${thcNote}`.trim();
}

// ── Main export ───────────────────────────────────────────────────────────────

export function predictCombo(strainIds: string[]): ComboPreviewResult {
    if (!strainIds || strainIds.length === 0) {
        console.warn('[COMBO_PREVIEW_FAIL]', { ids: strainIds, error: 'No strain IDs provided' });
        throw new Error('No strain IDs provided');
    }

    const cultivars = strainIds
        .map(id => INVENTORY.cultivars.find(c => c.id === id))
        .filter(Boolean) as typeof INVENTORY.cultivars;

    if (cultivars.length === 0) {
        console.warn('[COMBO_PREVIEW_FAIL]', { ids: strainIds, error: 'No matching cultivars in inventory' });
        throw new Error('No valid cultivars found for combo preview');
    }

    const ratio = 1 / cultivars.length;

    // Build per-cultivar terpene vectors — skip cultivars with no usable terpene data
    const cultivarVectors: EffectVector[] = [];
    for (const c of cultivars) {
        const vec = buildCultivarVector(c.terpenes || {});
        if (vec) {
            cultivarVectors.push(vec);
        } else {
            console.warn('[COMBO_PREVIEW_WARN] No usable terpene data for cultivar — excluded from vector average', { id: c.id, name: c.name });
        }
    }

    if (cultivarVectors.length === 0) {
        console.warn('[COMBO_PREVIEW_FAIL]', { ids: strainIds, error: 'All cultivars missing terpene data' });
        throw new Error('Cannot compute preview: no terpene data available for selected cultivars');
    }

    const blended = averageVectors(cultivarVectors);

    // THC / CBD — null if any field is missing/zero
    const hasTHC = cultivars.every(c => typeof c.thcPercent === 'number' && c.thcPercent > 0);
    const hasCBD = cultivars.every(c => typeof c.cbdPercent === 'number');
    const avgTHC = hasTHC ? Math.round((cultivars.reduce((s, c) => s + c.thcPercent, 0) / cultivars.length) * 10) / 10 : null;
    const avgCBD = hasCBD ? Math.round((cultivars.reduce((s, c) => s + c.cbdPercent, 0) / cultivars.length) * 100) / 100 : null;

    const outcomeLabels = vectorToOutcomeLabels(blended);
    const topEffects = vectorToEffectStrings(blended);
    const watchOuts = vectorToWatchOuts(blended, avgTHC);
    const bestTime = vectorToBestTime(blended);
    const cultivarNames = cultivars.map(c => c.name);
    const summary = buildSummary(cultivarNames, outcomeLabels, bestTime, blended, avgTHC);

    const result: ComboPreviewResult = {
        cultivarIds: strainIds,
        cultivarNames,
        assumedRatios: cultivars.map(() => ratio),
        outcomeLabels,
        summary,
        topEffects,
        watchOuts,
        bestTime,
        avgTHC,
        avgCBD,
        _vector: blended,
    };

    // ✅ Acceptance criteria: explicit success log with all derived values
    console.log('[COMBO_PREVIEW_OK]', {
        ids: strainIds,
        names: cultivarNames,
        bestTime,
        avgTHC,
        avgCBD,
        topEffects,
        watchOuts,
        vector: blended,
    });

    return result;
}
