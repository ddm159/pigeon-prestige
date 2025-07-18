import { supabase } from './supabase';
// Removed unused type imports

export { breedingService } from './breedingService.js';
export { raceService } from './raceService.js';
export { groupService } from './groupService.js';
export { marketService } from './marketService.js';

/**
 * Updates all pigeons' feedings for the current game day.
 * Uses the persistent current_food_mix_id field for each pigeon.
 * If a food type is empty, auto-fills with a random available type from inventory.
 * If not enough food, decrements health (5% first, 10% subsequent updates).
 * Deducts food from inventory and records feeding in pigeon_feed_history.
 * @returns {Promise<void>}
 */
export async function updatePigeonFeedingsForGameDay(): Promise<void> {
  // 1. Get all active pigeons with their persistent assignment
  const { data: pigeons, error: pigeonsError } = await supabase
    .from('pigeons')
    .select('id, owner_id, health, status, food_shortage_streak, current_food_mix_id')
    .eq('status', 'active');
  if (pigeonsError) throw pigeonsError;
  if (!pigeons) return;

  for (const pigeon of pigeons) {
    // 2. Use persistent assignment
    const foodMixId = pigeon.current_food_mix_id;
    if (!foodMixId) continue; // No mix assigned

    // 3. Get the food mix details
    const { data: foodMix, error: mixError } = await supabase
      .from('food_mix')
      .select('mix_json')
      .eq('id', foodMixId)
      .single();
    if (mixError || !foodMix) continue;
    const mix = foodMix.mix_json as Record<string, number>; // { food_id: percent }

    // 4. Get user's food inventory
    const { data: inventory, error: invError } = await supabase
      .from('user_food_inventory')
      .select('food_id, quantity')
      .eq('user_id', pigeon.owner_id);
    if (invError || !inventory) continue;
    const inventoryMap = Object.fromEntries(inventory.map(f => [f.food_id, f.quantity]));

    // 5. Prepare mix for this feeding (auto-fill empty types)
    const filledMix = { ...mix };
    for (const foodId in filledMix) {
      if (filledMix[foodId] === 0) {
        const available = Object.entries(inventoryMap).filter(([, qty]) => (qty as number) > 0);
        if (available.length > 0) {
          const [randomFoodId] = available[Math.floor(Math.random() * available.length)];
          filledMix[foodId] = filledMix[randomFoodId] || 10;
        }
      }
    }

    // 6. Check if user has enough food for this mix
    let enoughFood = true;
    for (const foodId in filledMix) {
      const required = Math.ceil(filledMix[foodId]);
      if ((inventoryMap[foodId] || 0) < required) {
        enoughFood = false;
        break;
      }
    }

    // 7. If not enough food, decrement health and track shortage streak
    if (!enoughFood) {
      const currentStreak = pigeon.food_shortage_streak || 0;
      const penaltyAmount = currentStreak === 0 ? 5 : 10;
      const newHealth = Math.max(pigeon.health - penaltyAmount, 0);
      await supabase
        .from('pigeons')
        .update({ health: newHealth, food_shortage_streak: currentStreak + 1 })
        .eq('id', pigeon.id);
      // Record penalty in feed history
      await supabase
        .from('pigeon_feed_history')
        .insert({
          pigeon_id: pigeon.id,
          food_mix_id: foodMixId,
          applied_at: new Date().toISOString(),
          food_shortage: true,
        });
      continue; // Skip feeding if not enough food
    } else if (pigeon.food_shortage_streak && pigeon.food_shortage_streak > 0) {
      // Reset streak if food is now available
      await supabase
        .from('pigeons')
        .update({ food_shortage_streak: 0 })
        .eq('id', pigeon.id);
    }

    // 8. Deduct food from inventory
    for (const foodId in filledMix) {
      const required = Math.ceil(filledMix[foodId]);
      const current = inventoryMap[foodId] || 0;
      await supabase
        .from('user_food_inventory')
        .update({ quantity: Math.max(current - required, 0) })
        .eq('user_id', pigeon.owner_id)
        .eq('food_id', foodId);
    }

    // 9. Record feeding in pigeon_feed_history
    await supabase
      .from('pigeon_feed_history')
      .insert({
        pigeon_id: pigeon.id,
        food_mix_id: foodMixId,
        applied_at: new Date().toISOString(),
        food_shortage: false,
      });
  }
}

