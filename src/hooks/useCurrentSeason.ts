import { useEffect, useState } from 'react';
import { getCurrentSeason } from '../services/seasonService';

export function useCurrentSeason() {
  const [season, setSeason] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCurrentSeason()
      .then((data) => {
        setSeason(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch current season');
        setSeason(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { season, loading, error };
} 