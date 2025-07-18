import { supabase } from './supabase';
import type { Pigeon } from '../types/pigeon';

/**
 * Breeding Services
 */
export const breedingService = {
  // Get user's breeding pairs
  async getUserBreedingPairs(userId: string) {
    const { data, error } = await supabase
      .from('breeding_pairs')
      .select(`
        *,
        male_pigeon:pigeons!breeding_pairs_male_pigeon_id_fkey (*),
        female_pigeon:pigeons!breeding_pairs_female_pigeon_id_fkey (*)
      `)
      .eq('owner_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Create a breeding pair
  async createBreedingPair(malePigeonId: string, femalePigeonId: string, userId: string) {
    // Verify both pigeons belong to the user
    const { data: pigeons } = await supabase
      .from('pigeons')
      .select('id, gender')
      .in('id', [malePigeonId, femalePigeonId])
      .eq('owner_id', userId);
    if (!pigeons || pigeons.length !== 2) {
      throw new Error('Both pigeons must belong to you');
    }
    const malePigeon = pigeons.find(p => p.id === malePigeonId);
    const femalePigeon = pigeons.find(p => p.id === femalePigeonId);
    if (!malePigeon || !femalePigeon) {
      throw new Error('Invalid pigeon selection');
    }
    if (malePigeon.gender !== 'male' || femalePigeon.gender !== 'female') {
      throw new Error('Must select one male and one female pigeon');
    }
    const { data, error } = await supabase
      .from('breeding_pairs')
      .insert({
        male_pigeon_id: malePigeonId,
        female_pigeon_id: femalePigeonId,
        owner_id: userId
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Simulate breeding results
  async simulateBreeding(breedingPairId: string) {
    const { data: pair } = await supabase
      .from('breeding_pairs')
      .select(`
        *,
        male_pigeon:pigeons!breeding_pairs_male_pigeon_id_fkey (*),
        female_pigeon:pigeons!breeding_pairs_female_pigeon_id_fkey (*)
      `)
      .eq('id', breedingPairId)
      .single();
    if (!pair || !pair.male_pigeon || !pair.female_pigeon) {
      throw new Error('Breeding pair not found');
    }
    const male = pair.male_pigeon;
    const female = pair.female_pigeon;
    // Calculate breeding success chance
    const successChance = (
      male.fertility * 0.3 +
      female.fertility * 0.3 +
      male.breeding_quality * 0.2 +
      female.breeding_quality * 0.2
    ) / 100;
    const isSuccessful = Math.random() < successChance;
    if (isSuccessful) {
      // Generate offspring stats (inherited from parents)
      const offspringStats = this.calculateOffspringStats(male, female);
      // Create offspring pigeon
      const { data: offspring } = await supabase
        .from('pigeons')
        .insert({
          owner_id: pair.owner_id,
          name: this.generateOffspringName(male.name, female.name),
          gender: Math.random() > 0.5 ? 'male' : 'female',
          ...offspringStats
        })
        .select()
        .single();
      // Update breeding pair
      await supabase
        .from('breeding_pairs')
        .update({
          offspring_produced: pair.offspring_produced + 1,
          successful_breedings: pair.successful_breedings + 1
        })
        .eq('id', breedingPairId);
      return { success: true, offspring };
    } else {
      // Update breeding pair
      await supabase
        .from('breeding_pairs')
        .update({
          successful_breedings: pair.successful_breedings
        })
        .eq('id', breedingPairId);
      return { success: false, offspring: null };
    }
  },

  // Calculate offspring stats based on parents
  calculateOffspringStats(male: Pigeon, female: Pigeon) {
    const stats: Record<string, number> = {};
    // For each stat, inherit from parents with some variation
    const statNames = [
      'speed', 'endurance', 'sky_iq', 'aerodynamics', 'vision',
      'wing_power', 'flapacity', 'vanity', 'strength', 'aggression',
      'landing', 'loyalty', 'health', 'happiness', 'fertility', 'disease_resistance'
    ];
    statNames.forEach(stat => {
      const maleStat = male[stat as keyof Pigeon] as number;
      const femaleStat = female[stat as keyof Pigeon] as number;
      // 60% chance to inherit from better parent, 40% from worse parent
      const betterParent = maleStat > femaleStat ? maleStat : femaleStat;
      const worseParent = maleStat > femaleStat ? femaleStat : maleStat;
      const inheritedStat = Math.random() < 0.6 ? betterParent : worseParent;
      // Add some random variation (±10%)
      const variation = 0.9 + Math.random() * 0.2;
      stats[stat] = Math.max(1, Math.min(100, Math.floor(inheritedStat * variation)));
    });
    return stats;
  },

  // Generate offspring name
  generateOffspringName(maleName: string, femaleName: string): string {
    const maleParts = maleName.split(' ');
    const femaleParts = femaleName.split(' ');
    // Combine parts of both names
    const firstName = Math.random() > 0.5 ? maleParts[0] : femaleParts[0];
    const lastName = Math.random() > 0.5 ? maleParts[maleParts.length - 1] : femaleParts[femaleParts.length - 1];
    return `${firstName} ${lastName}`;
  }
}; 