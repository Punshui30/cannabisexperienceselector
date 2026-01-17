import { OutcomeExemplar } from '../types/domain';

export const OUTCOME_EXEMPLARS: OutcomeExemplar[] = [
    {
        kind: 'stack',
        source: 'preset',
        id: 'late-night-focus',
        title: 'Late Night Focus',
        subtitle: 'Clear-headed concentration',
        description: 'A dedicated multi-phase protocol for deep work sessions that maximizes cognitive clarity while preventing physical stimulation. Transitions from an alert onset to a sustainable, anxiety-free flow state.',
        visualProfile: {
            dominantEffect: 'focus',
            color: '#7C5CFF' // Violet
        },
        data: {
            kind: 'stack',
            id: 'stack_focus_preset_1',
            name: 'Late Night Focus Protocol',
            matchScore: 98,
            reasoning: 'Curated static example for deep work.',
            totalDuration: '4 Hours',
            layers: [
                {
                    layerName: 'Phase 1: Onset',
                    timing: '0-45m',
                    purpose: 'Clear neurological noise',
                    cultivars: [{
                        name: 'Harlequin',
                        ratio: 1.0,
                        profile: 'CBD-Dominant',
                        characteristics: ['Clear', 'Anxiety-Free']
                    }]
                },
                {
                    layerName: 'Phase 2: Deep Flow',
                    timing: '45m-2.5h',
                    purpose: 'Sustain concentration',
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
                    layerName: 'Phase 3: Comedown',
                    timing: '2.5h-4h',
                    purpose: 'Soft landing for sleep',
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
        id: 'social-spark',
        title: 'Social Spark',
        subtitle: 'Engaging & Talkative',
        description: 'Designed for social gatherings where anxiety reduction and verbal fluency are key. Avoids sedation while maintaining a comfortable body baseline.',
        visualProfile: {
            dominantEffect: 'social',
            color: '#F59E0B' // Amber
        },
        data: {
            kind: 'stack',
            id: 'stack_social_preset_1',
            name: 'Social Spark Protocol',
            matchScore: 95,
            reasoning: 'Curated static example for social engagement.',
            totalDuration: '3 Hours',
            layers: [
                {
                    layerName: 'Phase 1: Icebreaker',
                    timing: '0-40m',
                    purpose: 'Reduce social anxiety',
                    cultivars: [{
                        name: 'Cannatonic',
                        ratio: 1.0,
                        profile: '1:1 Ratio',
                        characteristics: ['Calm', 'Happy']
                    }]
                },
                {
                    layerName: 'Phase 2: Conversation',
                    timing: '40m-2h',
                    purpose: 'Enhance verbal fluency',
                    cultivars: [{
                        name: 'Super Lemon Haze',
                        ratio: 0.8,
                        profile: 'Limonene-Rich',
                        characteristics: ['Uplifting', 'Talkative']
                    }]
                },
                {
                    layerName: 'Phase 3: Integration',
                    timing: '2h+',
                    purpose: 'Relaxed finish',
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
        id: 'recovery-mode',
        title: 'Deep Recovery',
        subtitle: 'Physical relief & Sleep',
        description: 'A heavy, body-focused protocol for physical recovery and eventual deep sleep. Prioritizes myrcene and caryophyllene profiles.',
        visualProfile: {
            dominantEffect: 'sleep',
            color: '#10B981' // Emerald
        },
        data: {
            kind: 'stack',
            id: 'stack_recovery_preset_1',
            name: 'Deep Recovery Protocol',
            matchScore: 99,
            reasoning: 'Curated static example for physical rest.',
            totalDuration: '8+ Hours',
            layers: [
                {
                    layerName: 'Phase 1: Decompress',
                    timing: '0-1h',
                    purpose: 'Muscle relaxation',
                    cultivars: [{
                        name: 'GG4',
                        ratio: 1.0,
                        profile: 'Potent Hybrid',
                        characteristics: ['Heavy', 'Euphoric']
                    }]
                },
                {
                    layerName: 'Phase 2: Deep Sleep',
                    timing: '1h+',
                    purpose: 'Sustain REM sleep',
                    cultivars: [{
                        name: 'Northern Lights',
                        ratio: 1.0,
                        profile: 'Classic Indica',
                        characteristics: ['Sedating', 'Dreamy']
                    }]
                }
            ]
        }
    }
];
