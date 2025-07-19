import { useEffect, useCallback, useRef } from 'react';
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

  // Store function references to avoid dependency issues
  const functionsRef = useRef({
    divisionManagement,
    seasonManagement,
    seasonStandings,
    raceManagement,
    raceEntries,
    raceResults
  });

  // Update ref when hooks change
  functionsRef.current = {
    divisionManagement,
    seasonManagement,
    seasonStandings,
    raceManagement,
    raceEntries,
    raceResults
  };

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
        functionsRef.current.divisionManagement.loadDivisions(),
        functionsRef.current.seasonManagement.loadSeasons(),
        functionsRef.current.seasonManagement.loadActiveSeason(),
        functionsRef.current.raceManagement.loadUpcomingRaces()
      ]);
    } catch (err) {
      // Error handling is done in individual hooks
      console.error('Failed to initialize competition:', err);
    }
  }, []);

  /**
   * Clear all errors
   */
  const clearError = useCallback(() => {
    functionsRef.current.divisionManagement.clearError();
    functionsRef.current.seasonManagement.clearError();
    functionsRef.current.seasonStandings.clearError();
    functionsRef.current.raceManagement.clearError();
    functionsRef.current.raceEntries.clearError();
    functionsRef.current.raceResults.clearError();
  }, []);

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