const { supabaseServer } = require('../../src/lib/supabase/server');

module.exports = async function handler(request, response) {
    if (request.method === 'OPTIONS') return response.status(200).end();

    const userId = request.headers['x-sm-user-id'];
    if (!userId) {
        return response.status(401).json({ error: 'Missing x-sm-user-id header' });
    }

    // Ensure user exists first
    await supabaseServer
        .from('users')
        .upsert([{ id: userId, display_name: 'Anonymous User' }], { onConflict: 'id' });

    // GET /api/user/history
    if (request.method === 'GET') {
        const { data, error } = await supabaseServer
            .from('user_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return response.status(500).json({ error: error.message });
        return response.status(200).json(data);
    }

    // POST /api/user/history
    if (request.method === 'POST') {
        const { store_id, kind, payload, track_id } = request.body;

        if (!payload) return response.status(400).json({ error: 'Missing payload' });

        const { data, error } = await supabaseServer
            .from('user_history')
            .insert([{
                user_id: userId,
                store_id: store_id || null, // Optional, can be null if not store-scoped
                kind: kind || 'unknown',
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
