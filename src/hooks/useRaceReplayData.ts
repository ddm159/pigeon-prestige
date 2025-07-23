import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { PigeonRaceResult } from '../types/race';

interface WeatherZone {
  kmStart: number;
  kmEnd: number;
  type: string;
  emoji: string;
}

/**
 * Custom hook to fetch all data needed for RaceReplayPage.
 * @param raceId - The race ID
 * @param userId - The current user's ID
 * @returns { pigeons, userPigeonIds, weatherZones, raceDuration, isLoading, error }
 */
export function useRaceReplayData(raceId: string, userId: string) {
  const [pigeons, setPigeons] = useState<PigeonRaceResult[]>([]);
  const [userPigeonIds, setUserPigeonIds] = useState<string[]>([]);
  const [weatherZones, setWeatherZones] = useState<WeatherZone[]>([]);
  const [raceDuration, setRaceDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch race results (assume stored in a table or use simulateRaceWithEvents API)
        const { data: results, error: resultsError } = await supabase
          .from('race_results')
          .select('*')
          .eq('race_id', raceId);
        if (resultsError) throw new Error('Failed to fetch race results');
        // 2. Fetch user's pigeons
        const { data: userPigeons, error: userPigeonsError } = await supabase
          .from('pigeons')
          .select('id')
          .eq('owner_id', userId);
        if (userPigeonsError) throw new Error('Failed to fetch user pigeons');
        // 3. Stub weather zones (replace with real fetch if available)
        const stubZones: WeatherZone[] = [
          { kmStart: 200, kmEnd: 300, type: 'wind', emoji: '💨' },
          { kmStart: 600, kmEnd: 650, type: 'heat', emoji: '☀️' },
        ];
        // 4. Calculate race duration (max duration from pigeons)
        const maxDuration = results && results.length > 0
          ? Math.max(...results.map((r: any) => r.duration || 0))
          : 0;
        if (isMounted) {
          setPigeons(results as PigeonRaceResult[]);
          setUserPigeonIds(userPigeons.map((p: any) => p.id));
          setWeatherZones(stubZones);
          setRaceDuration(maxDuration);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unknown error');
          setIsLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [raceId, userId]);

  return { pigeons, userPigeonIds, weatherZones, raceDuration, isLoading, error };
} 