/**
 * COMBO PREVIEW ENGINE
 *
 * Deterministic equal-ratio blend preview for "Predict this combo".
 * No external calls. No Tavily. No Perplexity.
 *
 * Uses the same TERPENE_INFLUENCES table as the main engine,
 * but applies equal 1/N ratios to each selected cultivar.
 */

import { INVENTORY } from '../inventory';

// ── Effect labels ─────────────────────────────────────────────────────────────

interface EffectVector {
    energy: number;
    focus: number;
    mood: number;
    body: number;
    creativity: number;
    anxiety: number;
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

const FALLBACK_INFLUENCE: EffectVector = { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0.1 };

// ── Output types ──────────────────────────────────────────────────────────────

export interface ComboPreviewResult {
    cultivarNames: string[];
    outcomeLabels: string[];       // e.g. ["Calm + Heavy", "Social"]
    summary: string;               // 2–3 sentences
    topEffects: string[];          // up to 4 readable effect labels
    watchOuts: string[];           // up to 2 caution notes
    bestTime: 'day' | 'evening' | 'anytime';
    thcAvg: number;
    cbdAvg: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min = -1, max = 1): number {
    return Math.min(max, Math.max(min, v));
}

/** Map a numeric axis value (-1 to 1) to positive "strength" 0–1 */
function toStrength(v: number): number {
    return clamp((v + 1) / 2, 0, 1);
}

function combineVectors(vectors: EffectVector[]): EffectVector {
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

/** Pick the 1–2 dominant axes to produce natural label pairs like "Calm + Heavy" */
function vectorToOutcomeLabels(v: EffectVector): string[] {
    const axes: Array<[string, number]> = [
        ['energy', v.energy],
        ['body', v.body],
        ['focus', v.focus],
        ['mood', v.mood],
        ['creativity', v.creativity],
    ];

    // Sort by absolute magnitude (most dominant first)
    axes.sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

    const labelMap: Record<string, [string, string]> = {
        energy: ['Uplift', 'Calm'],
        body: ['Heavy', 'Light'],
        focus: ['Clear', 'Dreamy'],
        mood: ['Social', 'Quiet'],
        creativity: ['Creative', 'Grounded'],
    };

    const labels = axes.slice(0, 2).map(([axis, val]) => {
        const [pos, neg] = labelMap[axis];
        return val >= 0 ? pos : neg;
    });

    // Deduplicate
    return [...new Set(labels)];
}

function vectorToEffectStrings(v: EffectVector): string[] {
    const effects: string[] = [];
    if (v.energy > 0.2) effects.push('Uplifting energy');
    if (v.energy < -0.2) effects.push('Body-heavy, relaxing');
    if (v.focus > 0.25) effects.push('Mental clarity');
    if (v.mood > 0.25) effects.push('Mood elevation');
    if (v.body > 0.3) effects.push('Physical relaxation');
    if (v.creativity > 0.25) effects.push('Creative spark');
    if (v.anxiety < -0.3) effects.push('Anxiety reduction');
    return effects.slice(0, 4);
}

function vectorToWatchOuts(v: EffectVector, avgThc: number): string[] {
    const w: string[] = [];
    if (v.anxiety > 0.1) w.push('May increase anxiety — go slow at first.');
    if (avgThc > 22) w.push('Higher THC blend — start with a small amount.');
    if (v.body > 0.5 && v.energy < 0) w.push('Can cause sedation — best for evening.');
    if (w.length === 0) w.push('Effects vary by individual — start low.');
    return w.slice(0, 2);
}

function vectorToBestTime(v: EffectVector): 'day' | 'evening' | 'anytime' {
    if (v.energy > 0.3 && v.body < 0.2) return 'day';
    if (v.body > 0.4 || v.energy < -0.1) return 'evening';
    return 'anytime';
}

function buildSummary(labels: string[], cultivarNames: string[], bestTime: string, v: EffectVector): string {
    const timeLabel = bestTime === 'day' ? 'daytime use' : bestTime === 'evening' ? 'evening wind-down' : 'any time of day';
    const feel = labels.join(' and ').toLowerCase();
    const thcNote = v.anxiety > 0.05 ? 'Best enjoyed in small amounts.' : 'This combo tends to be approachable for most.';
    return `Equal parts ${cultivarNames.join(', ')} create a ${feel} experience, suited for ${timeLabel}. ${thcNote}`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function predictCombo(strainIds: string[]): ComboPreviewResult {
    const cultivars = strainIds
        .map(id => INVENTORY.cultivars.find(c => c.id === id))
        .filter(Boolean) as typeof INVENTORY.cultivars;

    if (cultivars.length === 0) {
        throw new Error('No valid cultivars found for combo preview');
    }

    const ratio = 1 / cultivars.length; // equal parts

    // Build weighted terpene vector for each cultivar, then average across all
    const cultivarVectors: EffectVector[] = cultivars.map(c => {
        const terpenes = c.terpenes || {};
        const terpeneVector: EffectVector = { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 };
        let totalWeight = 0;

        for (const [tName, tAmt] of Object.entries(terpenes)) {
            const inf = TERPENE_INFLUENCES[tName.toLowerCase()] || FALLBACK_INFLUENCE;
            const weight = tAmt as number;
            terpeneVector.energy += inf.energy * weight;
            terpeneVector.focus += inf.focus * weight;
            terpeneVector.mood += inf.mood * weight;
            terpeneVector.body += inf.body * weight;
            terpeneVector.creativity += inf.creativity * weight;
            terpeneVector.anxiety += inf.anxiety * weight;
            totalWeight += weight;
        }

        if (totalWeight > 0) {
            terpeneVector.energy = clamp(terpeneVector.energy / totalWeight);
            terpeneVector.focus = clamp(terpeneVector.focus / totalWeight);
            terpeneVector.mood = clamp(terpeneVector.mood / totalWeight);
            terpeneVector.body = clamp(terpeneVector.body / totalWeight);
            terpeneVector.creativity = clamp(terpeneVector.creativity / totalWeight);
            terpeneVector.anxiety = clamp(terpeneVector.anxiety / totalWeight);
        }

        return terpeneVector;
    });

    const blended = combineVectors(cultivarVectors);

    const avgThc = cultivars.reduce((s, c) => s + c.thcPercent, 0) / cultivars.length;
    const avgCbd = cultivars.reduce((s, c) => s + c.cbdPercent, 0) / cultivars.length;

    const outcomeLabels = vectorToOutcomeLabels(blended);
    const topEffects = vectorToEffectStrings(blended);
    const watchOuts = vectorToWatchOuts(blended, avgThc);
    const bestTime = vectorToBestTime(blended);
    const summary = buildSummary(outcomeLabels, cultivars.map(c => c.name), bestTime, blended);

    return {
        cultivarNames: cultivars.map(c => c.name),
        outcomeLabels,
        summary,
        topEffects,
        watchOuts,
        bestTime,
        thcAvg: Math.round(avgThc * 10) / 10,
        cbdAvg: Math.round(avgCbd * 10) / 10,
    };
}
