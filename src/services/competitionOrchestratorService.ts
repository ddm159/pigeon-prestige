import { supabase } from './supabase';
import { divisionService } from './divisionService';
import { seasonService } from './seasonService';
import { raceService } from './raceService';
import { raceEntryService } from './raceEntryService';
import { raceResultService } from './raceResultService';
import type {
  SeasonStanding,
  RaceEntry,
  RaceResult
} from '../types/competition';

/**
 * Competition Orchestrator Service
 * Coordinates focused services for competition operations
 */
export const competitionOrchestratorService = {
  // ==================== DIVISION OPERATIONS ====================
  
  getDivisions: divisionService.getDivisions,
  getDivisionByCode: divisionService.getDivisionByCode,
  getDivisionStats: divisionService.getDivisionStats,

  // ==================== SEASON OPERATIONS ====================
  
  getSeasons: seasonService.getSeasons,
  getActiveSeason: seasonService.getActiveSeason,
  createSeason: seasonService.createSeason,
  updateSeasonStatus: seasonService.updateSeasonStatus,

  // ==================== RACE OPERATIONS ====================
  
  getCompetitionRaces: raceService.getCompetitionRaces,
  getUpcomingCompetitionRaces: raceService.getUpcomingCompetitionRaces,
  createCompetitionRace: raceService.createCompetitionRace,
  updateRaceStatus: raceService.updateRaceStatus,

  // ==================== RACE ENTRY OPERATIONS ====================
  
  getRaceEntries: raceEntryService.getRaceEntries,
  createRaceEntry: raceEntryService.createRaceEntry,
  getUserRaceEntries: raceEntryService.getUserRaceEntries,
  checkRaceEligibility: raceEntryService.checkRaceEligibility,

  // ==================== RACE RESULT OPERATIONS ====================
  
  getRaceResults: raceResultService.getRaceResults,
  createRaceResult: raceResultService.createRaceResult,
  getUserRaceResults: raceResultService.getUserRaceResults,
  getCompetitionStats: raceResultService.getCompetitionStats,
  getDivisionLeaderboard: raceResultService.getDivisionLeaderboard,

  // ==================== SEASON STANDINGS ====================

  /**
   * Get season standings for a division
   */
  async getSeasonStandings(seasonId: string): Promise<SeasonStanding[]> {
    // This would need to be implemented in a separate standings service
    // For now, we'll keep it in the orchestrator
    const { data, error } = await supabase
      .from('season_standings')
      .select(`
        *,
        users(username, player_type),
        divisions(division_code, name)
      `)
      .eq('season_id', seasonId)
      .order('total_points', { ascending: false });
    
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
    
    // Update velocity stats if we have velocity data
    let newBestVelocity = currentStanding.best_velocity;
    let newAverageVelocity = currentStanding.average_velocity;
    
    if (raceResult.velocity) {
      if (!newBestVelocity || raceResult.velocity > newBestVelocity) {
        newBestVelocity = raceResult.velocity;
      }
      
      // Recalculate average velocity
      const currentTotal = (currentStanding.average_velocity || 0) * currentStanding.races_participated;
      newAverageVelocity = (currentTotal + raceResult.velocity) / newRacesParticipated;
    }

    // Update finish statistics
    let newWins = currentStanding.wins;
    let newTop3Finishes = currentStanding.top_3_finishes;
    let newTop10Finishes = currentStanding.top_10_finishes;

    if (raceResult.finish_position) {
      if (raceResult.finish_position === 1) {
        newWins += 1;
      }
      if (raceResult.finish_position <= 3) {
        newTop3Finishes += 1;
      }
      if (raceResult.finish_position <= 10) {
        newTop10Finishes += 1;
      }
    }

    // Update distance and time
    const newTotalDistance = currentStanding.total_distance + (raceResult.velocity || 0) * 100; // Approximate
    const newTotalTime = currentStanding.total_time + (raceResult.finish_time || 0);

    // Update the standing
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
        top_3_finishes: newTop3Finishes,
        top_10_finishes: newTop10Finishes
      })
      .eq('season_id', seasonId)
      .eq('user_id', userId)
      .select(`
        *,
        users(username, player_type),
        divisions(division_code, name)
      `)
      .single();
    
    if (error) throw error;
    return data;
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
        .select(`
          *,
          divisions(division_code, name),
          seasons(name, status)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      this.getUserRaceResults(userId),
      
      this.getUserRaceEntries(userId)
    ]);

    return {
      standings: standings.data || [],
      results,
      entries
    };
  }
}; 