import { useState, useCallback } from 'react';
import { competitionOrchestratorService } from '../services/competitionOrchestratorService';
import type { SeasonStanding, RaceResult } from '../types/competition';

/**
 * Season Standings Hook
 * Handles season standings state and operations
 */
export const useSeasonStandings = () => {
  const [seasonStandings, setSeasonStandings] = useState<SeasonStanding[]>([]);
  const [loadingStandings, setLoadingStandings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load season standings
   */
  const loadSeasonStandings = useCallback(async (seasonId: string) => {
    try {
      setLoadingStandings(true);
      setError(null);
      const data = await competitionOrchestratorService.getSeasonStandings(seasonId);
      setSeasonStandings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load season standings');
    } finally {
      setLoadingStandings(false);
    }
  }, []);

  /**
   * Get user's season standing
   */
  const getUserSeasonStanding = useCallback(async (seasonId: string, userId: string) => {
    try {
      setError(null);
      return await competitionOrchestratorService.getUserSeasonStanding(seasonId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user season standing');
      return null;
    }
  }, []);

  /**
   * Update season standing points
   */
  const updateSeasonStandingPoints = useCallback(async (
    seasonId: string,
    userId: string,
    pointsToAdd: number,
    raceResult: Partial<RaceResult>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStanding = await competitionOrchestratorService.updateSeasonStandingPoints(
        seasonId,
        userId,
        pointsToAdd,
        raceResult
      );
      
      // Update local standings
      setSeasonStandings(prev => 
        prev.map(s => 
          s.season_id === seasonId && s.user_id === userId ? updatedStanding : s
        )
      );
      
      return updatedStanding;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update season standing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    seasonStandings,
    loadingStandings,
    loading,
    error,
    loadSeasonStandings,
    getUserSeasonStanding,
    updateSeasonStandingPoints,
    clearError
  };
}; 