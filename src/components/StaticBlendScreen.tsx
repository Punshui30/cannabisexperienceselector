import { motion } from 'framer-motion';
import { BlendCard, BlendCardProps } from './BlendCard';
import { BlendScenario } from '../data/presetBlends';

// Guardrail: DO NOT IMPORT ENGINE LOGIC HERE

interface StaticBlendScreenProps {
    scenario: BlendScenario;
    onBack: () => void;
    onUse: (text: string) => void;
}

export function StaticBlendScreen({ scenario, onBack, onUse }: StaticBlendScreenProps) {
    // Map Scenario VisualProfile to BlendCardProps
    // Note: BlendCard expects specific structure. We need to map visualProfile to semantic colors/charts.
    // Since we don't have engine results, we construct a "Visual Only" representation.

    // We approximate the "match percentage" and "cultivars" purely for visual demonstration based on profile.
    // We approximate the "match percentage" and "cultivars" purely for visual demonstration based on profile.
    const previewProps: BlendCardProps = {
        recommendation: {
            kind: 'blend',
            id: 'preview_1',
            name: scenario.title,
            matchScore: 95,
            confidence: 0.9,
            reasoning: 'Visual Preview based on selected mood.',
            description: 'Preview of potential blend outcome.',
            cultivars: [
                {
                    name: 'Primary Strain',
                    ratio: 0.7,
                    profile: 'Dominant',
                    characteristics: [scenario.visualProfile.dominantEffect],
                    prominentTerpenes: [],
                    color: scenario.visualProfile.color
                },
                {
                    name: 'Secondary Strain',
                    ratio: 0.3,
                    profile: 'Support',
                    characteristics: ['Balanced'],
                    prominentTerpenes: [],
                    color: '#ffffff'
                }
            ],
            effects: {
                onset: '5-10m',
                peak: '30-45m',
                duration: '2-3h'
            },
            timeline: [],
            terpeneProfile: {}
        },
        onCalculate: () => onUse(scenario.inputText)
    };

    return (
        <div className="w-full h-full bg-black flex flex-col pt-12 px-6 pb-8">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-white/60 hover:text-white text-sm uppercase tracking-widest">
                    ← Back
                </button>
                <div className="text-xs text-[#d4a259] uppercase tracking-widest">
                    Preview
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <BlendCard {...previewProps} />
            </div>

            <div className="mt-8 flex flex-col gap-4">
                <p className="text-white/60 text-xs text-center px-8">
                    "{scenario.inputText}"
                </p>
                <button
                    onClick={() => onUse(scenario.inputText)}
                    className="w-full py-4 bg-[#7C3AED] rounded-full text-black font-bold uppercase tracking-widest hover:bg-[#6D28D9] transition-colors"
                >
                    Use as Intent
                </button>
            </div>
        </div>
    );
}
