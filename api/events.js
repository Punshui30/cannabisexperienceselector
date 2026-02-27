const { supabaseServer } = require('../src/lib/supabase/server');

const DEMO_STORE_ID = process.env.DEMO_STORE_ID || '00000000-0000-0000-0000-000000000000';

module.exports = async function handler(request, response) {
    if (request.method === 'OPTIONS') return response.status(200).end();

    // GET /api/events
    if (request.method === 'GET') {
        if (!supabaseServer) return response.status(200).json([]); // Silent fallback

        try {
            const { data, error } = await supabaseServer
                .from('events')
                .select('*')
                .eq('store_id', DEMO_STORE_ID)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) return response.status(200).json([]); // Always return 200 to avoid console spam
            return response.status(200).json(data || []);
        } catch (e) {
            return response.status(200).json([]);
        }
    }

    // POST /api/events
    if (request.method === 'POST') {
        const { kind, title, payload, track_id } = request.body;

        if (!title || !payload) {
            return response.status(400).json({ error: 'Missing title or payload' });
        }

        // Silent bypass if Supabase is missing (Demo Mode)
        if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
            console.log('[EVENTS] Supabase not configured, skipping persistence.');
            return response.status(200).json({ ok: true, mocked: true });
        }

        try {
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

            if (error) {
                console.warn('[EVENTS] Supabase error:', error.message);
                return response.status(200).json({ ok: true, error: error.message }); // Graceful failure
            }
            return response.status(200).json(data);
        } catch (e) {
            return response.status(200).json({ ok: true, error: 'Database context lost' });
        }
    }

    return response.status(405).json({ error: 'Method not allowed' });
};
