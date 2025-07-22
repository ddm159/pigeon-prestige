import { supabase } from './supabase';
import {
  leagueSchema,
  leagueAssignmentSchema,
  standingSchema,
  aiNameSchema,
  type League,
  type LeagueAssignment,
  type Standing,
  type AIName,
} from '../types/competitionSchema';

/**
 * Service for managing competitions, leagues, assignments, standings, and AI players.
 * All methods are async, strictly typed, and use zod validation.
 */
export const competitionService = {
  /**
   * Get all leagues.
   */
  async getLeagues(): Promise<League[]> {
    const { data, error } = await supabase.from('leagues').select('*');
    if (error) throw error;
    return leagueSchema.array().parse(data);
  },

  /**
   * Get all league assignments for a season.
   */
  async getLeagueAssignments(seasonId: string): Promise<LeagueAssignment[]> {
    const { data, error } = await supabase
      .from('league_assignments')
      .select('*')
      .eq('season_id', seasonId);
    if (error) throw error;
    return leagueAssignmentSchema.array().parse(data);
  },

  /**
   * Helper: Get the least-filled 2nd division league for a season.
   */
  async getLeastFilledSecondDivision(seasonId: string): Promise<League | null> {
    const { data: leagues, error } = await supabase
      .from('leagues')
      .select('*')
      .in('type', ['2a', '2b'])
      .eq('is_active', true);
    if (error) throw error;
    if (!leagues) return null;
    let minCount = Infinity;
    let targetLeague: League | null = null;
    for (const league of leagues) {
      const { count } = await supabase
        .from('league_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id)
        .eq('season_id', seasonId);
      if ((count ?? 0) < minCount) {
        minCount = count ?? 0;
        targetLeague = leagueSchema.parse(league);
      }
    }
    return targetLeague;
  },

  /**
   * Assign a user (human or AI) to a league for a season.
   * Handles league balancing and AI filling.
   * Ensures no league exceeds 20 players.
   */
  async assignUserToLeague(userId: string, seasonId: string, isAI: boolean): Promise<LeagueAssignment> {
    // Find the least-filled 2nd division league
    const league = await this.getLeastFilledSecondDivision(seasonId);
    if (!league) throw new Error('No available 2nd division league');
    // Check if league is full
    const { count } = await supabase
      .from('league_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('league_id', league.id)
      .eq('season_id', seasonId);
    if ((count ?? 0) >= 20) throw new Error('All 2nd division leagues are full');
    // Assign user to league
    const { data, error } = await supabase
      .from('league_assignments')
      .insert({
        user_id: userId,
        league_id: league.id,
        season_id: seasonId,
        is_ai: isAI,
        last_active: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return leagueAssignmentSchema.parse(data);
  },

  /**
   * Helper: Fill empty slots in all leagues with AI players for a season.
   * TODO: Implement AI creation and assignment logic.
   */
  async fillLeaguesWithAI(): Promise<void> {
    // For each 2nd division league, fill up to 20 with AI
    const { data: leagues } = await supabase
      .from('leagues')
      .select('*')
      .in('type', ['2a', '2b']);
    if (!leagues) return;
    for (const league of leagues) {
      const { count } = await supabase
        .from('league_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id)
        // TODO: Add seasonId filter if needed
      const aiToAdd = 20 - (count ?? 0);
      for (let i = 0; i < aiToAdd; i++) {
        // TODO: Create AI user, get unique AI name, and assign to league
        // await this.assignUserToLeague(aiUserId, seasonId, true);
      }
    }
  },

  /**
   * Get standings for a league and season.
   */
  async getStandings(leagueId: string, seasonId: string): Promise<Standing[]> {
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('league_id', leagueId)
      .eq('season_id', seasonId)
      .order('position', { ascending: true });
    if (error) throw error;
    return standingSchema.array().parse(data);
  },

  /**
   * Update standings for a league and season with new results.
   * TODO: Implement points calculation and update logic.
   */
  async updateStandings(leagueId: string, seasonId: string, results: Array<{ user_id: string; points: number; tiebreaker_points?: number }>): Promise<void> {
    // TODO: Implement batch update of standings based on results
    // For now, stub out logic
    for (const result of results) {
      await supabase
        .from('standings')
        .upsert({
          user_id: result.user_id,
          league_id: leagueId,
          season_id: seasonId,
          points: result.points,
          tiebreaker_points: result.tiebreaker_points ?? 0,
          updated_at: new Date().toISOString(),
        });
    }
  },

  /**
   * Handle season transition: promotion/relegation, AI replacement, league balancing.
   * TODO: Implement full business logic for season end.
   */
  async handleSeasonTransition(): Promise<void> {
    // TODO: Implement promotion/relegation, AI replacement, and league balancing
    // 1. Calculate final standings
    // 2. Promote/relegate users
    // 3. Replace inactive humans with AI
    // 4. Fill empty slots with AI
    // 5. Retire and delete pigeons for replaced users
    // 6. Create new league assignments for next season
  },

  /**
   * Get a list of available AI names.
   */
  async getAvailableAINames(): Promise<AIName[]> {
    const { data, error } = await supabase.from('ai_names').select('*');
    if (error) throw error;
    return aiNameSchema.array().parse(data);
  },
}; 