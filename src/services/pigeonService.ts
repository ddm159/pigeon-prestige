import { supabase } from './supabase';
import type { Pigeon } from '../types/pigeon';
import { maleNames, femaleNames, lastNames } from './pigeonNames';
import { pigeonSchema, validatePigeon } from '../types/pigeonSchema';
import { z } from 'zod';

export const pigeonService = {
  /**
   * Get all pigeons for a user, validated with zod.
   * @param userId - The user's ID
   * @returns Array of Pigeon objects
   * @throws Supabase or validation error
   */
  async getUserPigeons(userId: string): Promise<Pigeon[]> {
    const { data, error } = await supabase
      .from('pigeons')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) return [];
    return z.array(pigeonSchema).parse(data);
  },

  /**
   * Get a single pigeon by ID, validated with zod.
   * @param pigeonId - The pigeon's ID
   * @returns Pigeon object or null
   * @throws Supabase or validation error
   */
  async getPigeon(pigeonId: string): Promise<Pigeon | null> {
    const { data, error } = await supabase
      .from('pigeons')
      .select('*')
      .eq('id', pigeonId)
      .single();
    if (error) throw error;
    if (!data) return null;
    return validatePigeon(data);
  },

  /**
   * Create a new pigeon, validated with zod.
   * @param pigeon - Pigeon data (without id, created_at, updated_at)
   * @returns The created Pigeon object
   * @throws Supabase or validation error
   */
  async createPigeon(pigeon: Omit<Pigeon, 'id' | 'created_at' | 'updated_at'>): Promise<Pigeon> {
    const { data, error } = await supabase
      .from('pigeons')
      .insert([pigeon])
      .select()
      .single();
    if (error) throw error;
    return validatePigeon(data);
  },

  /**
   * Update a pigeon by ID, validated with zod.
   * @param pigeonId - The pigeon's ID
   * @param updates - Partial pigeon fields to update
   * @returns The updated Pigeon object
   * @throws Supabase or validation error
   */
  async updatePigeon(pigeonId: string, updates: Partial<Pigeon>): Promise<Pigeon> {
    const { data, error } = await supabase
      .from('pigeons')
      .update(updates)
      .eq('id', pigeonId)
      .select()
      .single();
    if (error) throw error;
    return validatePigeon(data);
  },

  /**
   * Delete a pigeon by ID.
   * @param pigeonId - The pigeon's ID
   * @returns void
   * @throws Supabase error
   */
  async deletePigeon(pigeonId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeons')
      .delete()
      .eq('id', pigeonId);
    if (error) throw error;
  },

  /**
   * Update a pigeon's alias, validated with zod.
   * @param pigeonId - The pigeon's ID
   * @param alias - The new alias or null
   * @returns The updated Pigeon object
   * @throws Supabase or validation error
   */
  async updatePigeonAlias(pigeonId: string, alias: string | null): Promise<Pigeon> {
    const { data, error } = await supabase
      .from('pigeons')
      .update({ 
        alias,
        updated_at: new Date().toISOString()
      })
      .eq('id', pigeonId)
      .select()
      .single();
    if (error) {
      throw new Error(`Failed to update pigeon alias: ${error.message}`);
    }
    return validatePigeon(data);
  },

  /**
   * Create starting pigeons for a new user, validated with zod.
   * @param userId - The user's ID
   * @returns Array of created Pigeon objects
   * @throws Supabase or validation error
   */
  async createStartingPigeons(userId: string): Promise<Pigeon[]> {
    console.log('🕊️ Creating starting pigeons for user:', userId);
    const pigeons: Omit<Pigeon, 'id' | 'created_at' | 'updated_at'>[] = [];
    for (let i = 0; i < 3; i++) {
      const pigeon = this.generateRandomPigeon(userId, 'male', 1, 0, 0);
      pigeons.push(pigeon);
    }
    for (let i = 0; i < 2; i++) {
      const pigeon = this.generateRandomPigeon(userId, 'female', 1, 0, 0);
      pigeons.push(pigeon);
    }
    const { data, error } = await supabase
      .from('pigeons')
      .insert(pigeons)
      .select();
    if (error) {
      console.error('❌ Error creating starting pigeons:', error);
      throw error;
    }
    if (!data) return [];
    console.log(`✅ Successfully created ${data.length} starting pigeons`);
    return z.array(pigeonSchema).parse(data);
  },

  /**
   * Generate a random pigeon with realistic stats.
   * @param ownerId - The owner's user ID
   * @param gender - 'male' or 'female'
   * @param years - Age in years
   * @param months - Age in months
   * @param days - Age in days (default 0)
   * @returns Pigeon data (without id, created_at, updated_at)
   */
  generateRandomPigeon(
    ownerId: string,
    gender: 'male' | 'female',
    years: number,
    months: number,
    days: number = 0
  ): Omit<Pigeon, 'id' | 'created_at' | 'updated_at'> {
    const isMale = gender === 'male';
    const firstName = isMale 
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const generateStat = () => Math.round((Math.random() * 60 + 40) * 100) / 100;
    const generatePeakStat = (baseStat: number) => Math.min(100, Math.round((baseStat + Math.random() * 10) * 100) / 100);
    const baseStats = {
      speed: generateStat(),
      endurance: generateStat(),
      sky_iq: generateStat(),
      aerodynamics: generateStat(),
      vision: generateStat(),
      wing_power: generateStat(),
      flapacity: generateStat(),
      vanity: generateStat(),
      strength: generateStat(),
      aggression: generateStat(),
      landing: generateStat(),
      loyalty: generateStat(),
      health: generateStat(),
      happiness: generateStat(),
      fertility: generateStat(),
      disease_resistance: generateStat(),
    };
    const peakStats = {
      peak_speed: generatePeakStat(baseStats.speed),
      peak_endurance: generatePeakStat(baseStats.endurance),
      peak_sky_iq: generatePeakStat(baseStats.sky_iq),
      peak_aerodynamics: generatePeakStat(baseStats.aerodynamics),
      peak_vision: generatePeakStat(baseStats.vision),
      peak_wing_power: generatePeakStat(baseStats.wing_power),
      peak_flapacity: generatePeakStat(baseStats.flapacity),
      peak_vanity: generatePeakStat(baseStats.vanity),
      peak_strength: generatePeakStat(baseStats.strength),
      peak_aggression: generatePeakStat(baseStats.aggression),
      peak_landing: generatePeakStat(baseStats.landing),
      peak_loyalty: generatePeakStat(baseStats.loyalty),
      peak_health: generatePeakStat(baseStats.health),
      peak_happiness: generatePeakStat(baseStats.happiness),
      peak_fertility: generatePeakStat(baseStats.fertility),
      peak_disease_resistance: generatePeakStat(baseStats.disease_resistance),
    };
    const hiddenStats = {
      eggs: generateStat(),
      offspring: generateStat(),
      breeding_quality: generateStat(),
      adaptability: generateStat(),
      recovery_rate: generateStat(),
      laser_focus: generateStat(),
      morale: generateStat(),
      food: generateStat(),
    };
    const hiddenPeakStats = {
      peak_eggs: generatePeakStat(hiddenStats.eggs),
      peak_offspring: generatePeakStat(hiddenStats.offspring),
      peak_breeding_quality: generatePeakStat(hiddenStats.breeding_quality),
      peak_adaptability: generatePeakStat(hiddenStats.adaptability),
      peak_recovery_rate: generatePeakStat(hiddenStats.recovery_rate),
      peak_laser_focus: generatePeakStat(hiddenStats.laser_focus),
      peak_morale: generatePeakStat(hiddenStats.morale),
      peak_food: generatePeakStat(hiddenStats.food),
    };
    const pictureNumber = isMale 
      ? Math.floor(Math.random() * 50) + 1
      : Math.floor(Math.random() * 50) + 51;
    return {
      owner_id: ownerId,
      name,
      gender,
      age_years: years,
      age_months: months,
      age_days: days,
      status: 'active',
      ...baseStats,
      ...peakStats,
      ...hiddenStats,
      ...hiddenPeakStats,
      races_won: 0,
      races_lost: 0,
      total_races: 0,
      best_time: null,
      total_distance: 0,
      offspring_produced: 0,
      successful_breedings: 0,
      picture_number: pictureNumber,
    };
  },
};

 