import { OutcomeExemplar } from '../types/domain';

export const OUTCOME_EXEMPLARS: OutcomeExemplar[] = [
    {
        kind: 'exemplar',
        id: 'late-night-focus',
        title: 'Late Night Focus',
        subtitle: 'Clear-headed concentration',
        description: 'A reference outcome profile for deep work sessions without physical stimulation.',
        input: { kind: 'intentSeed', mode: 'describe', text: 'focus work ignore distractions clear mind no anxiety' },
        visualProfile: {
            dominantEffect: 'focus',
            color: '#7C5CFF' // Violet
        }
    },
    {
        kind: 'exemplar',
        id: 'creative-flow',
        title: 'Creative Flow',
        subtitle: 'Open exploration',
        description: 'Designed to enhance divergent thinking and artistic expression while maintaining energy.',
        input: { kind: 'intentSeed', mode: 'describe', text: 'creative art music energetic inspiring happy' },
        visualProfile: {
            dominantEffect: 'creative',
            color: '#F472B6' // Pink
        }
    },
    {
        kind: 'exemplar',
        id: 'sunday-calm',
        title: 'Sunday Calm',
        subtitle: 'Complete unwinding',
        description: 'Maximum relaxation and stress relief for recovery and comfort.',
        input: { kind: 'intentSeed', mode: 'describe', text: 'relax calm sleep stress relief quiet comfort' },
        visualProfile: {
            dominantEffect: 'calm',
            color: '#22C55E' // Green
        }
    },
    {
        kind: 'exemplar',
        id: 'social-lift',
        title: 'Social Lift',
        subtitle: 'Warm engagement',
        description: 'Uplifting and conversational profile perfect for social gatherings.',
        input: { kind: 'intentSeed', mode: 'describe', text: 'social talkative happy party laugh' },
        visualProfile: {
            dominantEffect: 'social',
            color: '#FB923C' // Orange
        }
    }
];
