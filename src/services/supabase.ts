import { createClient } from '@supabase/supabase-js';
import type { Pigeon, User } from '../types/pigeon';
import { maleNames, femaleNames, lastNames } from './pigeonNames';

// Replace these with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
  console.warn('⚠️  Please set VITE_SUPABASE_URL in your .env.local file');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn('⚠️  Please set VITE_SUPABASE_ANON_KEY in your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
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

// Pigeon functions
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

  // Create starting pigeons for new user
  async createStartingPigeons(userId: string): Promise<Pigeon[]> {
    console.log('🕊️ Creating starting pigeons for user:', userId);
    
    const pigeons: Omit<Pigeon, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    // Create 3 male pigeons (1 year old)
    for (let i = 0; i < 3; i++) {
      const pigeon = this.generateRandomPigeon(userId, 'male', 1, 0, 0);
      pigeons.push(pigeon);
      console.log(`Created male pigeon ${i + 1}:`, pigeon.name);
    }
    
    // Create 3 female pigeons (1 year old)
    for (let i = 0; i < 3; i++) {
      const pigeon = this.generateRandomPigeon(userId, 'female', 1, 0, 0);
      pigeons.push(pigeon);
      console.log(`Created female pigeon ${i + 1}:`, pigeon.name);
    }
    
    // Create 2 pigeons (0 months old)
    for (let i = 0; i < 2; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const pigeon = this.generateRandomPigeon(userId, gender, 0, 0, 0);
      pigeons.push(pigeon);
      console.log(`Created baby pigeon ${i + 1}:`, pigeon.name);
    }
    
    console.log(`🕊️ Attempting to insert ${pigeons.length} pigeons into database...`);
    console.log('First pigeon data:', pigeons[0]);
    
    const { data, error } = await supabase
      .from('pigeons')
      .insert(pigeons)
      .select();
    
    if (error) {
      console.error('❌ Error inserting pigeons:', error);
      throw error;
    }
    
    console.log(`✅ Successfully created ${data?.length || 0} pigeons:`, data);
    return data || [];
  },

  // Generate random pigeon stats
  generateRandomPigeon(
    ownerId: string,
    gender: 'male' | 'female',
    years: number,
    months: number,
    days: number = 0
  ): Omit<Pigeon, 'id' | 'created_at' | 'updated_at'> {
    // Pick a random first name based on gender
    const firstName = gender === 'male'
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    // Pick a random last name
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    // Combine for full name
    const name = `${firstName} ${lastName}`;

    // Generate random stats (40-100 range)
    const speed = Math.floor(Math.random() * 61) + 40; // 40-100
    const endurance = Math.floor(Math.random() * 61) + 40; // 40-100
    const sky_iq = Math.floor(Math.random() * 61) + 40; // 40-100
    const aerodynamics = Math.floor(Math.random() * 61) + 40; // 40-100
    const vision = Math.floor(Math.random() * 61) + 40; // 40-100
    const wing_power = Math.floor(Math.random() * 61) + 40; // 40-100
    const flapacity = Math.floor(Math.random() * 61) + 40; // 40-100
    const vanity = Math.floor(Math.random() * 101); // 0-100
    const strength = Math.floor(Math.random() * 101); // 0-100
    const aggression = Math.floor(Math.random() * 101); // 0-100
    const landing = Math.floor(Math.random() * 101); // 0-100
    const loyalty = Math.floor(Math.random() * 101); // 0-100
    const health = Math.floor(Math.random() * 21) + 70; // 70-90
    const happiness = Math.floor(Math.random() * 21) + 70; // 70-90
    const fertility = Math.floor(Math.random() * 21) + 70; // 70-90
    const disease_resistance = Math.floor(Math.random() * 21) + 70; // 70-90

    // Generate peak stats (40-100 range)
    const peak_speed = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_endurance = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_sky_iq = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_aerodynamics = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_vision = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_wing_power = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_flapacity = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_vanity = Math.floor(Math.random() * 101); // 0-100
    const peak_strength = Math.floor(Math.random() * 101); // 0-100
    const peak_aggression = Math.floor(Math.random() * 101); // 0-100
    const peak_landing = Math.floor(Math.random() * 101); // 0-100
    const peak_loyalty = Math.floor(Math.random() * 101); // 0-100
    const peak_health = Math.floor(Math.random() * 31) + 70; // 70-100
    const peak_happiness = Math.floor(Math.random() * 31) + 70; // 70-100
    const peak_fertility = Math.floor(Math.random() * 31) + 70; // 70-100
    const peak_disease_resistance = Math.floor(Math.random() * 31) + 70; // 70-100

    // Generate hidden stats
    const eggs = Math.floor(Math.random() * 100) + 1; // 1-100
    const offspring = Math.floor(Math.random() * 100) + 1; // 1-100
    const breeding_quality = Math.floor(Math.random() * 100) + 1; // 1-100
    const adaptability = Math.floor(Math.random() * 61) + 40; // 40-100
    const recovery_rate = Math.floor(Math.random() * 61) + 40; // 40-100
    const laser_focus = Math.floor(Math.random() * 61) + 40; // 40-100
    const morale = Math.floor(Math.random() * 61) + 40; // 40-100
    const food = Math.floor(Math.random() * 100) + 1; // 1-100

    // Generate hidden peak stats
    const peak_eggs = Math.floor(Math.random() * 100) + 1; // 1-100
    const peak_offspring = Math.floor(Math.random() * 100) + 1; // 1-100
    const peak_breeding_quality = Math.floor(Math.random() * 100) + 1; // 1-100
    const peak_adaptability = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_recovery_rate = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_laser_focus = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_morale = Math.floor(Math.random() * 61) + 40; // 40-100
    const peak_food = Math.floor(Math.random() * 100) + 1; // 1-100

    // Generate picture number based on gender (1-50 for males, 51-100 for females)
    const picture_number = gender === 'male' 
      ? Math.floor(Math.random() * 50) + 1  // 1-50 for males
      : Math.floor(Math.random() * 50) + 51; // 51-100 for females
    
    return {
      owner_id: ownerId,
      name,
      gender,
      age_years: years,
      age_months: months,
      age_days: days,
      status: 'active',
      
      // Stats (40-100 range)
      speed,
      endurance,
      sky_iq,
      aerodynamics,
      vision,
      wing_power,
      flapacity,
      vanity,
      strength,
      aggression,
      landing,
      loyalty,
      health,
      happiness,
      fertility,
      disease_resistance,
      
      // Peak stats (40-100 range)
      peak_speed,
      peak_endurance,
      peak_sky_iq,
      peak_aerodynamics,
      peak_vision,
      peak_wing_power,
      peak_flapacity,
      peak_vanity,
      peak_strength,
      peak_aggression,
      peak_landing,
      peak_loyalty,
      peak_health,
      peak_happiness,
      peak_fertility,
      peak_disease_resistance,
      
      // Hidden stats
      eggs,
      offspring,
      breeding_quality,
      adaptability,
      recovery_rate,
      laser_focus,
      morale,
      food,
      
      // Hidden peak stats
      peak_eggs,
      peak_offspring,
      peak_breeding_quality,
      peak_adaptability,
      peak_recovery_rate,
      peak_laser_focus,
      peak_morale,
      peak_food,
      
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
      picture_number,
    };
  },
}; 