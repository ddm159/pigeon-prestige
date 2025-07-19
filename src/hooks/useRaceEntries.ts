import { useState, useCallback } from 'react';
import { raceEntryService } from '../services/raceEntryService';
import type { RaceEntry } from '../types/competition';

/**
 * Race Entries Hook
 * Handles race entry state and operations
 */
export const useRaceEntries = () => {
  const [raceEntries, setRaceEntries] = useState<RaceEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load race entries
   */
  const loadRaceEntries = useCallback(async (raceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await raceEntryService.getRaceEntries(raceId);
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
      const newEntry = await raceEntryService.createRaceEntry(entry);
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
      return await raceEntryService.getUserRaceEntries(userId, raceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user race entries');
      return [];
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    raceEntries,
    loading,
    error,
    loadRaceEntries,
    createRaceEntry,
    getUserRaceEntries,
    clearError
  };
}; 