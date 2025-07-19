import { useState, useCallback } from 'react';
import { competitionService } from '../services/competitionService';
import type { Season, SeasonStatus } from '../types/competition';

/**
 * Season Management Hook
 * Handles season-related state and operations
 */
export const useSeasonManagement = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [loadingSeasons, setLoadingSeasons] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all seasons
   */
  const loadSeasons = useCallback(async () => {
    try {
      setLoadingSeasons(true);
      setError(null);
      const data = await competitionService.getSeasons();
      setSeasons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load seasons');
    } finally {
      setLoadingSeasons(false);
    }
  }, []);

  /**
   * Load active season
   */
  const loadActiveSeason = useCallback(async () => {
    try {
      setLoadingSeasons(true);
      setError(null);
      const season = await competitionService.getActiveSeason();
      setActiveSeason(season);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active season');
    } finally {
      setLoadingSeasons(false);
    }
  }, []);

  /**
   * Create new season
   */
  const createSeason = useCallback(async (name: string, startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const newSeason = await competitionService.createSeason(name, startDate, endDate);
      setSeasons(prev => [newSeason, ...prev]);
      return newSeason;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create season');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update season status
   */
  const updateSeasonStatus = useCallback(async (seasonId: string, status: SeasonStatus) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSeason = await competitionService.updateSeasonStatus(seasonId, status);
      setSeasons(prev => prev.map(s => s.id === seasonId ? updatedSeason : s));
      
      // Update active season if needed
      if (status === 'active') {
        setActiveSeason(updatedSeason);
      } else if (activeSeason?.id === seasonId) {
        setActiveSeason(null);
      }
      
      return updatedSeason;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update season status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeSeason]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    seasons,
    activeSeason,
    loadingSeasons,
    loading,
    error,
    loadSeasons,
    loadActiveSeason,
    createSeason,
    updateSeasonStatus,
    clearError
  };
}; 