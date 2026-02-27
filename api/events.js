const { supabaseServer } = require('../../src/lib/supabase/server');
const { DEMO_STORE_ID } = require('../../src/lib/supabase/demoStore');

module.exports = async function handler(request, response) {
    if (request.method === 'OPTIONS') return response.status(200).end();

    // GET /api/events
    if (request.method === 'GET') {
        const { data, error } = await supabaseServer
            .from('events')
            .select('*')
            .eq('store_id', DEMO_STORE_ID)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return response.status(500).json({ error: error.message });
        return response.status(200).json(data);
    }

    // POST /api/events
    if (request.method === 'POST') {
        const { kind, title, payload, track_id } = request.body;

        if (!title || !payload) {
            return response.status(400).json({ error: 'Missing title or payload' });
        }

        const { data, error } = await supabaseServer
            .from('events')
            .insert([{
                store_id: DEMO_STORE_ID,
                kind: kind || 'blend',
                title,
                payload,
                track_id: track_id || null
            }])
            .select('*')
            .single();

        if (error) return response.status(500).json({ error: error.message });
        return response.status(200).json(data);
    }

    return response.status(405).json({ error: 'Method not allowed' });
};
