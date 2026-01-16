
import { generateRecommendations } from './src/lib/engineAdapter';

// Mock console.log
const originalLog = console.log;
console.log = (...args) => {
    originalLog(...args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a));
};

const input = {
    mode: 'describe',
    text: 'I want to feel creative and focused for work'
} as any;

console.log('--- RUNNING ENGINE TEST ---');
try {
    const recs = generateRecommendations(input);
    console.log('--- RESULT ---');
    console.log(JSON.stringify(recs, null, 2));
} catch (e) {
    console.error(e);
}
