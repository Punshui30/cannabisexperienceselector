import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
        console.warn('⚠️ [Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variables. Backend persistence will not work.');
    }
}

// Browser-safe client using ANON key. 
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
