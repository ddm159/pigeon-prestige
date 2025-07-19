import { useState, useCallback } from 'react';
import { raceResultService } from '../services/raceResultService';
import type { RaceResult, CompetitionStats } from '../types/competition';

/**
 * Race Results Hook
 * Handles race results and statistics state and operations
 */
export const useRaceResults = () => {
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [competitionStats, setCompetitionStats] = useState<CompetitionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load race results
   */
  const loadRaceResults = useCallback(async (raceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await raceResultService.getRaceResults(raceId);
      setRaceResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load race results');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create race result
   */
  const createRaceResult = useCallback(async (result: Partial<RaceResult>) => {
    try {
      setLoading(true);
      setError(null);
      const newResult = await raceResultService.createRaceResult(result);
      setRaceResults(prev => [...prev, newResult]);
      return newResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create race result');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get user's race results
   */
  const getUserRaceResults = useCallback(async (userId: string, seasonId?: string) => {
    try {
      setError(null);
      return await raceResultService.getUserRaceResults(userId, seasonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user race results');
      return [];
    }
  }, []);

  /**
   * Load competition statistics
   */
  const loadCompetitionStats = useCallback(async (seasonId?: string) => {
    try {
      setLoadingStats(true);
      setError(null);
      const stats = await raceResultService.getCompetitionStats(seasonId);
      setCompetitionStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competition stats');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    raceResults,
    competitionStats,
    loading,
    loadingStats,
    error,
    loadRaceResults,
    createRaceResult,
    getUserRaceResults,
    loadCompetitionStats,
    clearError
  };
}; 