const { supabaseServer } = require('../../src/lib/supabase/server');
const { DEMO_STORE_ID } = require('../../src/lib/supabase/demoStore');

module.exports = async function handler(request, response) {
    if (request.method === 'OPTIONS') return response.status(200).end();

    // GET /api/shares/:id
    if (request.method === 'GET') {
        const urlSplit = request.url.split('?');
        const idMatch = urlSplit[0].match(/\/api\/shares\/([^/]+)/);
        const id = idMatch ? idMatch[1] : null;

        if (!id) return response.status(400).json({ error: 'Missing share ID' });

        const { data, error } = await supabaseServer
            .from('shares')
            .select('*')
            .eq('id', id)
            .eq('store_id', DEMO_STORE_ID)
            .single();

        if (error) return response.status(404).json({ error: 'Share not found' });
        return response.status(200).json(data);
    }

    // POST /api/shares
    if (request.method === 'POST') {
        const { kind, payload, track_id } = request.body;

        if (!kind || !payload) {
            return response.status(400).json({ error: 'Missing kind or payload' });
        }

        const { data, error } = await supabaseServer
            .from('shares')
            .insert([{
                store_id: DEMO_STORE_ID,
                kind,
                payload,
                track_id: track_id || null
            }])
            .select('id')
            .single();

        if (error) return response.status(500).json({ error: error.message });
        return response.status(200).json(data);
    }

    return response.status(405).json({ error: 'Method not allowed' });
};
