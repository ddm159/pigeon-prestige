import { useEffect, useState } from 'react';
import type { PigeonStanding, PigeonRaceScript, PigeonStats, RaceConfig } from '../types/flightSim';
import { calculatePigeonStandings } from '../services/flightSimService';

/**
 * Custom hook to get live race standings for a given race and time.
 * Fetches (or stubs) race scripts, stats, and config, and returns standings, loading, and error state.
 * @param raceId - The race identifier (optional, for future real backend)
 * @param raceTime - The current race time in seconds (for simulation/testing)
 */
export function useRaceStandings(raceId?: string, raceTime: number = 600) {
  const [standings, setStandings] = useState<PigeonStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with real backend fetch
        // --- Stub data ---
        const scripts: PigeonRaceScript[] = [
          {
            pigeonId: '1',
            events: [],
            outcome: 'finished',
            finishTime: 1200,
          },
          {
            pigeonId: '2',
            events: [
              { type: 'strayed', t: 100, duration: 50 },
              { type: 'overshot', t: 300, distance: 100 },
            ],
            outcome: 'dnf',
          },
        ];
        const stats: Record<string, PigeonStats> = {
          '1': { speed: 1.2, focus: 0.9, aggression: 0.8, navigation: 0.95, skyIQ: 1, experience: 0.7, windResistance: 0.8, endurance: 0.9 },
          '2': { speed: 1.1, focus: 0.8, aggression: 0.7, navigation: 0.85, skyIQ: 0.9, experience: 0.6, windResistance: 0.7, endurance: 0.8 },
        };
        const config: RaceConfig = {
          start: { lat: 0, lng: 0 },
          homeBases: [{ lat: 1, lng: 1 }],
          totalDistance: 1000,
          weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] },
        };
        const t = raceTime; // Use provided race time
        const result = calculatePigeonStandings(scripts, stats, t, config);
        if (!cancelled) setStandings(result);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [raceId, raceTime]);

  return { standings, loading, error };
} 