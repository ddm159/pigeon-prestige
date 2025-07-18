import { supabase } from './supabase';
// Removed unused type imports

export { breedingService } from './breedingService.js';
export { raceService } from './raceService.js';
export { groupService } from './groupService.js';
export { marketService } from './marketService.js';

/**
 * Updates all pigeons' feedings for the current game day.
 * - Each pigeon keeps its last applied mix until a new one is given.
 * - If a food type is empty, auto-fills with a random available type from inventory.
 * - If not enough food, decrements health (5% first, 10% subsequent updates).
 * - Deducts food from inventory and records feeding in pigeon_feed_history.
 * @returns {Promise<void>}
 */
export async function updatePigeonFeedingsForGameDay(): Promise<void> {
  // 1. Get all active pigeons
  const { data: pigeons, error: pigeonsError } = await supabase
    .from('pigeons')
    .select('id, owner_id, health, status, food_shortage_streak')
    .eq('status', 'active');
  if (pigeonsError) throw pigeonsError;
  if (!pigeons) return;

  for (const pigeon of pigeons) {
    // 2. Get last applied food mix for this pigeon
    const { data: lastFeed, error: feedError } = await supabase
      .from('pigeon_feed_history')
      .select('food_mix_id, applied_at, food_shortage')
      .eq('pigeon_id', pigeon.id)
      .order('applied_at', { ascending: false })
      .limit(1)
      .single();
    if (feedError) continue;
    if (!lastFeed) continue; // No mix ever applied
    const foodMixId = lastFeed.food_mix_id;

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
      // Track food shortage streak on pigeon (add field if not present)
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
 * For each group with an assigned mix, applies the mix to all pigeons in the group,
 * using the same food depletion and health penalty logic as updatePigeonFeedingsForGameDay.
 */
export async function updateGroupFeedingsForGameDay(): Promise<void> {
  // 1. Get all group feedings (latest per group)
  const { data: groupFeedings, error: groupFeedingsError } = await supabase
    .from('group_feedings')
    .select('group_id, food_mix_id, applied_at')
    .order('applied_at', { ascending: false });
  if (groupFeedingsError || !groupFeedings) return;

  // Map to latest feeding per group
  const latestGroupFeedings: Record<string, { food_mix_id: string }> = {};
  for (const feeding of groupFeedings) {
    if (!latestGroupFeedings[feeding.group_id]) {
      latestGroupFeedings[feeding.group_id] = { food_mix_id: feeding.food_mix_id };
    }
  }

  // For each group, apply the mix to all pigeons in the group
  for (const groupId of Object.keys(latestGroupFeedings)) {
    const foodMixId = latestGroupFeedings[groupId].food_mix_id;
    // Get pigeons in group
    const { data: groupMembers, error: groupMembersError } = await supabase
      .from('pigeon_group_members')
      .select('pigeon_id')
      .eq('group_id', groupId);
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
            group_id: groupId,
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
          group_id: groupId,
          applied_at: new Date().toISOString(),
          food_shortage: false,
        });
    }
  }
} 