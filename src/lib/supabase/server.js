const { createClient } = require('@supabase/supabase-js');

// Required for serverless functions (Next.js/Vercel)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ [Supabase Server] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
}

// Server-only client using SERVICE ROLE key. Do NOT expose to browser.
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

module.exports = { supabaseServer };
