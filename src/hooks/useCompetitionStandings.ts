import { useEffect, useState } from 'react';
import { competitionService } from '../services/competitionService';
import type { Standing } from '../types/competition';
import isEqual from 'lodash.isequal';

/**
 * Custom hook to fetch competition standings for a given league, category, and season.
 * Returns standings, loading, and error state.
 * Follows professional guidelines for hooks.
 */
export function useCompetitionStandings(
  leagueType: 'pro' | '2a' | '2b' | 'international',
  category: 'all' | 'u1',
  seasonId: string
) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    competitionService
      .getLeagues()
      .then((leagues) => {
        const league = leagues.find((l) => l.type === leagueType);
        if (!league) throw new Error('League not found');
        return competitionService.getStandings(league.id, seasonId);
      })
      .then((data) => {
        if (isMounted && !isEqual(data, standings)) {
          setStandings(data);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch standings');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [leagueType, category, seasonId, standings]);

  return { standings, loading, error };
} 