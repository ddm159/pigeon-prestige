import { useEffect, useState } from 'react';

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
    // TODO: Replace with real backend/service call
    fetchBestPigeons()
      .then((data) => {
        if (isMounted) setPigeons(data);
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
  return [
    { id: 'p1', name: 'Sky King', owner_id: 'u1', points: 120 },
    { id: 'p2', name: 'Wind Dancer', owner_id: 'u2', points: 110 },
    { id: 'p3', name: 'Feather Flash', owner_id: 'CURRENT_USER_ID', points: 105 },
    { id: 'p4', name: 'Blue Arrow', owner_id: 'u3', points: 100 },
    { id: 'p5', name: 'Cloud Surfer', owner_id: 'CURRENT_USER_ID', points: 98 },
  ];
} 