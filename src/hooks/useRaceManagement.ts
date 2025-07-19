import { useState, useCallback } from 'react';
import { raceService } from '../services/raceService';
import type {
  CompetitionRace,
  RaceStatus,
  CompetitionFilters
} from '../types/competition';

/**
 * Race Management Hook
 * Handles race-related state and operations
 */
export const useRaceManagement = () => {
  const [competitionRaces, setCompetitionRaces] = useState<CompetitionRace[]>([]);
  const [upcomingRaces, setUpcomingRaces] = useState<CompetitionRace[]>([]);
  const [loadingRaces, setLoadingRaces] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load competition races with filters
   */
  const loadCompetitionRaces = useCallback(async (filters?: CompetitionFilters) => {
    try {
      setLoadingRaces(true);
      setError(null);
      const data = await raceService.getCompetitionRaces(filters);
      setCompetitionRaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competition races');
    } finally {
      setLoadingRaces(false);
    }
  }, []);

  /**
   * Load upcoming competition races
   */
  const loadUpcomingRaces = useCallback(async () => {
    try {
      setLoadingRaces(true);
      setError(null);
      const data = await raceService.getUpcomingCompetitionRaces();
      setUpcomingRaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upcoming races');
    } finally {
      setLoadingRaces(false);
    }
  }, []);

  /**
   * Create competition race
   */
  const createCompetitionRace = useCallback(async (race: Partial<CompetitionRace>) => {
    try {
      setLoading(true);
      setError(null);
      const newRace = await raceService.createCompetitionRace(race);
      setCompetitionRaces(prev => [...prev, newRace]);
      setUpcomingRaces(prev => [...prev, newRace]);
      return newRace;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create competition race');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update race status
   */
  const updateRaceStatus = useCallback(async (raceId: string, status: RaceStatus) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRace = await raceService.updateRaceStatus(raceId, status);
      
      // Update local races
      setCompetitionRaces(prev => 
        prev.map(r => r.id === raceId ? updatedRace : r)
      );
      setUpcomingRaces(prev => 
        prev.map(r => r.id === raceId ? updatedRace : r)
      );
      
      return updatedRace;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update race status');
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
    competitionRaces,
    upcomingRaces,
    loadingRaces,
    loading,
    error,
    loadCompetitionRaces,
    loadUpcomingRaces,
    createCompetitionRace,
    updateRaceStatus,
    clearError
  };
}; 