const fetch = require('node-fetch');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Missing GEMINI_API_KEY in .env');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
            return;
        }

        console.log('Available Models:');
        data.models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName})`);
            console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
        });
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

listModels();
