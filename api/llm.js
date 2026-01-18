const { OpenAI } = require('openai');

module.exports = async function handler(request, response) {
    // Enable CORS just in case, though Vercel usually handles same-origin
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, model, temperature } = request.body;

    if (!messages) {
        return response.status(400).json({ error: 'Missing messages' });
    }

    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
        console.error('SERVER: Missing OPENAI_API_KEY');
        return response.status(500).json({ error: 'Server Configuration Error: Missing API Key' });
    }

    try {
        const openai = new OpenAI({
            apiKey: API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: model || 'gpt-4-turbo',
            messages,
            temperature: temperature || 0.7,
            max_tokens: 500,
        });

        return response.status(200).json(completion);

    } catch (error) {
        console.error('OPENAI SDK ERROR:', error);

        const status = error.status || 500;
        const message = error.message || 'Internal Server Error';
        return response.status(status).json({ error: message, details: error.toString() });
    }
};
