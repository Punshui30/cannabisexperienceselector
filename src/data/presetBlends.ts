import { OutcomeExemplar } from '../types/domain';

export const BLEND_EXEMPLARS: OutcomeExemplar[] = [
    {
        kind: 'blend',
        source: 'preset',
        id: 'blend-date-night',
        title: 'Date Night',
        subtitle: 'Relaxed but chatty',
        description: 'A perfect balance of social lubrication and physical ease.',
        visualProfile: {
            dominantEffect: 'social',
            color: '#F59E0B' // Amber
        },
        data: {
            kind: 'blend',
            id: 'blend_date_preset',
            name: 'Date Night Social',
            matchScore: 98,
            cultivars: [
                {
                    name: 'Blue Dream',
                    ratio: 0.5,
                    profile: 'Hybrid',
                    prominentTerpenes: ['Myrcene'],
                    characteristics: ['Balanced']
                },
                {
                    name: 'Gelato',
                    ratio: 0.3,
                    profile: 'Hybrid',
                    prominentTerpenes: ['Caryophyllene'],
                    characteristics: ['Euphoric']
                },
                {
                    name: 'Harlequin',
                    ratio: 0.2,
                    profile: 'CBD',
                    prominentTerpenes: ['Pinene'],
                    characteristics: ['Clear']
                }
            ],
            chemotype: {
                thc: 12,
                cbd: 4,
                terpenes: {
                    myrcene: 0.5,
                    limonene: 0.3,
                    caryophyllene: 0.2
                }
            },
            tags: ['Social', 'Relaxed', 'Chatty']
        }
    },
    {
        kind: 'blend',
        source: 'preset',
        id: 'blend-gym-energy',
        title: 'Gym Energy',
        subtitle: 'Focus without anxiety',
        description: 'Clean energy for physical performance without the jitters.',
        visualProfile: {
            dominantEffect: 'focus',
            color: '#10B981' // Emerald
        },
        data: {
            kind: 'blend',
            id: 'blend_gym_preset',
            name: 'Gym Performance',
            matchScore: 95,
            cultivars: [
                {
                    name: 'Super Lemon Haze',
                    ratio: 0.6,
                    profile: 'Sativa',
                    prominentTerpenes: ['Limonene'],
                    characteristics: ['Energetic']
                },
                {
                    name: 'ACDC',
                    ratio: 0.4,
                    profile: 'CBD',
                    prominentTerpenes: ['Myrcene'],
                    characteristics: ['Stabilizing']
                }
            ],
            chemotype: {
                thc: 8,
                cbd: 8,
                terpenes: {
                    limonene: 0.6,
                    myrcene: 0.4,
                    caryophyllene: 0.1
                }
            },
            tags: ['Energy', 'Focus', 'Clean']
        }
    },
    {
        kind: 'blend',
        source: 'preset',
        id: 'blend-creative-flow',
        title: 'Creative Flow',
        subtitle: 'Inspiration without racing thoughts',
        description: 'Unlock creativity while maintaining a grounded headspace.',
        visualProfile: {
            dominantEffect: 'creative',
            color: '#7C5CFF' // Violet
        },
        data: {
            kind: 'blend',
            id: 'blend_creative_preset',
            name: 'Creative Flow State',
            matchScore: 97,
            cultivars: [
                {
                    name: 'Jack Herer',
                    ratio: 0.5,
                    profile: 'Sativa',
                    prominentTerpenes: ['Terpinolene'],
                    characteristics: ['Creative']
                },
                {
                    name: 'GSC',
                    ratio: 0.3,
                    profile: 'Hybrid',
                    prominentTerpenes: ['Caryophyllene'],
                    characteristics: ['Euphoric']
                },
                {
                    name: 'Northern Lights',
                    ratio: 0.2,
                    profile: 'Indica',
                    prominentTerpenes: ['Myrcene'],
                    characteristics: ['Grounding']
                }
            ],
            chemotype: {
                thc: 18,
                cbd: 1,
                terpenes: {
                    terpinolene: 0.4,
                    caryophyllene: 0.3,
                    myrcene: 0.3
                }
            },
            tags: ['Creative', 'Flow', 'Inspiring']
        }
    }
];
