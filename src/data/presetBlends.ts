
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

export const BLEND_SCENARIOS: BlendScenario[] = [
    {
        id: 'scenario-date-night',
        title: 'Date Night',
        subtitle: 'Social & Relaxed',
        inputText: 'I want to feel relaxed and present for a date, but not sleepy or foggy. I still want to be able to talk.',
        visualProfile: {
            dominantEffect: 'social',
            color: '#F59E0B' // Amber
        }
    },
    {
        id: 'scenario-gym-focus',
        title: 'Gym Flow',
        subtitle: 'Performance & Focus',
        inputText: 'I want focus and motivation for the gym, but I don’t want anxiety or racing thoughts.',
        visualProfile: {
            dominantEffect: 'focus',
            color: '#10B981' // Emerald
        }
    },
    {
        id: 'scenario-strain-pivot',
        title: 'Strain Pivot',
        subtitle: 'Sour Diesel Alternative',
        inputText: 'I like Sour Diesel, but it sometimes makes me edgy — I want something similar without that.',
        visualProfile: {
            dominantEffect: 'creative',
            color: '#7C5CFF' // Violet
        }
    }
];
