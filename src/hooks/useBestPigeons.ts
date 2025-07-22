import { useEffect, useState } from 'react';
import isEqual from 'lodash.isequal';

/**
 * Pigeon summary for best pigeons overview.
 */
export interface BestPigeon {
  id: string;
  name: string;
  owner_id: string;
  points: number;
}

/**
 * Custom hook to fetch best pigeons for a competition, category, and season.
 * Returns pigeons, loading, and error state.
 * Follows professional guidelines for hooks.
 */
export function useBestPigeons(
  competitionType: 'pro' | '2a' | '2b' | 'international',
  category: 'all' | 'u1',
  seasonId: string
) {
  const [pigeons, setPigeons] = useState<BestPigeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchBestPigeons()
      .then((data) => {
        if (isMounted) {
          setPigeons(prev => {
            if (!isEqual(data, prev)) {
              return data;
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch best pigeons');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [competitionType, category, seasonId]);

  return { pigeons, loading, error };
}

/**
 * Stub for fetching best pigeons (replace with real backend/service call).
 */
async function fetchBestPigeons(): Promise<BestPigeon[]> {
  // TODO: Implement real backend/service call using arguments
  return [];
} 