import { supabase } from './supabase';
import type {
  Division,
  Season,
  SeasonStanding,
  CompetitionRace,
  RaceEntry,
  RaceResult,
  DivisionType,
  RaceStatus,
  SeasonStatus,
  CompetitionStats,
  DivisionStats,
  CompetitionFilters
} from '../types/competition';

/**
 * Competition Service - Main orchestration service for competition system
 * Handles divisions, seasons, standings, and overall competition management
 */
export const competitionService = {
  // ==================== DIVISION MANAGEMENT ====================

  /**
   * Get all divisions
   */
  async getDivisions(): Promise<Division[]> {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('division_code', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get division by code
   */
  async getDivisionByCode(divisionCode: DivisionType): Promise<Division | null> {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .eq('division_code', divisionCode)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get division statistics
   */
  async getDivisionStats(divisionId: string): Promise<DivisionStats | null> {
    const { data, error } = await supabase
      .from('season_standings')
      .select(`
        *,
        divisions!inner(division_code),
        users!inner(username, player_type)
      `)
      .eq('division_id', divisionId);
    
    if (error) throw error;
    if (!data || data.length === 0) return null;

    const playerCount = data.filter(s => s.users.player_type === 'human').length;
    const aiPlayerCount = data.filter(s => s.users.player_type === 'ai').length;
    const averagePoints = data.reduce((sum, s) => sum + s.total_points, 0) / data.length;

    // Get promotion/relegation zones based on division
    const division = data[0].divisions;
    let promotionZone: string[] = [];
    let relegationZone: string[] = [];

    if (division.division_code === '1') {
      // Division 1: bottom 4 get relegated
      relegationZone = data
        .sort((a, b) => a.total_points - b.total_points)
        .slice(0, 4)
        .map(s => s.users.username);
    } else if (division.division_code === '2A' || division.division_code === '2B') {
      // Division 2A/2B: top 2 get promoted
      promotionZone = data
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 2)
        .map(s => s.users.username);
    }

    return {
      divisionId,
      divisionCode: division.division_code,
      playerCount,
      aiPlayerCount,
      averagePoints,
      promotionZone,
      relegationZone
    };
  },

  // ==================== SEASON MANAGEMENT ====================

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
  },

  // ==================== SEASON STANDINGS ====================

  /**
   * Get season standings for a division
   */
  async getSeasonStandings(seasonId: string, divisionId?: string): Promise<SeasonStanding[]> {
    let query = supabase
      .from('season_standings')
      .select(`
        *,
        users(username, player_type),
        divisions(division_code, name)
      `)
      .eq('season_id', seasonId);

    if (divisionId) {
      query = query.eq('division_id', divisionId);
    }

    const { data, error } = await query.order('total_points', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get user's season standing
   */
  async getUserSeasonStanding(seasonId: string, userId: string): Promise<SeasonStanding | null> {
    const { data, error } = await supabase
      .from('season_standings')
      .select(`
        *,
        divisions(division_code, name)
      `)
      .eq('season_id', seasonId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create or update season standing
   */
  async upsertSeasonStanding(standing: Partial<SeasonStanding>): Promise<SeasonStanding> {
    const { data, error } = await supabase
      .from('season_standings')
      .upsert(standing, { onConflict: 'season_id,user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update season standing points
   */
  async updateSeasonStandingPoints(
    seasonId: string,
    userId: string,
    pointsToAdd: number,
    raceResult: Partial<RaceResult>
  ): Promise<SeasonStanding> {
    // Get current standing
    const currentStanding = await this.getUserSeasonStanding(seasonId, userId);
    
    if (!currentStanding) {
      throw new Error('Season standing not found');
    }

    // Calculate new values
    const newTotalPoints = currentStanding.total_points + pointsToAdd;
    const newRacesParticipated = currentStanding.races_participated + 1;
    const newWins = currentStanding.wins + (raceResult.finish_position === 1 ? 1 : 0);
    const newTop3 = currentStanding.top_3_finishes + (raceResult.finish_position && raceResult.finish_position <= 3 ? 1 : 0);
    const newTop10 = currentStanding.top_10_finishes + (raceResult.finish_position && raceResult.finish_position <= 10 ? 1 : 0);

    // Update velocity records if better
    const newBestVelocity = raceResult.velocity && (!currentStanding.best_velocity || raceResult.velocity > currentStanding.best_velocity)
      ? raceResult.velocity
      : currentStanding.best_velocity;

    // Calculate new average velocity
    const newTotalTime = currentStanding.total_time + (raceResult.finish_time || 0);
    const newTotalDistance = currentStanding.total_distance + (raceResult.velocity ? raceResult.velocity * (raceResult.finish_time || 0) : 0);
    const newAverageVelocity = newTotalDistance / newTotalTime;

    // Update standing
    const { data, error } = await supabase
      .from('season_standings')
      .update({
        total_points: newTotalPoints,
        races_participated: newRacesParticipated,
        best_velocity: newBestVelocity,
        average_velocity: newAverageVelocity,
        total_distance: newTotalDistance,
        total_time: newTotalTime,
        wins: newWins,
        top_3_finishes: newTop3,
        top_10_finishes: newTop10
      })
      .eq('id', currentStanding.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ==================== COMPETITION RACES ====================

  /**
   * Get competition races with filters
   */
  async getCompetitionRaces(filters?: CompetitionFilters): Promise<CompetitionRace[]> {
    let query = supabase
      .from('competition_races')
      .select('*')
      .order('start_time', { ascending: true });

    if (filters?.raceCategory) {
      query = query.eq('category', filters.raceCategory);
    }

    if (filters?.division) {
      query = query.eq('division_id', filters.division);
    }

    if (filters?.season) {
      query = query.eq('season_id', filters.season);
    }

    if (filters?.dateRange) {
      query = query
        .gte('start_time', filters.dateRange.startDate)
        .lte('start_time', filters.dateRange.endDate);
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
      .select('*')
      .in('status', ['scheduled', 'in_progress'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });
    
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
      .select()
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
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ==================== RACE ENTRIES ====================

  /**
   * Get race entries for a race
   */
  async getRaceEntries(raceId: string): Promise<RaceEntry[]> {
    const { data, error } = await supabase
      .from('race_entries')
      .select(`
        *,
        pigeons(name, picture_number),
        users(username, player_type)
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
      .select()
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
        competition_races(name, category, start_time, status)
      `)
      .eq('user_id', userId);

    if (raceId) {
      query = query.eq('race_id', raceId);
    }

    const { data, error } = await query.order('entry_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // ==================== RACE RESULTS ====================

  /**
   * Get race results
   */
  async getRaceResults(raceId: string): Promise<RaceResult[]> {
    const { data, error } = await supabase
      .from('race_results')
      .select(`
        *,
        pigeons(name, picture_number),
        users(username, player_type)
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
      .select()
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
        competition_races(name, category, start_time, distance)
      `)
      .eq('user_id', userId);

    if (seasonId) {
      query = query.eq('competition_races.season_id', seasonId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // ==================== COMPETITION STATISTICS ====================

  /**
   * Get overall competition statistics
   */
  async getCompetitionStats(seasonId?: string): Promise<CompetitionStats> {
    let query = supabase
      .from('competition_races')
      .select('*');

    if (seasonId) {
      query = query.eq('season_id', seasonId);
    }

    const { data: races, error: racesError } = await query;
    if (racesError) throw racesError;

    const { data: results, error: resultsError } = await supabase
      .from('race_results')
      .select('velocity, prize_won, competition_races!inner(distance)');
    
    if (resultsError) throw resultsError;

    const totalRaces = races?.length || 0;
    const totalParticipants = results?.length || 0;
    const velocities = results?.map(r => r.velocity).filter(v => v !== null) as number[];
    const averageVelocity = velocities.length > 0 ? velocities.reduce((sum, v) => sum + v, 0) / velocities.length : 0;
    const bestVelocity = velocities.length > 0 ? Math.max(...velocities) : 0;
    const totalDistance = results?.reduce((sum, r) => sum + (r.competition_races?.[0]?.distance || 0), 0) || 0;
    const totalPrizeMoney = results?.reduce((sum, r) => sum + (r.prize_won || 0), 0) || 0;

    return {
      totalRaces,
      totalParticipants,
      averageVelocity,
      bestVelocity,
      totalDistance,
      totalPrizeMoney
    };
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Check if user is eligible for race entry
   */
  async checkRaceEligibility(
    _userId: string,
    pigeonId: string,
    raceId: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    // Check if already entered
    const { data: existingEntry } = await supabase
      .from('race_entries')
      .select('id')
      .eq('race_id', raceId)
      .eq('pigeon_id', pigeonId)
      .single();

    if (existingEntry) {
      return { eligible: false, reason: 'Pigeon already entered in this race' };
    }

    // Check pigeon health and energy (implement based on your pigeon system)
    // This would need to be implemented based on your current pigeon health/energy system
    
    return { eligible: true };
  },

  /**
   * Get division leaderboard
   */
  async getDivisionLeaderboard(divisionId: string, seasonId: string): Promise<SeasonStanding[]> {
    return this.getSeasonStandings(seasonId, divisionId);
  },

  /**
   * Get user's competition history
   */
  async getUserCompetitionHistory(userId: string): Promise<{
    standings: SeasonStanding[];
    results: RaceResult[];
    entries: RaceEntry[];
  }> {
    const [standings, results, entries] = await Promise.all([
      supabase
        .from('season_standings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      this.getUserRaceResults(userId),
      this.getUserRaceEntries(userId)
    ]);

    if (standings.error) throw standings.error;

    return {
      standings: standings.data || [],
      results,
      entries
    };
  }
}; 