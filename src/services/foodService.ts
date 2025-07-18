import { supabase } from './supabase';
import type { Food, UserFoodInventory, FoodMix, GroupFeeding, PigeonFeedHistory } from '../types/pigeon';

/**
 * Service for food system: foods, inventory, mixes, group feedings, and feed history.
 */
export const foodService = {
  /** List all available foods */
  async listFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*');
    if (error) throw error;
    // Sort by name in JS for compatibility
    return (data || []).sort((a, b) => a.name.localeCompare(b.name));
  },

  /** Get a user's food inventory */
  async getUserInventory(userId: string): Promise<UserFoodInventory[]> {
    const { data, error } = await supabase
      .from('user_food_inventory')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  /** Update a user's food inventory (buy, consume, etc.) */
  async updateUserInventory(userId: string, foodId: string, quantity: number): Promise<void> {
    if (quantity < 0) throw new Error('Quantity cannot be negative');
    if (quantity === 0) {
      // Remove the inventory row if quantity is zero
      const { error } = await supabase
        .from('user_food_inventory')
        .delete()
        .eq('user_id', userId)
        .eq('food_id', foodId);
      if (error) throw error;
      return;
    }
    // First try to update
    const { data, error } = await supabase
      .from('user_food_inventory')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('food_id', foodId)
      .select();
    if (error) throw error;
    if (data && data.length > 0) return;
    // If no row was updated, insert new
    const { error: insertError } = await supabase
      .from('user_food_inventory')
      .insert({ user_id: userId, food_id: foodId, quantity });
    if (insertError) throw insertError;
  },

  /** List all food mixes for a user */
  async listFoodMixes(userId: string): Promise<FoodMix[]> {
    const { data, error } = await supabase
      .from('food_mix')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /** Create a new food mix */
  async createFoodMix(userId: string, name: string, mix: Record<string, number>): Promise<FoodMix> {
    const { data, error } = await supabase
      .from('food_mix')
      .insert({ user_id: userId, name, mix_json: mix })
      .select()
      .single();
    if (error) throw error;
    return data as FoodMix;
  },

  /** Delete a food mix */
  async deleteFoodMix(foodMixId: string): Promise<void> {
    const { error } = await supabase
      .from('food_mix')
      .delete()
      .eq('id', foodMixId);
    if (error) throw error;
  },

  /** Apply a food mix to a group */
  async applyFoodMixToGroup(groupId: string, foodMixId: string): Promise<GroupFeeding> {
    const { data, error } = await supabase
      .from('group_feedings')
      .insert({ group_id: groupId, food_mix_id: foodMixId })
      .select()
      .single();
    if (error) throw error;
    return data as GroupFeeding;
  },

  /** Get feeding history for a pigeon */
  async getPigeonFeedHistory(pigeonId: string): Promise<PigeonFeedHistory[]> {
    const { data, error } = await supabase
      .from('pigeon_feed_history')
      .select('*')
      .eq('pigeon_id', pigeonId)
      .order('applied_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /** Record a feeding event for a pigeon */
  async recordPigeonFeeding(pigeonId: string, foodMixId: string | null, groupId?: string | null): Promise<void> {
    const { error } = await supabase
      .from('pigeon_feed_history')
      .insert({
        pigeon_id: pigeonId,
        food_mix_id: foodMixId,
        group_id: groupId || null,
      });
    if (error) throw error;
  },
}; 