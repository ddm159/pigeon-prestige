import { supabase } from './supabase';
import type { Pigeon } from '../types/pigeon';
import { maleNames, femaleNames, lastNames } from './pigeonNames';

export const pigeonService = {
  // Get all pigeons for a user
  async getUserPigeons(userId: string): Promise<Pigeon[]> {
    const { data, error } = await supabase
      .from('pigeons')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get a single pigeon
  async getPigeon(pigeonId: string): Promise<Pigeon | null> {
    const { data, error } = await supabase
      .from('pigeons')
      .select('*')
      .eq('id', pigeonId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new pigeon
  async createPigeon(pigeon: Omit<Pigeon, 'id' | 'created_at' | 'updated_at'>): Promise<Pigeon> {
    const { data, error } = await supabase
      .from('pigeons')
      .insert([pigeon])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a pigeon
  async updatePigeon(pigeonId: string, updates: Partial<Pigeon>): Promise<Pigeon> {
    const { data, error } = await supabase
      .from('pigeons')
      .update(updates)
      .eq('id', pigeonId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a pigeon
  async deletePigeon(pigeonId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeons')
      .delete()
      .eq('id', pigeonId);
    
    if (error) throw error;
  },

  // Update a pigeon's alias
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

    return data;
  },

  // Create starting pigeons for new user
  async createStartingPigeons(userId: string): Promise<Pigeon[]> {
    console.log('🕊️ Creating starting pigeons for user:', userId);
    
    const pigeons: Omit<Pigeon, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    // Create 3 male pigeons (1 year old)
    for (let i = 0; i < 3; i++) {
      const pigeon = this.generateRandomPigeon(userId, 'male', 1, 0, 0);
      pigeons.push(pigeon);
    }
    
    // Create 2 female pigeons (1 year old)
    for (let i = 0; i < 2; i++) {
      const pigeon = this.generateRandomPigeon(userId, 'female', 1, 0, 0);
      pigeons.push(pigeon);
    }
    
    // Insert all pigeons
    const { data, error } = await supabase
      .from('pigeons')
      .insert(pigeons)
      .select();
    
    if (error) {
      console.error('❌ Error creating starting pigeons:', error);
      throw error;
    }
    
    console.log(`✅ Successfully created ${data.length} starting pigeons`);
    return data;
  },

  // Generate a random pigeon with realistic stats
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
    
    // Generate random stats (40-100 range, now fractional)
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
    
    // Generate picture number (1-50 for males, 51-100 for females)
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
      // Racing stats
      races_won: 0,
      races_lost: 0,
      total_races: 0,
      best_time: null,
      total_distance: 0,
      // Breeding stats
      offspring_produced: 0,
      successful_breedings: 0,
      // Picture number
      picture_number: pictureNumber,
    };
  },
};

 