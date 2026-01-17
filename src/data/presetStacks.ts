import { OutcomeExemplar } from '../types/domain';

export const OUTCOME_EXEMPLARS: OutcomeExemplar[] = [
    {
        kind: 'stack',
        source: 'preset',
        id: 'focus-protocol',
        title: 'Clear Onset → Deep Flow → Soft Landing',
        subtitle: 'Cognitive Performance Protocol',
        description: 'A multi-phase protocol for sustained deep work. transitions from alertness to flow, ending with relaxation.',
        visualProfile: {
            dominantEffect: 'focus',
            color: '#7C5CFF' // Violet
        },
        data: {
            kind: 'stack',
            id: 'stack_focus_preset_1',
            name: 'Clear Onset → Deep Flow → Soft Landing',
            matchScore: 98,
            reasoning: 'Curated static example for deep work.',
            totalDuration: '4 Hours',
            layers: [
                {
                    layerName: 'Phase 1: Clear Onset',
                    timing: '0-45m',
                    // New Semantic Fields
                    phaseIntent: 'Clear neurological noise and establish alertness',
                    whyThisPhase: 'Harlequin provides a high-CBD, anxiety-free foundation to clear mental clutter before stimulating focus.',
                    onsetEstimate: '~5-10 min',
                    durationEstimate: '45 min',
                    consumptionGuidance: 'Light dosage (1-2 pulls). Wait 10 mins before Phase 2.',

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
                    // New Semantic Fields
                    phaseIntent: 'Sustain peak concentration and creative output',
                    whyThisPhase: 'Terpinolene-rich Jack Herer stimulates cognitive activity, stabilized by ACDC to prevent jitteriness.',
                    onsetEstimate: '~2-5 min (Rapid)',
                    durationEstimate: '90-120 min',
                    consumptionGuidance: 'Moderate dosage. Re-dose lightly if focus wanes after 90 mins.',

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
                    layerName: 'Phase 3: Soft Landing',
                    timing: '2.5h-4h',
                    // New Semantic Fields
                    phaseIntent: 'Transition from high-beta focus to alpha-wave relaxation',
                    whyThisPhase: 'Granddaddy Purple provides myrcene-heavy sedation to disengage the brain from work mode without a crash.',
                    onsetEstimate: '~10-15 min (Slow)',
                    durationEstimate: '2+ Hours',
                    consumptionGuidance: 'Heavier dosage permitted. Use when work is strictly finished.',

                    purpose: 'Transition to rest',
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
        id: 'social-protocol',
        title: 'Icebreaker → Conversation → Integration',
        subtitle: 'Social Engagement Protocol',
        description: 'Designed for social gatherings. Reduces initial anxiety, enhances verbal fluency, and settles into a comfortable baseline.',
        visualProfile: {
            dominantEffect: 'social',
            color: '#F59E0B' // Amber
        },
        data: {
            kind: 'stack',
            id: 'stack_social_preset_1',
            name: 'Icebreaker → Conversation → Integration',
            matchScore: 95,
            reasoning: 'Curated static example for social engagement.',
            totalDuration: '3 Hours',
            layers: [
                {
                    layerName: 'Phase 1: Icebreaker',
                    timing: '0-40m',
                    phaseIntent: 'Reduce initial social friction and anxiety',
                    whyThisPhase: 'Cannatonic (1:1) lowers cortisol and social inhibition without impairing cognitive function.',
                    onsetEstimate: '~10 min',
                    durationEstimate: '40 min',
                    consumptionGuidance: 'Start slow. Gauge comfort level before proceeding.',

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
                    phaseIntent: 'Maximize verbal fluency and energy',
                    whyThisPhase: 'Limonene-dominant Super Lemon Haze promotes energy and talkativeness for the peak of the event.',
                    onsetEstimate: '~5 min',
                    durationEstimate: '90 min',
                    consumptionGuidance: 'Social dosing. Share with group.',

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
                    phaseIntent: 'Settle into a comfortable, warm baseline',
                    whyThisPhase: 'Blue Dream offers a gentle, balanced hybrid finish to wind down the high energy.',
                    onsetEstimate: '~10 min',
                    durationEstimate: '1+ Hours',
                    consumptionGuidance: 'Use as event winds down.',

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
        id: 'recovery-protocol',
        title: 'Decompress → Sedate → Sleep',
        subtitle: 'Physical Recovery Protocol',
        description: 'A heavy, body-focused protocol. transitions from muscle relief to sedation and finally deep sleep.',
        visualProfile: {
            dominantEffect: 'sleep',
            color: '#10B981' // Emerald
        },
        data: {
            kind: 'stack',
            id: 'stack_recovery_preset_1',
            name: 'Decompress → Sedate → Sleep',
            matchScore: 99,
            reasoning: 'Curated static example for physical rest.',
            totalDuration: '8+ Hours',
            layers: [
                {
                    layerName: 'Phase 1: Decompress',
                    timing: '0-45m',
                    phaseIntent: 'Physical muscle relaxation and pain relief',
                    whyThisPhase: 'GG4 provides immediate, potent physical relief to unlock tight muscles.',
                    onsetEstimate: '~5 min',
                    durationEstimate: '45 min',
                    consumptionGuidance: 'Prepare environment for sleep before consuming.',

                    purpose: 'Muscle relaxation',
                    cultivars: [{
                        name: 'GG4',
                        ratio: 1.0,
                        profile: 'Potent Hybrid',
                        characteristics: ['Heavy', 'Euphoric']
                    }]
                },
                {
                    layerName: 'Phase 2: Sedate',
                    timing: '45m-90m',
                    phaseIntent: 'Heavy sedation and mental quiet',
                    whyThisPhase: 'Bubba Kush introduces heavy indica effects to slow thoughts and weigh down the eyelids.',
                    onsetEstimate: '~10 min',
                    durationEstimate: '45 min',
                    consumptionGuidance: 'Consume while in bed or on couch.',

                    purpose: 'Induce drowsiness',
                    cultivars: [{
                        name: 'Bubba Kush',
                        ratio: 1.0,
                        profile: 'Indica',
                        characteristics: ['Sedating', 'Heavy']
                    }]
                },
                {
                    layerName: 'Phase 3: Deep Sleep',
                    timing: '90m+',
                    phaseIntent: 'Stay asleep and extend REM cycles',
                    whyThisPhase: 'Northern Lights is a legendary sleep aid used to prevent waking in the middle of the night.',
                    onsetEstimate: '~15 min',
                    durationEstimate: 'All Night',
                    consumptionGuidance: 'Final consumption. Lights out immediately.',

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
