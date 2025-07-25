import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Pigeon } from '../types/pigeon';

interface RaceParticipant {
  pigeon_id: string;
  race_id: string;
}
interface Race {
  id: string;
  start_time: string;
}

/**
 * Custom hook to fetch pigeons eligible for a given race (not already in a race on the same day).
 * @param userId - The user's ID
 * @param raceId - The race's ID
 * @returns { eligiblePigeons, ineligiblePigeons, isLoading, error }
 */
export function useEligiblePigeonsForRace(userId: string, raceId: string) {
  const [eligiblePigeons, setEligiblePigeons] = useState<Pigeon[]>([]);
  const [ineligiblePigeons, setIneligiblePigeons] = useState<Pigeon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPigeons() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Get the target race's start date
        const { data: race, error: raceError } = await supabase
          .from('races')
          .select('start_time')
          .eq('id', raceId)
          .single();
        if (raceError || !race) throw new Error('Race not found');
        const targetDay = new Date(race.start_time).toISOString().slice(0, 10);

        // 2. Get all pigeons for the user
        const { data: pigeons, error: pigeonsError } = await supabase
          .from('pigeons')
          .select('*')
          .eq('owner_id', userId);
        if (pigeonsError || !pigeons) throw new Error('Failed to fetch pigeons');

        // 3. Get all race_participants for these pigeons
        const pigeonIds = pigeons.map((p: Pigeon) => p.id);
        let ineligibleIds: string[] = [];
        if (pigeonIds.length > 0) {
          const { data: raceParticipants, error: rpError } = await supabase
            .from('race_participants')
            .select('pigeon_id, race_id')
            .in('pigeon_id', pigeonIds);
          if (rpError) throw new Error('Failed to fetch race participation');
          const raceIds = (raceParticipants as RaceParticipant[]).map((rp) => rp.race_id);
          // 4. Get start times for these races
          let racesOnSameDay: Race[] = [];
          if (raceIds.length > 0) {
            const { data: races, error: racesError } = await supabase
              .from('races')
              .select('id, start_time')
              .in('id', raceIds);
            if (racesError) throw new Error('Failed to fetch race dates');
            racesOnSameDay = (races as Race[]).filter((r) => {
              const d = new Date(r.start_time);
              return d.toISOString().slice(0, 10) === targetDay;
            });
          }
          // 5. Mark pigeons as ineligible if they are in a race on the same day
          ineligibleIds = (raceParticipants as RaceParticipant[])
            .filter((rp) =>
              racesOnSameDay.some((r) => r.id === rp.race_id)
            )
            .map((rp) => rp.pigeon_id);
        }
        const eligible = (pigeons as Pigeon[]).filter((p) => !ineligibleIds.includes(p.id));
        const ineligible = (pigeons as Pigeon[]).filter((p) => ineligibleIds.includes(p.id));
        if (isMounted) {
          setEligiblePigeons(eligible);
          setIneligiblePigeons(ineligible);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError((err as Error).message || 'Unknown error');
          setIsLoading(false);
        }
      }
    }
    fetchPigeons();
    return () => {
      isMounted = false;
    };
  }, [userId, raceId]);

  return { eligiblePigeons, ineligiblePigeons, isLoading, error };
} 