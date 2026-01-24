export interface BlendScenario {
    id: string;
    title: string;
    subtitle: string; // Short hook
    inputText: string; // The full human sentence
    visualProfile: {
        color: string;
        dominantEffect: 'social' | 'focus' | 'creative' | 'balance' | 'calm';
    };
}

const RAW_SCENARIOS: BlendScenario[] = [
    {
        id: 's1',
        title: 'Reference Isolation',
        subtitle: 'TERPENE-MODULATED ALTERNATIVE',
        inputText: "I like Sour Diesel, but it sometimes makes me edgy — I want something similar without that.",
        visualProfile: { dominantEffect: 'creative', color: '#7C5CFF' } // Violet
    },
    {
        id: 's2',
        title: 'Ambient Lubrication',
        subtitle: 'RELAXED SOCIAL ENGAGEMENT',
        inputText: "I want to be chatty and relaxed for a dinner with friends, but I need to drive home in 4 hours.",
        visualProfile: { dominantEffect: 'social', color: '#F59E0B' } // Amber
    },
    {
        id: 's3',
        title: 'Cognitive Lock',
        subtitle: 'EXTENDED WORKFLOW PROTOCOL',
        inputText: "I have a 4-hour coding deadline. I need to lock in immediately and sustain it without getting jittery or distracted.",
        visualProfile: { dominantEffect: 'focus', color: '#10B981' } // Emerald
    },
    {
        id: 's4',
        title: 'Circadian Reset',
        subtitle: 'SLEEP INDUCTION SEQUENCE',
        inputText: "My brain won't shut off. I need something to physically relax me now, but knock me out in an hour.",
        visualProfile: { dominantEffect: 'calm', color: '#6366F1' } // Indigo
    },
    {
        id: 's5',
        title: 'Divergent Flow',
        subtitle: 'IDEATION & NOVELTY ENHANCEMENT',
        inputText: "I'm stuck on a project. I want that 'lightbulb moment' feeling where ideas flow freely, but I don't want to get spaced out.",
        visualProfile: { dominantEffect: 'creative', color: '#D946EF' } // Fuchsia
    },
    {
        id: 's6',
        title: 'Somatic Recovery',
        subtitle: 'MODULATED PHYSICAL RESTORATION',
        inputText: "I hiked 10 miles yesterday and my legs are killing me. I just want to melt into the couch and binge watch TV.",
        visualProfile: { dominantEffect: 'calm', color: '#3B82F6' } // Blue
    },
    {
        id: 's7',
        title: 'Static Mitigation',
        subtitle: 'CALM COGNITIVE CLARITY',
        inputText: "I have a presentation tomorrow and I'm spiraling. I need to quiet the noise but stay sharp enough to practice.",
        visualProfile: { dominantEffect: 'balance', color: '#14B8A6' } // Teal
    }
];

// SAFETY: Enforce Array Compaction (No Holes, No Undefined)
export const BLEND_SCENARIOS = RAW_SCENARIOS.flatMap(x => x ? [x] : []);

console.assert(
    BLEND_SCENARIOS.every((s, i) => s && typeof s.id === 'string'),
    'BLEND_SCENARIOS includes invalid or sparse entries',
    BLEND_SCENARIOS
);
