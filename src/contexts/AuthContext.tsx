import React, { createContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';
import type { User as GameUser } from '../types/pigeon';
import { useNavigate } from 'react-router-dom';

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextType {
  user: User | null;
  gameUser: GameUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gameUser, setGameUser] = useState<GameUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('DEBUG: Starting getInitialSession');
        const currentUser = await authService.getCurrentUser();
        console.log('DEBUG: getCurrentUser result:', currentUser);
        // Only set user if it matches the expected User type
        if (currentUser && 'email' in currentUser && 'created_at' in currentUser) {
          setUser(currentUser as User);
        } else {
          setUser(null);
        }
        
        if (currentUser) {
          try {
            console.log('Getting initial user profile for:', currentUser.id);
            const profile = await authService.getUserProfile(currentUser.id);
            console.log('Initial user profile:', profile);
            setGameUser(profile);
          } catch (error) {
            console.error('Error getting initial user profile:', error);
            // If profile doesn't exist, create it manually
            try {
              console.log('Creating initial user profile manually...');
              await authService.createUserProfile(
                currentUser.id,
                'email' in currentUser && typeof currentUser.email === 'string' ? currentUser.email : '',
                'User'
              );
              const newProfile = await authService.getUserProfile(currentUser.id);
              setGameUser(newProfile);
            } catch (createError) {
              console.error('Error creating initial user profile:', createError);
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Set loading to false even if there's an error
        setLoading(false);
      } finally {
        console.log('Setting loading to false in getInitialSession');
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    getInitialSession().finally(() => {
      clearTimeout(timeoutId);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        console.log('DEBUG: Auth state change event:', _event, 'session:', !!session);
        // Only set user if it matches the expected User type
        if (session?.user && 'email' in session.user && 'created_at' in session.user) {
          setUser(session.user as User);
        } else {
          setUser(null);
        }
        
        if (session?.user) {
          try {
            console.log('Getting user profile for:', session.user.id);
            const profile = await authService.getUserProfile(session.user.id);
            console.log('User profile:', profile);
            setGameUser(profile);
          } catch (error) {
            console.error('Error getting user profile:', error);
            // If profile doesn't exist, create it manually
            try {
              console.log('Creating user profile manually...');
              await authService.createUserProfile(
                session.user.id,
                'email' in session.user && typeof session.user.email === 'string' ? session.user.email : '',
                'User'
              );
              const newProfile = await authService.getUserProfile(session.user.id);
              setGameUser(newProfile);
            } catch (createError) {
              console.error('Error creating user profile:', createError);
            }
          }
        } else {
          setGameUser(null);
        }
        
        console.log('Setting loading to false in auth state change');
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, username);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called - setting loading to true');
    setLoading(true);
    try {
      await authService.signIn(email, password);
      console.log('SignIn completed successfully');
      // Redirect to home page after successful sign in
      navigate('/');
      // Don't set loading to false here - let the auth state change handler do it
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setGameUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const profile = await authService.getUserProfile(user.id);
        setGameUser(profile);
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    gameUser,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  console.log('AuthContext state:', { user: !!user, gameUser: !!gameUser, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 