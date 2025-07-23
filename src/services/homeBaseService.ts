import type { HomeBase } from '../types/homeBase';
import { supabase } from './supabase';

/**
 * Service for managing player home base data in Supabase.
 */
export const homeBaseService = {
  /**
   * Creates a new home base for a user. Throws if already exists.
   * @param homeBase - The home base data to save
   */
  async createHomeBase(homeBase: HomeBase): Promise<void> {
    const { error } = await supabase.from('home_bases').insert([homeBase]);
    if (error) throw new Error(error.message);
  },

  /**
   * Fetches the home base for a given user ID.
   * @param userId - The user ID
   * @returns The HomeBase or null if not found
   */
  async getHomeBaseByUserId(userId: string): Promise<HomeBase | null> {
    const { data, error } = await supabase
      .from('home_bases')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data as HomeBase | null;
  },

  /**
   * Fetches all home bases (for map display, admin, etc.).
   * @returns Array of HomeBase
   */
  async getAllHomeBases(): Promise<HomeBase[]> {
    const { data, error } = await supabase.from('home_bases').select('*');
    if (error) throw new Error(error.message);
    return data as HomeBase[];
  },
}; 