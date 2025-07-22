import { supabase } from './supabase';
import type { User } from '../types/pigeon';
import { pigeonService } from './pigeonService';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  player_type: z.enum(['human', 'ai']),
  balance: z.number(),
  total_pigeons: z.number(),
  pigeon_cap: z.number(),
  level: z.number(),
  experience: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

function validateUser(data: unknown): User {
  return userSchema.parse(data);
}

interface SupabaseAuthResponse {
  user: { id: string } | null;
  [key: string]: unknown;
}

export const authService = {
  /**
   * Sign up with email, password, and username.
   */
  async signUp(email: string, password: string, username: string): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      await this.createUserProfile(data.user.id, email, username);
    }
    return data;
  },

  /**
   * Sign in with email and password.
   */
  async signIn(email: string, password: string): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current authenticated user.
   */
  async getCurrentUser(): Promise<{ id: string } | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Create a user profile in the database and starting pigeons.
   */
  async createUserProfile(userId: string, email: string, username: string): Promise<void> {
    console.log('👤 Creating user profile for:', username, 'with ID:', userId);
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          username,
          player_type: 'human',
          balance: 1000,
          total_pigeons: 0,
          pigeon_cap: 50,
          level: 1,
          experience: 0,
        },
      ]);
    if (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
    console.log('✅ User profile created successfully');
    try {
      console.log('🔊 Starting pigeon creation process...');
      const startingPigeons = await pigeonService.createStartingPigeons(userId);
      const { error: updateError } = await supabase
        .from('users')
        .update({ total_pigeons: startingPigeons.length })
        .eq('id', userId);
      if (updateError) {
        console.error('❌ Error updating user pigeon count:', updateError);
      } else {
        console.log(`✅ Updated user pigeon count to ${startingPigeons.length}`);
      }
      console.log(`🎉 Successfully created ${startingPigeons.length} starting pigeons for user ${username}`);
    } catch (pigeonError) {
      console.error('❌ Error creating starting pigeons:', pigeonError);
    }
  },

  /**
   * Get a user profile by user ID, validated with zod.
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    if (!data) return null;
    return validateUser(data);
  },
}; 