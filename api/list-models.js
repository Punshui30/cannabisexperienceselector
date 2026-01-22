module.exports = async function handler(request, response) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return response.status(200).json({ ok: false, error: 'missing_key' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        return response.status(200).json({ ok: true, data });
    } catch (err) {
        return response.status(200).json({ ok: false, error: err.message });
    }
};
