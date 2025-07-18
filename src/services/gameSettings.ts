import { supabase } from './supabase';
import type { GameSetting, PigeonCapInfo } from '../types/pigeon';

export const gameSettingsService = {
  // Get all game settings
  async getGameSettings(): Promise<GameSetting[]> {
    const { data: _data, error } = await supabase
      .from('game_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      console.error('Error fetching game settings:', error);
      throw error;
    }

    return _data || [];
  },

  // Get a specific game setting
  async getGameSetting(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('game_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) {
      console.error(`Error fetching game setting ${key}:`, error);
      return null;
    }

    return data?.setting_value || null;
  },

  // Update a game setting (admin only)
  async updateGameSetting(key: string, value: string, description?: string): Promise<void> {
    const { error } = await supabase
      .from('game_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        description: description || null
      });

    if (error) {
      console.error(`Error updating game setting ${key}:`, error);
      throw error;
    }
  },

  // Get user's pigeon cap information
  async getUserPigeonCapInfo(userId: string): Promise<PigeonCapInfo> {
    // Get user's pigeon cap
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pigeon_cap')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user pigeon cap:', userError);
      throw userError;
    }

    // Count user's active pigeons
    const { count, error: countError } = await supabase
      .from('pigeons')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'active');

    if (countError) {
      console.error('Error counting user pigeons:', countError);
      throw countError;
    }

    const currentPigeons = count || 0;
    const pigeonCap = userData.pigeon_cap || 50;

    // Check if penalty was recently applied
    const { data: recentPenalty } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'pigeon_cap_penalty')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastPenaltyDate = recentPenalty?.created_at || null;
    const penaltyApplied = lastPenaltyDate !== null;

    return {
      current_pigeons: currentPigeons,
      pigeon_cap: pigeonCap,
      is_over_cap: currentPigeons > pigeonCap,
      penalty_applied: penaltyApplied,
      last_penalty_date: lastPenaltyDate
    };
  },

  // Apply pigeon cap penalties for a specific user
  async applyPigeonCapPenalty(userId: string): Promise<boolean> {
    const capInfo = await this.getUserPigeonCapInfo(userId);
    
    if (!capInfo.is_over_cap) {
      return false; // No penalty needed
    }

    // Apply health penalty to all active pigeons
    // First get current pigeons to update them individually
    const { data: pigeons, error: fetchError } = await supabase
      .from('pigeons')
      .select('id, health')
      .eq('owner_id', userId)
      .eq('status', 'active');

    if (fetchError) {
      console.error('Error fetching pigeons for penalty:', fetchError);
      throw fetchError;
    }

    // Update each pigeon's health
    for (const pigeon of pigeons || []) {
      const newHealth = Math.max(pigeon.health - 5, 0);
      const { error: updateError } = await supabase
        .from('pigeons')
        .update({ health: newHealth })
        .eq('id', pigeon.id);

      if (updateError) {
        console.error('Error updating pigeon health:', updateError);
        throw updateError;
      }
    }

    // Log the penalty transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'pigeon_cap_penalty',
        amount: -5,
        description: `Health penalty for exceeding pigeon cap (${capInfo.current_pigeons}/${capInfo.pigeon_cap})`
      });

    if (transactionError) {
      console.error('Error logging pigeon cap penalty transaction:', transactionError);
      // Don't throw here as the penalty was already applied
    }

    return true; // Penalty applied
  },

  // Apply pigeon cap penalties for all users (admin function)
  async applyPigeonCapPenaltiesForAllUsers(): Promise<number> {
    const { error } = await supabase.rpc('apply_pigeon_cap_penalties');

    if (error) {
      console.error('Error applying pigeon cap penalties:', error);
      throw error;
    }

    // Count how many penalties were applied
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'pigeon_cap_penalty')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute

    if (countError) {
      console.error('Error counting penalties:', countError);
      return 0;
    }

    return count || 0;
  },

  // Update user's pigeon cap (admin function)
  async updateUserPigeonCap(userId: string, newCap: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ pigeon_cap: newCap })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user pigeon cap:', error);
      throw error;
    }
  },

  // Get default pigeon cap from settings
  async getDefaultPigeonCap(): Promise<number> {
    const defaultCap = await this.getGameSetting('default_pigeon_cap');
    return defaultCap ? parseInt(defaultCap, 10) : 50;
  },

  // Get AI pigeon cap from settings
  async getAIPigeonCap(): Promise<number> {
    const aiCap = await this.getGameSetting('ai_pigeon_cap');
    return aiCap ? parseInt(aiCap, 10) : 50;
  },

  // Get health penalty amount from settings
  async getHealthPenaltyAmount(): Promise<number> {
    const penaltyAmount = await this.getGameSetting('health_penalty_amount');
    return penaltyAmount ? parseInt(penaltyAmount, 10) : 5;
  },

  // Check if user can add more pigeons
  async canUserAddPigeon(userId: string): Promise<{ canAdd: boolean; current: number; cap: number }> {
    const capInfo = await this.getUserPigeonCapInfo(userId);
    
    return {
      canAdd: capInfo.current_pigeons < capInfo.pigeon_cap,
      current: capInfo.current_pigeons,
      cap: capInfo.pigeon_cap
    };
  },

  // Get users who are over their pigeon cap
  async getUsersOverPigeonCap(): Promise<Array<{ user_id: string; current: number; cap: number }>> {
    const { error } = await supabase
      .from('users')
      .select(`
        id,
        pigeon_cap,
        pigeons!inner(count)
      `)
      .eq('player_type', 'human')
      .eq('pigeons.status', 'active');

    if (error) {
      console.error('Error fetching users over pigeon cap:', error);
      throw error;
    }

    // This is a simplified version - in practice, you'd need to count pigeons per user
    // For now, we'll use a different approach
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, pigeon_cap')
      .eq('player_type', 'human');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const usersOverCap = [];

    for (const user of users || []) {
      const capInfo = await this.getUserPigeonCapInfo(user.id);
      if (capInfo.is_over_cap) {
        usersOverCap.push({
          user_id: user.id,
          current: capInfo.current_pigeons,
          cap: capInfo.pigeon_cap
        });
      }
    }

    return usersOverCap;
  }
}; 