import { useState, useEffect } from 'react';
import { searchAddresses } from '../services/geocodingService';
import type { GeocodedAddress } from '../services/geocodingService';

/**
 * Hook for Photon address autocomplete.
 * @param city - City to restrict search (Mendonk, Sint-Kruis-Winkel, Wachtebeke)
 */
export function usePhotonAutocomplete(city: string) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<GeocodedAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setResults([]);
      setError(null);
      return;
    }
    const handler = setTimeout(() => {
      setLoading(true);
      searchAddresses(input, city)
        .then(setResults)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handler);
  }, [input, city]);

  return { input, setInput, results, loading, error };
} 