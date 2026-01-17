import { OutcomeExemplar } from '../types/domain';

const RAW_EXEMPLARS: OutcomeExemplar[] = [
    {
        kind: 'stack',
        source: 'preset',
        id: 'focus-stack',
        title: 'Clear Onset → Deep Flow → Soft Landing',
        subtitle: 'Sequential pre-roll protocol — effects change as different cultivars are reached.',
        description: 'Physical progression from CBD clarity to terpinolene intensity, ending in myrcene release.',
        visualProfile: {
            dominantEffect: 'focus',
            color: '#7C5CFF'
        },
        data: {
            kind: 'stack',
            id: 'stack_focus',
            name: 'Clear Onset → Deep Flow → Soft Landing',
            matchScore: 0,
            reasoning: 'Physical pre-roll sequence for work sessions.',
            totalDuration: 'Burn Time: 30-45m',
            layers: [
                {
                    layerName: 'Tip: Clear Onset',
                    timing: 'First 1/3',
                    phaseIntent: 'First 1/3 of Pre-roll',
                    whyThisPhase: 'As combustion begins, CBD-rich Harlequin burns first to clear neurological noise before the psychoactive core.',
                    onsetEstimate: 'Tip Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Light combustion. Low temperature terpene release.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Harlequin',
                        ratio: 1.0,
                        profile: 'CBD-Dominant',
                        characteristics: ['Clear', 'Anxiety-Free']
                    }]
                },
                {
                    layerName: 'Core: Deep Flow',
                    timing: 'Middle 1/3',
                    phaseIntent: 'Middle 1/3 of Pre-roll',
                    whyThisPhase: 'Combustion reaches the Jack Herer core. Temperature rises, releasing terpinolene and cannabinoids for peak stimulation.',
                    onsetEstimate: 'Middle Section',
                    durationEstimate: 'Duration: ~15m burn',
                    consumptionGuidance: 'Peak heat. Full spectrum activation.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Jack Herer',
                        ratio: 0.7,
                        profile: 'Terpinolene-Rich',
                        characteristics: ['Focus', 'Creative']
                    },
                    {
                        name: 'ACDC',
                        ratio: 0.3,
                        profile: 'CBD Stabilizer',
                        characteristics: ['Grounding']
                    }]
                },
                {
                    layerName: 'Base: Soft Landing',
                    timing: 'Final 1/3',
                    phaseIntent: 'Final 1/3 of Pre-roll',
                    whyThisPhase: 'The crutch approaches. Resins accumulate in the Granddaddy Purple base, creating a heavy, sedating finish naturally.',
                    onsetEstimate: 'Base Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Resin-heavy smoke. Slow burn.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Granddaddy Purple',
                        ratio: 1.0,
                        profile: 'Myrcene-Rich',
                        characteristics: ['Sedating', 'Relaxing']
                    }]
                }
            ]
        }
    },
    {
        kind: 'stack',
        source: 'preset',
        id: 'social-stack',
        title: 'Icebreaker → Conversation → Integration',
        subtitle: 'Sequential pre-roll protocol — effects change as different cultivars are reached.',
        description: 'Physical progression from calming 1:1 ratio to high-energy limonene, finishing with a balanced hybrid.',
        visualProfile: {
            dominantEffect: 'social',
            color: '#F59E0B'
        },
        data: {
            kind: 'stack',
            id: 'stack_social',
            name: 'Icebreaker → Conversation → Integration',
            matchScore: 0,
            reasoning: 'Physical pre-roll sequence for social events.',
            totalDuration: 'Burn Time: 30-45m',
            layers: [
                {
                    layerName: 'Tip: Icebreaker',
                    timing: 'First 1/3',
                    phaseIntent: 'First 1/3 of Pre-roll',
                    whyThisPhase: 'The initial burn releases Cannatonic (1:1) vapors to lower social inhibition immediately upon lighting.',
                    onsetEstimate: 'Tip Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Gentle start. Anxiety reduction.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Cannatonic',
                        ratio: 1.0,
                        profile: '1:1 Ratio',
                        characteristics: ['Calm', 'Happy']
                    }]
                },
                {
                    layerName: 'Core: Conversation',
                    timing: 'Middle 1/3',
                    phaseIntent: 'Middle 1/3 of Pre-roll',
                    whyThisPhase: 'The ember reaches the Super Lemon Haze center. Sharper terpenes vaporize for maximum verbal energy.',
                    onsetEstimate: 'Middle Section',
                    durationEstimate: 'Duration: ~15m burn',
                    consumptionGuidance: 'Active phase. High energy release.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Super Lemon Haze',
                        ratio: 0.8,
                        profile: 'Limonene-Rich',
                        characteristics: ['Uplifting', 'Talkative']
                    }]
                },
                {
                    layerName: 'Base: Integration',
                    timing: 'Final 1/3',
                    phaseIntent: 'Final 1/3 of Pre-roll',
                    whyThisPhase: 'As the joint finishes, the Blue Dream base provides a rounded, comfortable conclusion to the experience.',
                    onsetEstimate: 'Base Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Balanced finish. Resin accumulation.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Blue Dream',
                        ratio: 1.0,
                        profile: 'Balanced Hybrid',
                        characteristics: ['Gentle', 'Ease']
                    }]
                }
            ]
        }
    },
    {
        kind: 'stack',
        source: 'preset',
        id: 'recovery-stack',
        title: 'Decompress → Sedate → Sleep',
        subtitle: 'Sequential pre-roll protocol — effects change as different cultivars are reached.',
        description: 'Physical progression from heavy relief to deep sedation as resin builds up in the joint.',
        visualProfile: {
            dominantEffect: 'sleep',
            color: '#10B981'
        },
        data: {
            kind: 'stack',
            id: 'stack_recovery',
            name: 'Decompress → Sedate → Sleep',
            matchScore: 0,
            reasoning: 'Physical pre-roll sequence for rest.',
            totalDuration: 'Burn Time: 30-45m',
            layers: [
                {
                    layerName: 'Tip: Decompress',
                    timing: 'First 1/3',
                    phaseIntent: 'First 1/3 of Pre-roll',
                    whyThisPhase: 'GG4 at the tip delivers immediate, potent physical relief with the first few inhales.',
                    onsetEstimate: 'Tip Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Immediate body effect.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'GG4',
                        ratio: 1.0,
                        profile: 'Potent Hybrid',
                        characteristics: ['Heavy', 'Euphoric']
                    }]
                },
                {
                    layerName: 'Core: Sedate',
                    timing: 'Middle 1/3',
                    phaseIntent: 'Middle 1/3 of Pre-roll',
                    whyThisPhase: 'The burn moves into the Bubba Kush core, releasing heavier indica compounds for mental slowing.',
                    onsetEstimate: 'Middle Section',
                    durationEstimate: 'Duration: ~15m burn',
                    consumptionGuidance: 'Deep relaxation. Slowing burn.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Bubba Kush',
                        ratio: 1.0,
                        profile: 'Indica',
                        characteristics: ['Sedating', 'Heavy']
                    }]
                },
                {
                    layerName: 'Base: Sleep',
                    timing: 'Final 1/3',
                    phaseIntent: 'Final 1/3 of Pre-roll',
                    whyThisPhase: 'The final third concentrates resin into the Northern Lights base, delivering a knockout punch for sleep.',
                    onsetEstimate: 'Base Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Maximum potency. End of session.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Northern Lights',
                        ratio: 1.0,
                        profile: 'Classic Indica',
                        characteristics: ['Sedating', 'Dreamy']
                    }]
                }
            ]
        }
    },
    {
        kind: 'stack',
        source: 'preset',
        id: 'balance-stack',
        title: 'Stimulate → Balance → Body Ease',
        subtitle: 'Sequential pre-roll protocol — effects change as different cultivars are reached.',
        description: 'Physical progression starting with energy, centering the mind, and ending in body relaxation.',
        visualProfile: {
            dominantEffect: 'balance',
            color: '#F472B6' // Pink/Rose
        },
        data: {
            kind: 'stack',
            id: 'stack_balance',
            name: 'Stimulate → Balance → Body Ease',
            matchScore: 0,
            reasoning: 'Physical pre-roll sequence for afternoon flow.',
            totalDuration: 'Burn Time: 30-45m',
            layers: [
                {
                    layerName: 'Tip: Stimulate',
                    timing: 'First 1/3',
                    phaseIntent: 'First 1/3 of Pre-roll',
                    whyThisPhase: 'Durban Poison at the tip provides an instant sparkling sativa onset to wake up the senses.',
                    onsetEstimate: 'Tip Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Sativa-dominant start. High airflow.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'Durban Poison',
                        ratio: 1.0,
                        profile: 'Pure Sativa',
                        characteristics: ['Energetic', 'Clear']
                    }]
                },
                {
                    layerName: 'Core: Balance',
                    timing: 'Middle 1/3',
                    phaseIntent: 'Middle 1/3 of Pre-roll',
                    whyThisPhase: 'The middle section transitions to GSC (Girl Scout Cookies) for a euphoric, hybrid center that smooths the edge.',
                    onsetEstimate: 'Middle Section',
                    durationEstimate: 'Duration: ~15m burn',
                    consumptionGuidance: 'Hybrid stabilization. Sweet burn.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'GSC',
                        ratio: 1.0,
                        profile: 'Hybrid',
                        characteristics: ['Euphoric', 'Sweet']
                    }]
                },
                {
                    layerName: 'Base: Body Ease',
                    timing: 'Final 1/3',
                    phaseIntent: 'Final 1/3 of Pre-roll',
                    whyThisPhase: 'The roach end contains OG Kush, grounding the experience with a classic, heavy body finish.',
                    onsetEstimate: 'Base Section',
                    durationEstimate: 'Duration: ~10m burn',
                    consumptionGuidance: 'Heavy finish. Physical grounding.',

                    purpose: 'Structure',
                    cultivars: [{
                        name: 'OG Kush',
                        ratio: 1.0,
                        profile: 'Hybrid Indica',
                        characteristics: ['Classic', 'Earthy']
                    }]
                }
            ]
        }
    }
];

// SAFETY: Enforce Array Compaction (No Holes, No Undefined)
export const OUTCOME_EXEMPLARS = RAW_EXEMPLARS.flatMap(x => x ? [x] : []);

console.assert(
    OUTCOME_EXEMPLARS.every((s, i) => s && s.data && typeof s.id === 'string'),
    'OUTCOME_EXEMPLARS includes invalid or sparse entries',
    OUTCOME_EXEMPLARS
);
