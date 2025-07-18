import { supabase } from './supabase';
import type { Food, UserFoodInventory, FoodMix, GroupFeeding, PigeonFeedHistory } from '../types/pigeon';

/**
 * Assigns a food mix to a pigeon. Persists the assignment until changed.
 * Updates the pigeon's current_food_mix_id and records the assignment in history.
 * @param pigeonId - The ID of the pigeon
 * @param mixId - The ID of the food mix
 * @returns Promise<boolean>
 */
export async function assignMixToPigeon(pigeonId: string, mixId: string): Promise<boolean> {
  if (!pigeonId || !mixId) throw new Error('pigeonId and mixId are required');
  // 1. Update the persistent assignment
  const { error: updateError } = await supabase
    .from('pigeons')
    .update({ current_food_mix_id: mixId })
    .eq('id', pigeonId);
  if (updateError) throw updateError;
  // 2. Record the assignment in history
  const { error: historyError } = await supabase
    .from('pigeon_feed_history')
    .insert({
      pigeon_id: pigeonId,
      food_mix_id: mixId,
      applied_at: new Date().toISOString(),
    });
  if (historyError) throw historyError;
  return true;
}

/**
 * Assigns a food mix to a group. Persists the assignment until changed.
 * Updates the group's current_food_mix_id and records the assignment in history.
 * @param groupId - The ID of the group
 * @param mixId - The ID of the food mix
 * @returns Promise<boolean>
 */
export async function assignMixToGroup(groupId: string, mixId: string): Promise<boolean> {
  if (!groupId || !mixId) throw new Error('groupId and mixId are required');
  // 1. Update the persistent assignment
  const { error: updateError } = await supabase
    .from('pigeon_groups')
    .update({ current_food_mix_id: mixId })
    .eq('id', groupId);
  if (updateError) throw updateError;
  // 2. Record the assignment in history
  const { error: historyError } = await supabase
    .from('group_feedings')
    .insert({
      group_id: groupId,
      food_mix_id: mixId,
      applied_at: new Date().toISOString(),
    });
  if (historyError) throw historyError;
  return true;
}

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

  /** Purchase food: deduct balance, update inventory, log transaction */
  async purchaseFood(userId: string, food: Food, quantity: number): Promise<void> {
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    // Get user and inventory
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();
    if (userError) throw userError;
    if (!user) throw new Error('User not found');
    const totalCost = food.price * quantity;
    if (user.balance < totalCost) throw new Error('Not enough balance');
    // Get current inventory
    const { data: inv } = await supabase
      .from('user_food_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('food_id', food.id)
      .single();
    const newQty = (inv?.quantity || 0) + quantity;
    // Deduct balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: user.balance - totalCost })
      .eq('id', userId);
    if (balanceError) throw balanceError;
    // Update inventory
    await this.updateUserInventory(userId, food.id, newQty);
    // Log transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'food_purchase',
        amount: -totalCost,
        description: `Purchased ${quantity}x ${food.name}`,
        related_id: food.id
      });
    if (txError) throw txError;
  },

  assignMixToPigeon,
  assignMixToGroup,

  /** Get pigeons experiencing food shortages */
  async getPigeonsWithFoodShortages(userId: string): Promise<Array<{
    pigeon_id: string;
    pigeon_name: string;
    food_shortage_streak: number;
    current_health: number;
    last_penalty_date?: string;
    assigned_food_mix?: string;
  }>> {
    const { data, error } = await supabase
      .from('pigeons')
      .select(`
        id,
        name,
        food_shortage_streak,
        health,
        current_food_mix_id
      `)
      .eq('owner_id', userId)
      .eq('status', 'active')
      .gt('food_shortage_streak', 0);
    
    if (error) throw error;
    
    return (data || []).map(pigeon => ({
      pigeon_id: pigeon.id,
      pigeon_name: pigeon.name,
      food_shortage_streak: pigeon.food_shortage_streak || 0,
      current_health: pigeon.health,
      assigned_food_mix: pigeon.current_food_mix_id || undefined
    }));
  },

  /** Get recent food shortage events */
  async getRecentFoodShortageEvents(userId: string): Promise<PigeonFeedHistory[]> {
    const { data, error } = await supabase
      .from('pigeon_feed_history')
      .select(`
        *,
        pigeons!inner(owner_id)
      `)
      .eq('pigeons.owner_id', userId)
      .eq('food_shortage', true)
      .order('applied_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  },
}; 