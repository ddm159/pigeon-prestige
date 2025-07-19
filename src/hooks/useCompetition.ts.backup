import { useState, useEffect, useCallback } from 'react';
import { competitionService } from '../services/competitionService';
import { useDivisionManagement } from './useDivisionManagement';
import { useSeasonManagement } from './useSeasonManagement';
import { useSeasonStandings } from './useSeasonStandings';
import type {
  CompetitionRace,
  RaceEntry,
  RaceResult,
  RaceStatus,
  CompetitionStats,
  CompetitionFilters
} from '../types/competition';

/**
 * Competition Hook - Main competition state management
 * Orchestrates focused hooks for different competition aspects
 */
export const useCompetition = () => {
  // Use focused hooks
  const {
    divisions,
    divisionStats,
    loadingDivisions,
    error: divisionError,
    loadDivisions,
    getDivisionByCode,
    loadDivisionStats,
    clearError: clearDivisionError
  } = useDivisionManagement();

  const {
    seasons,
    activeSeason,
    loadingSeasons,
    error: seasonError,
    loadSeasons,
    loadActiveSeason,
    createSeason,
    updateSeasonStatus,
    clearError: clearSeasonError
  } = useSeasonManagement();

  const {
    seasonStandings,
    loadingStandings,
    error: standingError,
    loadSeasonStandings,
    getUserSeasonStanding,
    updateSeasonStandingPoints,
    clearError: clearStandingError
  } = useSeasonStandings();

  // Local state for races and stats
  const [competitionRaces, setCompetitionRaces] = useState<CompetitionRace[]>([]);
  const [upcomingRaces, setUpcomingRaces] = useState<CompetitionRace[]>([]);
  const [raceEntries, setRaceEntries] = useState<RaceEntry[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [competitionStats, setCompetitionStats] = useState<CompetitionStats | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRaces, setLoadingRaces] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Error states - combine errors from focused hooks
  const [error, setError] = useState<string | null>(null);
  
  // Combined error state
  const combinedError = error || divisionError || seasonError || standingError;

  // ==================== RACE MANAGEMENT ====================

  /**
   * Load competition races with filters
   */
  const loadCompetitionRaces = useCallback(async (filters?: CompetitionFilters) => {
    try {
      setLoadingRaces(true);
      setError(null);
      const data = await competitionService.getCompetitionRaces(filters);
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
      const data = await competitionService.getUpcomingCompetitionRaces();
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
      const newRace = await competitionService.createCompetitionRace(race);
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
      const updatedRace = await competitionService.updateRaceStatus(raceId, status);
      
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

  // ==================== RACE ENTRIES ====================

  /**
   * Load race entries
   */
  const loadRaceEntries = useCallback(async (raceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await competitionService.getRaceEntries(raceId);
      setRaceEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load race entries');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create race entry
   */
  const createRaceEntry = useCallback(async (entry: Partial<RaceEntry>) => {
    try {
      setLoading(true);
      setError(null);
      const newEntry = await competitionService.createRaceEntry(entry);
      setRaceEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create race entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get user's race entries
   */
  const getUserRaceEntries = useCallback(async (userId: string, raceId?: string) => {
    try {
      setError(null);
      return await competitionService.getUserRaceEntries(userId, raceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user race entries');
      return [];
    }
  }, []);

  // ==================== RACE RESULTS ====================

  /**
   * Load race results
   */
  const loadRaceResults = useCallback(async (raceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await competitionService.getRaceResults(raceId);
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
      const newResult = await competitionService.createRaceResult(result);
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
      return await competitionService.getUserRaceResults(userId, seasonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user race results');
      return [];
    }
  }, []);

  // ==================== COMPETITION STATISTICS ====================

  /**
   * Load competition statistics
   */
  const loadCompetitionStats = useCallback(async (seasonId?: string) => {
    try {
      setLoadingStats(true);
      setError(null);
      const stats = await competitionService.getCompetitionStats(seasonId);
      setCompetitionStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competition stats');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Check race eligibility
   */
  const checkRaceEligibility = useCallback(async (
    userId: string,
    pigeonId: string,
    raceId: string
  ) => {
    try {
      setError(null);
      return await competitionService.checkRaceEligibility(userId, pigeonId, raceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check race eligibility');
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }, []);

  /**
   * Get division leaderboard
   */
  const getDivisionLeaderboard = useCallback(async (divisionId: string, seasonId: string) => {
    try {
      setError(null);
      return await competitionService.getDivisionLeaderboard(divisionId, seasonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get division leaderboard');
      return [];
    }
  }, []);

  /**
   * Get user's competition history
   */
  const getUserCompetitionHistory = useCallback(async (userId: string) => {
    try {
      setError(null);
      return await competitionService.getUserCompetitionHistory(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user competition history');
      return { standings: [], results: [], entries: [] };
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
    clearDivisionError();
    clearSeasonError();
    clearStandingError();
  }, [clearDivisionError, clearSeasonError, clearStandingError]);

  /**
   * Initialize competition data
   */
  const initializeCompetition = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load core data in parallel
      await Promise.all([
        loadDivisions(),
        loadSeasons(),
        loadActiveSeason(),
        loadUpcomingRaces()
      ]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize competition');
    } finally {
      setLoading(false);
    }
  }, [loadDivisions, loadSeasons, loadActiveSeason, loadUpcomingRaces]);

  // Auto-initialize on mount
  useEffect(() => {
    initializeCompetition();
  }, [initializeCompetition]);

  return {
    // State
    divisions,
    seasons,
    activeSeason,
    seasonStandings,
    competitionRaces,
    upcomingRaces,
    raceEntries,
    raceResults,
    competitionStats,
    divisionStats,
    
    // Loading states
    loading,
    loadingDivisions,
    loadingSeasons,
    loadingStandings,
    loadingRaces,
    loadingStats,
    
    // Error state
    error: combinedError,
    
    // Division functions
    loadDivisions,
    getDivisionByCode,
    loadDivisionStats,
    
    // Season functions
    loadSeasons,
    loadActiveSeason,
    createSeason,
    updateSeasonStatus,
    
    // Standings functions
    loadSeasonStandings,
    getUserSeasonStanding,
    updateSeasonStandingPoints,
    
    // Race functions
    loadCompetitionRaces,
    loadUpcomingRaces,
    createCompetitionRace,
    updateRaceStatus,
    
    // Entry functions
    loadRaceEntries,
    createRaceEntry,
    getUserRaceEntries,
    
    // Result functions
    loadRaceResults,
    createRaceResult,
    getUserRaceResults,
    
    // Statistics functions
    loadCompetitionStats,
    
    // Utility functions
    checkRaceEligibility,
    getDivisionLeaderboard,
    getUserCompetitionHistory,
    clearError,
    initializeCompetition
  };
}; 