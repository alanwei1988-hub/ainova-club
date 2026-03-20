// Supabase Configuration
const SUPABASE_URL = 'https://rpxskfxuaqgzrfpbsgzn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eCKBX0TP4ykyL7UXiVxb_g_st316sRi';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.ainova = { supabase };

console.log('✅ Supabase initialized');
