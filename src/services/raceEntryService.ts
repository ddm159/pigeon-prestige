import { supabase } from './supabase';
import type { RaceEntry } from '../types/competition';

/**
 * Race Entry Service
 * Handles race entry-related database operations
 */
export const raceEntryService = {
  /**
   * Get race entries for a specific race
   */
  async getRaceEntries(raceId: string): Promise<RaceEntry[]> {
    const { data, error } = await supabase
      .from('race_entries')
      .select(`
        *,
        users(username, player_type),
        pigeons(name, picture_number)
      `)
      .eq('race_id', raceId)
      .order('entry_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create race entry
   */
  async createRaceEntry(entry: Partial<RaceEntry>): Promise<RaceEntry> {
    const { data, error } = await supabase
      .from('race_entries')
      .insert(entry)
      .select(`
        *,
        users(username, player_type),
        pigeons(name, picture_number)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get user's race entries
   */
  async getUserRaceEntries(userId: string, raceId?: string): Promise<RaceEntry[]> {
    let query = supabase
      .from('race_entries')
      .select(`
        *,
        users(username, player_type),
        pigeons(name, picture_number),
        competition_races(name, category, distance)
      `)
      .eq('user_id', userId);

    if (raceId) {
      query = query.eq('race_id', raceId);
    }

    const { data, error } = await query.order('entry_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Check race eligibility
   */
  async checkRaceEligibility(
    userId: string,
    pigeonId: string,
    raceId: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    try {
      // Check if pigeon is already entered
      const { data: existingEntry } = await supabase
        .from('race_entries')
        .select('id')
        .eq('race_id', raceId)
        .eq('pigeon_id', pigeonId)
        .single();

      if (existingEntry) {
        return { eligible: false, reason: 'Pigeon already entered in this race' };
      }

      // Check if user has already entered maximum pigeons
      const { data: userEntries } = await supabase
        .from('race_entries')
        .select('id')
        .eq('race_id', raceId)
        .eq('user_id', userId);

      if (userEntries && userEntries.length >= 3) {
        return { eligible: false, reason: 'Maximum 3 pigeons per race allowed' };
      }

      return { eligible: true };
    } catch {
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }
}; 