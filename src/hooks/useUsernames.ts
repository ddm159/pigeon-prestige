import { useEffect, useState } from 'react';

/**
 * Custom hook to fetch usernames for a list of user IDs.
 * Returns a mapping of userId -> username, loading, and error state.
 * Follows professional guidelines for hooks.
 */
export function useUsernames(userIds: string[]) {
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userIds.length === 0) {
      setUsernames({});
      setLoading(false);
      setError(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchUsernames(userIds)
      .then((map) => {
        if (isMounted) setUsernames(map);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch usernames');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [userIds]);

  return { usernames, loading, error };
}

/**
 * Fetch usernames for a list of user IDs from the users table.
 * Returns a mapping of userId -> username.
 */
async function fetchUsernames(userIds: string[]): Promise<Record<string, string>> {
  // Use Supabase or your API to fetch usernames
  // Example: select id, username from users where id in (...)
  const { supabase } = await import('../services/supabase');
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.id] = row.username;
  }
  return map;
} 