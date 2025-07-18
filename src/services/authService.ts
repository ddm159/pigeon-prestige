import { supabase } from './supabase';
import type { User } from '../types/pigeon';
import { pigeonService } from './pigeonService';

export const authService = {
  // Sign up with email
  async signUp(email: string, password: string, username: string) {
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
    
    // Create user profile
    if (data.user) {
      await this.createUserProfile(data.user.id, email, username);
    }
    
    return data;
  },

  // Sign in with email
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Create user profile
  async createUserProfile(userId: string, email: string, username: string) {
    console.log('👤 Creating user profile for:', username, 'with ID:', userId);
    
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          username,
          player_type: 'human',
          balance: 1000, // Starting balance
          total_pigeons: 0,
          pigeon_cap: 50, // Default pigeon cap
          level: 1,
          experience: 0,
        },
      ]);
    
    if (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
    
    console.log('✅ User profile created successfully');

    // Create starting pigeons for new user
    try {
      console.log('🕊️ Starting pigeon creation process...');
      const startingPigeons = await pigeonService.createStartingPigeons(userId);
      
      // Update user's total pigeon count
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
      // Don't throw here as the user profile was created successfully
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
}; 