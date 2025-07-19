import { supabase } from './supabase';
import type { 
  CompetitionRace, 
  RaceStatus, 
  CompetitionFilters 
} from '../types/competition';

/**
 * Race Service
 * Handles race-related database operations
 */
export const raceService = {
  /**
   * Get competition races with filters
   */
  async getCompetitionRaces(filters?: CompetitionFilters): Promise<CompetitionRace[]> {
    let query = supabase
      .from('competition_races')
      .select(`
        *,
        divisions(division_code, name),
        seasons(name, status)
      `)
      .order('race_date', { ascending: true });

    if (filters) {
      if (filters.season) {
        query = query.eq('season_id', filters.season);
      }
      if (filters.division) {
        query = query.eq('division_id', filters.division);
      }
      if (filters.raceCategory) {
        query = query.eq('category', filters.raceCategory);
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get upcoming competition races
   */
  async getUpcomingCompetitionRaces(): Promise<CompetitionRace[]> {
    const { data, error } = await supabase
      .from('competition_races')
      .select(`
        *,
        divisions(division_code, name),
        seasons(name, status)
      `)
      .gte('race_date', new Date().toISOString())
      .order('race_date', { ascending: true })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create competition race
   */
  async createCompetitionRace(race: Partial<CompetitionRace>): Promise<CompetitionRace> {
    const { data, error } = await supabase
      .from('competition_races')
      .insert(race)
      .select(`
        *,
        divisions(division_code, name),
        seasons(name, status)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update race status
   */
  async updateRaceStatus(raceId: string, status: RaceStatus): Promise<CompetitionRace> {
    const { data, error } = await supabase
      .from('competition_races')
      .update({ status })
      .eq('id', raceId)
      .select(`
        *,
        divisions(division_code, name),
        seasons(name, status)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }
}; 