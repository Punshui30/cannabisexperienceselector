import { StackOutcomeExemplar } from '../types/domain';

export const FOCUS_STACK_EXEMPLAR: StackOutcomeExemplar = {
    kind: 'stack',
    id: 'stack_focus_01',
    title: 'The Deep Work Stack',
    subtitle: 'Sustained Flow State',
    description: 'A layered protocol for 4 hours of jitter-free focus.',
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
        name: 'The Deep Work Stack',
        description: 'A scientifically layered protocol for sustained cognitive output without jitters.',

        matchScore: 0.98,
        reasoning: 'Combines pinene-dominant startup with limonene-heavy maintenance.',
        totalDuration: '4 hours',
        layers: [
            {
                layerName: 'Ignition',
                timing: '0:00',
                phaseIntent: 'Rapid Onset, Clear Head',
                whyThisPhase: 'A high-pinene sativa provides immediate alertness without the heavy body load.',
                onsetEstimate: '5-10m',
                durationEstimate: '45-60m',
                consumptionGuidance: 'Vaporize at 180°C',
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
                layerName: 'Cruise Control',
                timing: '0:45',
                phaseIntent: 'Sustain, Level, Create',
                whyThisPhase: 'Introducing a balanced hybrid prevents the "crash" and adds a creative limonene layer.',
                onsetEstimate: '5-10m',
                durationEstimate: '2-3h',
                consumptionGuidance: 'Small dose, Edible or Vape',
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
                        profile: 'Sativa-Hybrid',
                        characteristics: ['Limonene', 'Caryophyllene']
                    }
                ]
            },
            {
                layerName: 'Landing',
                timing: '3:30',
                phaseIntent: 'Reset, Relax',
                whyThisPhase: 'A CBD-rich finish clears the head and transitions out of hyper-focus.',
                onsetEstimate: '10m',
                durationEstimate: '1h',
                consumptionGuidance: 'Tea/Beverage',
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
    title: 'The Hibernation Stack',
    subtitle: 'Deep Restorative Sleep',
    description: 'Drift off fast and stay asleep longer.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'sleep',
        color: '#7C3AED'
    },
    data: {
        kind: 'stack',
        stackId: 'stack_sleep_01',
        id: 'stack_sleep_01',
        name: 'The Hibernation Stack',
        description: 'Multi-stage release for onset and duration.',

        matchScore: 0.95,
        reasoning: 'Linalool for onset, Myrcene/CBN for duration.',
        totalDuration: '8 hours',
        layers: [
            {
                layerName: 'Sunset',
                timing: '0:00',
                phaseIntent: 'Relax Body, Quiet Mind',
                whyThisPhase: 'Heavy Indica with Linalool starts the physical relaxation process.',
                onsetEstimate: '10-15m',
                durationEstimate: '1h',
                consumptionGuidance: 'Inhale/Smoke',
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
                layerName: 'Deep Sleep',
                timing: '0:30',
                phaseIntent: 'Stay Asleep',
                whyThisPhase: 'Edible form factor ensures effects last through the night.',
                onsetEstimate: '45-90m',
                durationEstimate: '6-8h',
                consumptionGuidance: 'Edible (Low Dose)',
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
                layerName: 'Restoration',
                timing: '6:00',
                phaseIntent: 'Wake Refreshed',
                whyThisPhase: 'Prevents grogginess by tapering off heavy sedatives before waking.',
                onsetEstimate: '0m',
                durationEstimate: '2h',
                consumptionGuidance: 'None (Metabolic)',
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
    title: 'The Party Stack',
    subtitle: 'Engaged & Energetic',
    description: 'Stay chatty and happy without anxiety.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'social',
        color: '#FB923C'
    },
    data: {
        kind: 'stack',
        stackId: 'stack_social_01',
        id: 'stack_social_01',
        name: 'The Party Stack',
        description: 'Limonene + Caryophyllene for social lubrication.',

        matchScore: 0.92,
        reasoning: 'Limonene lifts mood, Caryophyllene reduces anxiety.',
        totalDuration: '3 hours',
        layers: [
            {
                layerName: 'Ice Breaker',
                timing: '0:00',
                phaseIntent: 'Uplift, Talkative',
                whyThisPhase: 'High-Limonene strain to boost mood and energy immediately.',
                onsetEstimate: '5m',
                durationEstimate: '45m',
                consumptionGuidance: 'Vape/Smoke',
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
                layerName: 'Vibe Check',
                timing: '0:45',
                phaseIntent: 'Relaxed, Happy',
                whyThisPhase: 'Adding a balanced hybrid keeps the mood light but grounded.',
                onsetEstimate: '5-10m',
                durationEstimate: '2h',
                consumptionGuidance: 'Vape/Smoke',
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
                layerName: 'Afterglow',
                timing: '2:30',
                phaseIntent: 'Calm Release',
                whyThisPhase: 'Gentle descent to prevent crashing after high energy.',
                onsetEstimate: '5m',
                durationEstimate: '1h',
                consumptionGuidance: 'Vape',
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
    title: 'The Artist Stack',
    subtitle: 'Unlock Flow',
    description: 'Bypass the inner critic and access new ideas.',
    source: 'preset',
    visualProfile: {
        dominantEffect: 'creative',
        color: '#F472B6'
    },
    data: {
        kind: 'stack',
        stackId: 'stack_creative_01',
        id: 'stack_creative_01',
        name: 'The Artist Stack',
        description: 'Terpinolene for divergence, Pinene for construction.',

        matchScore: 0.96,
        reasoning: 'Terpinolene promotes divergent thinking.',
        totalDuration: '3-4 hours',
        layers: [
            {
                layerName: 'Spark',
                timing: '0:00',
                phaseIntent: 'Divergent Thought',
                whyThisPhase: 'Terpinolene is known for "hazy" creative associations.',
                onsetEstimate: '5m',
                durationEstimate: '45m',
                consumptionGuidance: 'Vape',
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
                layerName: 'Build',
                timing: '0:45',
                phaseIntent: 'Focus, Execution',
                whyThisPhase: 'Adding Pinene helps organize the ideas into output.',
                onsetEstimate: '10m',
                durationEstimate: '2h',
                consumptionGuidance: 'Tea/Beverage',
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
                layerName: 'Reflect',
                timing: '3:00',
                phaseIntent: 'Appreciation',
                whyThisPhase: 'A euphoric finish to review work with satisfaction.',
                onsetEstimate: '5m',
                durationEstimate: '1h',
                consumptionGuidance: 'Vape',
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
