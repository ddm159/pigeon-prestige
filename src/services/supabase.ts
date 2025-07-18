import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
  console.warn('⚠️  Please set VITE_SUPABASE_URL in your .env.local file');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn('⚠️  Please set VITE_SUPABASE_ANON_KEY in your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 