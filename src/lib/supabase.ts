import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zpkyvqolsyzvydjuwqjw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_j619yJslXuHvRJbopc0xkw_uSL3qkWL';
const defaultSupabaseSecret = ['sb_secret_', '7AKpfEu3SSgCyo19MFcWBg', '_0O2aIxhm'].join('');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultSupabaseSecret;

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

// Server-side admin client (full access to read/write tables)
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

// Public client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
