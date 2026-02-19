/**
 * TTS SPEAK SUMMARY HELPERS
 *
 * Generates short, purposeful 1–3 sentence summaries for TTS use.
 * These are surfaced to the SpeakButton component. Each helper targets
 * a specific use-case so the spoken copy feels intentional, not dumped.
 *
 * Rules:
 *  - Max 300 chars per summary (well within server TTS_MAX_CHARS cap)
 *  - Plain language only — no markdown, brackets, or jargon
 *  - No autoplay — caller is always a SpeakButton (user-initiated)
 */

import { UIBlendRecommendation } from '../types/domain';
import { AI_CONFIG } from '../ai/config';

const MAX = Math.min(AI_CONFIG.tts.maxChars, 300);

function clean(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/[*_~>]+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * BLEND CARD SUMMARY
 * "What it feels like · Best use · Watch-out (if present)"
 */
export function buildBlendSpeakSummary(rec: UIBlendRecommendation): string {
    const reasoning = clean(rec.reasoning);
    const cultivarNames = rec.cultivars.map(c => c.name).join(', ');

    // Derive a feel line from reasoning (1st sentence)
    const sentences = reasoning.match(/[^.!?]+[.!?]+/g) || [reasoning];
    const feel = sentences[0]?.trim() ?? reasoning;

    // Derive best-use from effects timing
    const onset = rec.effects?.onset ?? '5–10 minutes';
    const duration = rec.effects?.duration ?? '2–3 hours';
    const bestUse = `This blend uses ${cultivarNames}. Expect onset in ${onset}, lasting ${duration}.`;

    const combined = `${feel} ${bestUse}`.slice(0, MAX);
    return combined;
}

/**
 * STRAIN DETAIL SUMMARY
 * "Quick profile · Best time to use · Watch-out"
 */
export function buildStrainSpeakSummary(opts: {
    name: string;
    type?: string;
    thcPercent?: number;
    cbdPercent?: number;
    topTerpenes?: string[];
}): string {
    const { name, type, thcPercent, cbdPercent, topTerpenes } = opts;
    const typeLabel = type === 'sativa' ? 'uplifting sativa'
        : type === 'indica' ? 'relaxing indica'
            : 'balanced hybrid';

    const potency = thcPercent !== undefined
        ? `It has ${thcPercent}% THC${cbdPercent ? ` and ${cbdPercent}% CBD` : ''}.`
        : '';

    const terps = topTerpenes && topTerpenes.length > 0
        ? `Dominant terpenes: ${topTerpenes.slice(0, 3).join(', ')}.`
        : '';

    return `${name} is a ${typeLabel}. ${potency} ${terps}`.replace(/\s+/g, ' ').trim().slice(0, MAX);
}

/**
 * WIZARD STEP SUMMARY
 * Reads the assistant prompt + one-liner option guidance.
 */
export function buildWizardSpeakSummary(stepPrompt: string, hint?: string): string {
    const base = clean(stepPrompt);
    const extra = hint ? ` ${clean(hint)}` : '';
    return `${base}${extra}`.slice(0, MAX);
}