/**
 * Updates all group feedings for the current game day.
 * Uses the persistent current_food_mix_id field for each group.
 * For each group with an assigned mix, applies the mix to all pigeons in the group,
 * using the same food depletion and health penalty logic as updatePigeonFeedingsForGameDay.
 */
export async function updateGroupFeedingsForGameDay(): Promise<void> {
  // 1. Get all groups with their persistent assignment
  const { data: groups, error: groupsError } = await supabase
    .from('pigeon_groups')
    .select('id, current_food_mix_id');
  if (groupsError || !groups) return;

  for (const group of groups) {
    const foodMixId = group.current_food_mix_id;
    if (!foodMixId) continue; // No mix assigned

    // Get pigeons in group
    const { data: groupMembers, error: groupMembersError } = await supabase
      .from('pigeon_group_members')
      .select('pigeon_id')
      .eq('group_id', group.id);
    if (groupMembersError || !groupMembers) continue;
    const pigeonIds = groupMembers.map((m: { pigeon_id: string }) => m.pigeon_id);
    if (pigeonIds.length === 0) continue;

    // Get food mix details
    const { data: foodMix, error: mixError } = await supabase
      .from('food_mix')
      .select('mix_json')
      .eq('id', foodMixId)
      .single();
    if (mixError || !foodMix) continue;
    const mix = foodMix.mix_json as Record<string, number>;

    // For each pigeon, apply the mix
    for (const pigeonId of pigeonIds) {
      // Get pigeon data
      const { data: pigeon, error: pigeonError } = await supabase
        .from('pigeons')
        .select('id, owner_id, health, status, food_shortage_streak')
        .eq('id', pigeonId)
        .single();
      if (pigeonError || !pigeon || pigeon.status !== 'active') continue;

      // Get user's food inventory
      const { data: inventory, error: invError } = await supabase
        .from('user_food_inventory')
        .select('food_id, quantity')
        .eq('user_id', pigeon.owner_id);
      if (invError || !inventory) continue;
      const inventoryMap = Object.fromEntries(inventory.map(f => [f.food_id, f.quantity]));

      // Prepare mix for this feeding (auto-fill empty types)
      const filledMix = { ...mix };
      for (const foodId in filledMix) {
        if (filledMix[foodId] === 0) {
          const available = Object.entries(inventoryMap).filter(([, qty]) => (qty as number) > 0);
          if (available.length > 0) {
            const [randomFoodId] = available[Math.floor(Math.random() * available.length)];
            filledMix[foodId] = filledMix[randomFoodId] || 10;
          }
        }
      }

      // Check if user has enough food for this mix
      let enoughFood = true;
      for (const foodId in filledMix) {
        const required = Math.ceil(filledMix[foodId]);
        if ((inventoryMap[foodId] || 0) < required) {
          enoughFood = false;
          break;
        }
      }

      // If not enough food, decrement health and track shortage streak
      if (!enoughFood) {
        const currentStreak = pigeon.food_shortage_streak || 0;
        const penaltyAmount = currentStreak === 0 ? 5 : 10;
        const newHealth = Math.max(pigeon.health - penaltyAmount, 0);
        await supabase
          .from('pigeons')
          .update({ health: newHealth, food_shortage_streak: currentStreak + 1 })
          .eq('id', pigeon.id);
        // Record penalty in feed history
        await supabase
          .from('pigeon_feed_history')
          .insert({
            pigeon_id: pigeon.id,
            food_mix_id: foodMixId,
            group_id: group.id,
            applied_at: new Date().toISOString(),
            food_shortage: true,
          });
        continue; // Skip feeding if not enough food
      } else if (pigeon.food_shortage_streak && pigeon.food_shortage_streak > 0) {
        // Reset streak if food is now available
        await supabase
          .from('pigeons')
          .update({ food_shortage_streak: 0 })
          .eq('id', pigeon.id);
      }

      // Deduct food from inventory
      for (const foodId in filledMix) {
        const required = Math.ceil(filledMix[foodId]);
        const current = inventoryMap[foodId] || 0;
        await supabase
          .from('user_food_inventory')
          .update({ quantity: Math.max(current - required, 0) })
          .eq('user_id', pigeon.owner_id)
          .eq('food_id', foodId);
      }

      // Record feeding in pigeon_feed_history
      await supabase
        .from('pigeon_feed_history')
        .insert({
          pigeon_id: pigeon.id,
          food_mix_id: foodMixId,
          group_id: group.id,
          applied_at: new Date().toISOString(),
          food_shortage: false,
        });
    }
  }
} 