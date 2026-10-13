import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fphzlpdrfuomgatwblec.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Rd2skzSxUBVSDGyMxJtPxA_pSwUv280';

let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a dummy client that won't crash the app
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
