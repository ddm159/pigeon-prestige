import { supabase } from './supabase';
import type { Season, SeasonStatus } from '../types/competition';

/**
 * Season Service
 * Handles season-related database operations
 */
export const seasonService = {
  /**
   * Get all seasons
   */
  async getSeasons(): Promise<Season[]> {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get active season
   */
  async getActiveSeason(): Promise<Season | null> {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('status', 'active')
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create new season
   */
  async createSeason(name: string, startDate: string, endDate: string): Promise<Season> {
    const { data, error } = await supabase
      .from('seasons')
      .insert({
        name,
        start_date: startDate,
        end_date: endDate,
        status: 'upcoming'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update season status
   */
  async updateSeasonStatus(seasonId: string, status: SeasonStatus): Promise<Season> {
    const { data, error } = await supabase
      .from('seasons')
      .update({ status })
      .eq('id', seasonId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}; 