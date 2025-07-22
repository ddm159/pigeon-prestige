import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Custom hook to access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 