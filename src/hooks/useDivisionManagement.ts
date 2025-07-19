import { useState, useCallback } from 'react';
import { competitionService } from '../services/competitionService';
import type { Division, DivisionType, DivisionStats } from '../types/competition';

/**
 * Division Management Hook
 * Handles division-related state and operations
 */
export const useDivisionManagement = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [divisionStats, setDivisionStats] = useState<DivisionStats | null>(null);
  const [loadingDivisions, setLoadingDivisions] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all divisions
   */
  const loadDivisions = useCallback(async () => {
    try {
      setLoadingDivisions(true);
      setError(null);
      const data = await competitionService.getDivisions();
      setDivisions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load divisions');
    } finally {
      setLoadingDivisions(false);
    }
  }, []);

  /**
   * Get division by code
   */
  const getDivisionByCode = useCallback(async (divisionCode: DivisionType): Promise<Division | null> => {
    try {
      setError(null);
      return await competitionService.getDivisionByCode(divisionCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get division');
      return null;
    }
  }, []);

  /**
   * Load division statistics
   */
  const loadDivisionStats = useCallback(async (divisionId: string) => {
    try {
      setLoadingStats(true);
      setError(null);
      const stats = await competitionService.getDivisionStats(divisionId);
      setDivisionStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load division stats');
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
    divisions,
    divisionStats,
    loadingDivisions,
    loadingStats,
    error,
    loadDivisions,
    getDivisionByCode,
    loadDivisionStats,
    clearError
  };
}; 