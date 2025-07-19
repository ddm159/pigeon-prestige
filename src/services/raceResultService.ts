import { supabase } from './supabase';
import type { RaceResult, CompetitionStats, SeasonStanding } from '../types/competition';

/**
 * Race Result Service
 * Handles race results and statistics database operations
 */
export const raceResultService = {
  /**
   * Get race results for a specific race
   */
  async getRaceResults(raceId: string): Promise<RaceResult[]> {
    const { data, error } = await supabase
      .from('race_results')
      .select(`
        *,
        users(username, player_type),
        pigeons(name, picture_number)
      `)
      .eq('race_id', raceId)
      .order('finish_position', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create race result
   */
  async createRaceResult(result: Partial<RaceResult>): Promise<RaceResult> {
    const { data, error } = await supabase
      .from('race_results')
      .insert(result)
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
   * Get user's race results
   */
  async getUserRaceResults(userId: string, seasonId?: string): Promise<RaceResult[]> {
    let query = supabase
      .from('race_results')
      .select(`
        *,
        users(username, player_type),
        pigeons(name, picture_number),
        competition_races(name, category, distance, season_id)
      `)
      .eq('user_id', userId);

    if (seasonId) {
      query = query.eq('competition_races.season_id', seasonId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get competition statistics
   */
  async getCompetitionStats(seasonId?: string): Promise<CompetitionStats> {
    let query = supabase
      .from('race_results')
      .select(`
        *,
        competition_races(distance, prize_pool, season_id)
      `);

    if (seasonId) {
      query = query.eq('competition_races.season_id', seasonId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        totalRaces: 0,
        totalParticipants: 0,
        averageVelocity: 0,
        bestVelocity: 0,
        totalDistance: 0,
        totalPrizeMoney: 0
      };
    }

    const totalRaces = new Set(data.map(r => r.race_id)).size;
    const totalParticipants = data.length;
    const velocities = data.map(r => r.velocity).filter(v => v !== null) as number[];
    const averageVelocity = velocities.length > 0 ? velocities.reduce((sum, v) => sum + v, 0) / velocities.length : 0;
    const bestVelocity = velocities.length > 0 ? Math.max(...velocities) : 0;
    const totalDistance = data.reduce((sum, r) => sum + (r.competition_races?.distance || 0), 0);
    const totalPrizeMoney = data.reduce((sum, r) => sum + (r.prize_won || 0), 0);

    return {
      totalRaces,
      totalParticipants,
      averageVelocity,
      bestVelocity,
      totalDistance,
      totalPrizeMoney
    };
  },

  /**
   * Get division leaderboard
   */
  async getDivisionLeaderboard(divisionId: string, seasonId: string): Promise<SeasonStanding[]> {
    const { data, error } = await supabase
      .from('season_standings')
      .select(`
        *,
        users(username, player_type),
        divisions(division_code, name)
      `)
      .eq('division_id', divisionId)
      .eq('season_id', seasonId)
      .order('total_points', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}; 