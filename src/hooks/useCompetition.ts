import { useEffect, useCallback } from 'react';
import { useDivisionManagement } from './useDivisionManagement';
import { useSeasonManagement } from './useSeasonManagement';
import { useSeasonStandings } from './useSeasonStandings';
import { useRaceManagement } from './useRaceManagement';
import { useRaceEntries } from './useRaceEntries';
import { useRaceResults } from './useRaceResults';

/**
 * Competition Hook - Main orchestration hook
 * Coordinates focused hooks for different competition aspects
 */
export const useCompetition = () => {
  // Use focused hooks
  const divisionManagement = useDivisionManagement();
  const seasonManagement = useSeasonManagement();
  const seasonStandings = useSeasonStandings();
  const raceManagement = useRaceManagement();
  const raceEntries = useRaceEntries();
  const raceResults = useRaceResults();

  // Combined error state
  const combinedError = 
    divisionManagement.error || 
    seasonManagement.error || 
    seasonStandings.error || 
    raceManagement.error || 
    raceEntries.error || 
    raceResults.error;

  // Combined loading state
  const combinedLoading = 
    divisionManagement.loadingDivisions || 
    seasonManagement.loadingSeasons || 
    seasonStandings.loadingStandings || 
    raceManagement.loadingRaces || 
    raceEntries.loading || 
    raceResults.loading;

  /**
   * Initialize competition data
   */
  const initializeCompetition = useCallback(async () => {
    try {
      // Load core data in parallel
      await Promise.all([
        divisionManagement.loadDivisions(),
        seasonManagement.loadSeasons(),
        seasonManagement.loadActiveSeason(),
        raceManagement.loadUpcomingRaces()
      ]);
    } catch (err) {
      // Error handling is done in individual hooks
      console.error('Failed to initialize competition:', err);
    }
  }, [
    divisionManagement,
    seasonManagement,
    raceManagement
  ]);

  /**
   * Clear all errors
   */
  const clearError = useCallback(() => {
    divisionManagement.clearError();
    seasonManagement.clearError();
    seasonStandings.clearError();
    raceManagement.clearError();
    raceEntries.clearError();
    raceResults.clearError();
  }, [
    divisionManagement,
    seasonManagement,
    seasonStandings,
    raceManagement,
    raceEntries,
    raceResults
  ]);

  // Auto-initialize on mount
  useEffect(() => {
    initializeCompetition();
  }, [initializeCompetition]);

  return {
    // State from focused hooks
    ...divisionManagement,
    ...seasonManagement,
    ...seasonStandings,
    ...raceManagement,
    ...raceEntries,
    ...raceResults,
    
    // Combined states
    loading: combinedLoading,
    error: combinedError,
    
    // Utility functions
    clearError,
    initializeCompetition
  };
}; 