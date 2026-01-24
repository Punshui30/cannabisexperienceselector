/**
 * PRESET DATA ONLY
 * Used for UI previews, onboarding, and demo states.
 * Must never be imported by engineAdapter or core engine logic.
 * 
 * // Ingestion modeling not yet supported — do not reference form factor
 */
import { StackOutcomeExemplar } from '../types/domain';

export const FOCUS_STACK_EXEMPLAR: StackOutcomeExemplar = {
    kind: 'stack',
    id: 'stack_focus_01',
    title: 'Deep Work Protocol',
    subtitle: 'High-Stability Focus',
    description: 'A layered chemical protocol for sustained cognitive output.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'focus',
        color: '#00FFD1'
    },
    data: {
        kind: 'stack',
        // New Required Fields
        stackId: 'stack_focus_01',
        id: 'stack_focus_01',
        name: 'Deep Work Protocol',
        description: 'A scientifically layered sequence for sustained cognitive output.',

        matchScore: 0.98,
        reasoning: 'Combines pinene-dominant startup with limonene-heavy maintenance.',
        totalDuration: 'Extended',
        layers: [
            {
                type: 'cultivar',
                layerName: 'Ignition',
                timing: '0:00',
                phaseIntent: 'Rapid Awareness',
                whyThisPhase: 'A high-pinene sativa provides immediate alertness and clarity.',
                onsetEstimate: 'Immediate',
                durationEstimate: 'Short Interval',
                consumptionGuidance: 'Rapid Route',
                purpose: 'Initial focus',
                cultivars: [
                    {
                        name: 'Jack Herer',
                        ratio: 1.0,
                        profile: 'Sativa',
                        characteristics: ['Pinene', 'Terpinolene']
                    }
                ]
            },
            {
                type: 'blend',
                layerName: 'Cruise Control',
                timing: '0:45',
                phaseIntent: 'Sustain, Level, Create',
                whyThisPhase: 'Introducing a balanced blend prevents fatigue and adds a creative limonene layer.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Sustained',
                consumptionGuidance: 'Sustained Release',
                purpose: 'Maintenance',
                cultivars: [
                    {
                        name: 'Blue Dream',
                        ratio: 0.5,
                        profile: 'Hybrid',
                        characteristics: ['Myrcene', 'Pinene']
                    },
                    {
                        name: 'Super Lemon Haze',
                        ratio: 0.5,
                        profile: 'Sativa',
                        characteristics: ['Limonene', 'Terpinolene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Landing',
                timing: '3:30',
                phaseIntent: 'Reset, Relax',
                whyThisPhase: 'A CBD-rich finish clears the head and transitions out of hyper-focus.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Final Phase',
                consumptionGuidance: 'Gentle Finish',
                purpose: 'Wind Down',
                cultivars: [
                    {
                        name: 'Cannatonic',
                        ratio: 1.0,
                        profile: 'CBD',
                        characteristics: ['CBD', 'Myrcene']
                    }
                ]
            }
        ]
    }
};

export const SLEEP_STACK_EXEMPLAR: StackOutcomeExemplar = {
    kind: 'stack',
    id: 'stack_sleep_01',
    title: 'Circadian Induction',
    subtitle: 'Restorative Sleep Sequence',
    description: 'Optimized onset and duration for sleep cycle support.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'sleep',
        color: '#7C3AED'
    },
    data: {
        kind: 'stack',
        stackId: 'stack_sleep_01',
        id: 'stack_sleep_01',
        name: 'Circadian Induction Sequence',
        description: 'Multi-stage metabolic release for onset and duration.',

        matchScore: 0.95,
        reasoning: 'Linalool for onset, Myrcene/CBN for duration.',
        totalDuration: 'Full Night',
        layers: [
            {
                type: 'cultivar',
                layerName: 'Sunset',
                timing: '0:00',
                phaseIntent: 'Relax Body, Quiet Mind',
                whyThisPhase: 'Heavy Indica with Linalool starts the physical relaxation process.',
                onsetEstimate: 'Rapid',
                durationEstimate: 'Initial Phase',
                consumptionGuidance: 'Rapid Route',
                purpose: 'Induction',
                cultivars: [
                    {
                        name: 'Granddaddy Purple',
                        ratio: 1.0,
                        profile: 'Indica',
                        characteristics: ['Linalool', 'Myrcene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Deep Sleep',
                timing: '0:30',
                phaseIntent: 'Stay Asleep',
                whyThisPhase: 'Extended release formulation ensures effects last through the sleep cycle.',
                onsetEstimate: 'Delayed',
                durationEstimate: 'Extended',
                consumptionGuidance: 'Sustained Release',
                purpose: 'Duration',
                cultivars: [
                    {
                        name: 'Bubba Kush',
                        ratio: 1.0,
                        profile: 'Indica',
                        characteristics: ['Caryophyllene', 'Myrcene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Restoration',
                timing: '6:00',
                phaseIntent: 'Wake Refreshed',
                whyThisPhase: 'Prevents grogginess by tapering off heavy relaxation before waking.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Final Phase',
                consumptionGuidance: 'Metabolic Taper',
                purpose: 'Completion',
                cultivars: [
                    {
                        name: 'Harlequin',
                        ratio: 1.0,
                        profile: 'CBD-Hybrid',
                        characteristics: ['CBD', 'Pinene']
                    }
                ]
            }
        ]
    }
};

export const SOCIAL_STACK_EXEMPLAR: StackOutcomeExemplar = {
    kind: 'stack',
    id: 'stack_social_01',
    title: 'Social Lubrication',
    subtitle: 'Interpersonal Optimization',
    description: 'Facilitates engagement and verbal fluidity.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'social',
        color: '#FB923C'
    },
    data: {
        kind: 'stack',
        stackId: 'stack_social_01',
        id: 'stack_social_01',
        name: 'Social Lubrication Protocol',
        description: 'Limonene + Caryophyllene for optimized social outcomes.',

        matchScore: 0.92,
        reasoning: 'Limonene lifts mood, Caryophyllene reduces anxiety.',
        totalDuration: 'Medium Duration',
        layers: [
            {
                type: 'cultivar',
                layerName: 'Ice Breaker',
                timing: '0:00',
                phaseIntent: 'Uplift, Talkative',
                whyThisPhase: 'High-Limonene strain to boost mood and energy immediately.',
                onsetEstimate: 'Rapid',
                durationEstimate: 'Initial Phase',
                consumptionGuidance: 'Rapid Route',
                purpose: 'Energy',
                cultivars: [
                    {
                        name: 'Tangie',
                        ratio: 1.0,
                        profile: 'Sativa',
                        characteristics: ['Limonene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Vibe Check',
                timing: '0:45',
                phaseIntent: 'Relaxed, Happy',
                whyThisPhase: 'Adding a balanced hybrid keeps the mood light but grounded.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Sustained',
                consumptionGuidance: 'Rapid/Sustained',
                purpose: 'Maintenance',
                cultivars: [
                    {
                        name: 'Gelato',
                        ratio: 1.0,
                        profile: 'Hybrid',
                        characteristics: ['Caryophyllene', 'Limonene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Afterglow',
                timing: '2:30',
                phaseIntent: 'Calm Release',
                whyThisPhase: 'Gentle descent to prevent crashing after high energy.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Final Phase',
                consumptionGuidance: 'Gentle Finish',
                purpose: 'Wind Down',
                cultivars: [
                    {
                        name: 'Blue Dream',
                        ratio: 1.0,
                        profile: 'Hybrid',
                        characteristics: ['Myrcene', 'Pinene']
                    }
                ]
            }
        ]
    }
};

export const CREATIVE_STACK_EXEMPLAR: StackOutcomeExemplar = {
    kind: 'stack',
    id: 'stack_creative_01',
    title: 'Divergent Thought',
    subtitle: 'Creative Flow Protocol',
    description: 'Bypass cognitive blocks for novel idea generation.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'creative',
        color: '#F472B6'
    },
    data: {
        kind: 'stack',
        stackId: 'stack_creative_01',
        id: 'stack_creative_01',
        name: 'Divergent Thought Protocol',
        description: 'Terpinolene-led sequence for divergent association.',

        matchScore: 0.96,
        reasoning: 'Terpinolene promotes divergent thinking.',
        totalDuration: 'Variable',
        layers: [
            {
                type: 'cultivar',
                layerName: 'Spark',
                timing: '0:00',
                phaseIntent: 'Divergent Thought',
                whyThisPhase: 'Terpinolene is known for "hazy" creative associations.',
                onsetEstimate: 'Rapid',
                durationEstimate: 'Initial Phase',
                consumptionGuidance: 'Rapid Route',
                purpose: 'Idea Generation',
                cultivars: [
                    {
                        name: 'Durban Poison',
                        ratio: 1.0,
                        profile: 'Sativa',
                        characteristics: ['Terpinolene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Elevation Layer',
                cultivars: [{
                    name: 'Jack Herer',
                    ratio: 1.0,
                    profile: 'Clear Sativa',
                    characteristics: ['Focus', 'Energy']
                }],
                phaseIntent: 'Mental Clarity',
                whyThisPhase: 'Jack Herer adds clear-headed focus without sedation.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Sustained',
                consumptionGuidance: 'Moderate',
                purpose: 'Cognitive activation',
                timing: '10-30 mins'
            },
            {
                type: 'cultivar',
                layerName: 'Build',
                timing: '0:45',
                phaseIntent: 'Focus, Execution',
                whyThisPhase: 'Adding Pinene helps organize the ideas into output.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Sustained',
                consumptionGuidance: 'Sustained Release',
                purpose: 'Execution',
                cultivars: [
                    {
                        name: 'Blue Dream',
                        ratio: 1.0,
                        profile: 'Hybrid',
                        characteristics: ['Myrcene', 'Pinene']
                    }
                ]
            },
            {
                type: 'cultivar',
                layerName: 'Reflect',
                timing: '3:00',
                phaseIntent: 'Appreciation',
                whyThisPhase: 'A euphoric finish to review work with satisfaction.',
                onsetEstimate: 'Sequential',
                durationEstimate: 'Final Phase',
                consumptionGuidance: 'Gentle Finish',
                purpose: 'Integration',
                cultivars: [
                    {
                        name: 'Maui Wowie',
                        ratio: 1.0,
                        profile: 'Sativa',
                        characteristics: ['Myrcene', 'Pinene']
                    }
                ]
            }
        ]
    }
};

export const PRESET_STACKS: StackOutcomeExemplar[] = [
    FOCUS_STACK_EXEMPLAR,
    SLEEP_STACK_EXEMPLAR,
    SOCIAL_STACK_EXEMPLAR,
    CREATIVE_STACK_EXEMPLAR
];
