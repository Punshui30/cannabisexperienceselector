import { SessionMemory } from '../lib/memory/sessionMemory';

export interface DemoProfile {
    id: string;
    name: string;
    memory: SessionMemory;
}

export const DEMO_PROFILES: DemoProfile[] = [
    {
        id: 'calm-focus',
        name: 'Focus (Calm)',
        memory: {
            recentQueries: ['I need to focus on writing code without feeling jittery.', 'Clean focus for long study session'],
            userPreferences: {
                preferredVibe: 'focused',
                avoidStrains: ['Green Crack']
            },
            lastIntentSummary: 'Focused cognitive clarity with physical relaxation',
            lastVibe: 'Focus',
            lastContext: 'Work / Study',
            feedback: {
                intensity: 'justRight',
                feelings: ['productive', 'clarity']
            },
            favorites: {
                blendIds: ['b-focus-01'],
                strainIds: ['Jack Herer', 'Harlequin']
            }
        }
    },
    {
        id: 'social',
        name: 'Social / Fun',
        memory: {
            recentQueries: ['Going to a party, want to be chatty but not paranoid', 'Social mood for a concert'],
            userPreferences: {
                preferredVibe: 'social',
                avoidStrains: ['Ghost OG']
            },
            lastIntentSummary: 'Social lubrication with high euphoria index',
            lastVibe: 'Social',
            lastContext: 'Socializing',
            feedback: {
                intensity: 'tooStrong',
                feelings: ['talkative', 'slightly anxious']
            },
            favorites: {
                blendIds: ['b-social-02'],
                strainIds: ['Super Lemon Haze']
            }
        }
    },
    {
        id: 'sleep',
        name: 'Rest / Sleep',
        memory: {
            recentQueries: ['Help me sleep through the night', 'Heavy body high for insomnia'],
            userPreferences: {
                preferredVibe: 'sleepy',
                avoidStrains: []
            },
            lastIntentSummary: 'Deep physical sedation and mental quietude',
            lastVibe: 'Sleep',
            lastContext: 'Nighttime / Bed',
            feedback: {
                intensity: 'tooWeak',
                feelings: ['relaxed', 'still awake']
            },
            favorites: {
                blendIds: ['b-sleep-deep'],
                strainIds: ['Northern Lights', 'Granddaddy Purple']
            }
        }
    }
];
