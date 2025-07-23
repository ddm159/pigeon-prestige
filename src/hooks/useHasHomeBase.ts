/**
 * useHasHomeBase
 *
 * Custom React hook to check if a user has set their home base in the game.
 *
 * @param user - The user object (must have an id property), or null/undefined if not logged in.
 * @returns boolean | null - Returns true if the user has a home base, false if not, or null while loading.
 *
 * Usage:
 *   const hasHomeBase = useHasHomeBase(user);
 *   if (hasHomeBase === null) { ...loading... }
 *   else if (!hasHomeBase) { ...prompt to set home base... }
 *
 * This hook is used to gate features (like race subscription) that require a home base.
 * It fetches the home base from Supabase and is safe for use in any component.
 */
import { useState, useEffect } from 'react';
import { homeBaseService } from '../services/homeBaseService';

export function useHasHomeBase(user: { id: string } | null | undefined): boolean | null {
  const [hasHomeBase, setHasHomeBase] = useState<boolean | null>(null);
  useEffect(() => {
    let isMounted = true;
    async function check() {
      if (!user) {
        setHasHomeBase(false);
        return;
      }
      try {
        const homeBase = await homeBaseService.getHomeBaseByUserId(user.id);
        if (isMounted) setHasHomeBase(!!homeBase);
      } catch {
        if (isMounted) setHasHomeBase(false);
      }
    }
    check();
    return () => { isMounted = false; };
  }, [user]);
  return hasHomeBase;
} 