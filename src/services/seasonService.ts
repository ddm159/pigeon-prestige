import { supabase } from './supabase';

export async function getCurrentSeason() {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('is_active', true)
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
} 