import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
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
        return response.status(500).json({ error: 'Server Configuration Error' });
    }

    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: model || 'gpt-4-turbo',
                messages,
                temperature: temperature || 0.7,
                max_tokens: 500
            })
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error('OPENAI API ERROR:', errorText);
            return response.status(openaiResponse.status).json({ error: 'Upstream API Error', details: errorText });
        }

        const data = await openaiResponse.json();
        return response.status(200).json(data);

    } catch (error) {
        console.error('PROXY ERROR:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
