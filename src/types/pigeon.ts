// Pigeon Types for Pigeon Prestige Game

export interface User {
  id: string;
  email: string;
  username: string;
  player_type: 'human' | 'ai';
  balance: number;
  total_pigeons: number;
  pigeon_cap: number;
  level: number;
  experience: number;
  created_at: string;
  updated_at: string;
}

export interface Pigeon {
  id: string;
  owner_id: string;
  name: string;
  gender: 'male' | 'female';
  age_years: number;
  age_months: number;
  age_days: number;
  status: 'active' | 'injured' | 'retired' | 'deceased';
  
  // Stats (40-100 range, now fractional, e.g., 73.25)
  speed: number;
  endurance: number;
  sky_iq: number;
  aerodynamics: number;
  vision: number;
  wing_power: number;
  flapacity: number;
  vanity: number;
  strength: number;
  aggression: number;
  landing: number;
  loyalty: number;
  health: number;
  happiness: number;
  fertility: number;
  disease_resistance: number;
  
  // Peak stats (40-100 range, now fractional)
  peak_speed: number;
  peak_endurance: number;
  peak_sky_iq: number;
  peak_aerodynamics: number;
  peak_vision: number;
  peak_wing_power: number;
  peak_flapacity: number;
  peak_vanity: number;
  peak_strength: number;
  peak_aggression: number;
  peak_landing: number;
  peak_loyalty: number;
  peak_health: number;
  peak_happiness: number;
  peak_fertility: number;
  peak_disease_resistance: number;
  
  // Hidden stats (now fractional)
  eggs: number;
  offspring: number;
  breeding_quality: number;
  adaptability: number;
  recovery_rate: number;
  laser_focus: number;
  morale: number;
  food: number;
  
  // Hidden peak stats (now fractional)
  peak_eggs: number;
  peak_offspring: number;
  peak_breeding_quality: number;
  peak_adaptability: number;
  peak_recovery_rate: number;
  peak_laser_focus: number;
  peak_morale: number;
  peak_food: number;
  
  // Racing stats
  races_won: number;
  races_lost: number;
  total_races: number;
  best_time: number | null;
  total_distance: number;
  
  // Breeding stats
  offspring_produced: number;
  successful_breedings: number;
  
  // Picture number for pigeon images (1-50 for males, 51-100 for females)
  picture_number: number;
  
  created_at: string;
  updated_at: string;
}

export interface Race {
  id: string;
  name: string;
  distance: number;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  start_time: string;
  status: string;
  created_at: string;
}

export interface RaceParticipant {
  id: string;
  race_id: string;
  pigeon_id: string;
  user_id: string;
  finish_time: number | null;
  finish_position: number | null;
  prize_won: number;
  created_at: string;
}

export interface BreedingPair {
  id: string;
  male_pigeon_id: string;
  female_pigeon_id: string;
  owner_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  eggs_produced: number;
  offspring_produced: number;
  created_at: string;
}

export interface MarketListing {
  id: string;
  pigeon_id: string;
  seller_id: string;
  price: number;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  related_id: string | null;
  created_at: string;
}

export interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Utility types for pigeon management
export interface PigeonStats {
  // All stats are now fractional (e.g., 73.25) and should be displayed with two decimals
  speed: number;
  endurance: number;
  sky_iq: number;
  aerodynamics: number;
  vision: number;
  wing_power: number;
  flapacity: number;
  vanity: number;
  strength: number;
  aggression: number;
  landing: number;
  loyalty: number;
  health: number;
  happiness: number;
  fertility: number;
  disease_resistance: number;
}

export interface PigeonCapInfo {
  current_pigeons: number;
  pigeon_cap: number;
  is_over_cap: boolean;
  penalty_applied: boolean;
  last_penalty_date: string | null;
}

// Filter types for pigeon overview
export interface PigeonFilters {
  gender?: 'male' | 'female' | 'all';
  ageRange?: {
    minYears?: number;
    maxYears?: number;
    minMonths?: number;
    maxMonths?: number;
    minDays?: number;
    maxDays?: number;
  };
  statFilters?: {
    [key: string]: {
      min?: number;
      max?: number;
    } | undefined;
  };
  isAlive?: boolean;
  canBreed?: boolean;
  isInjured?: boolean;
}

export type ViewMode = 'grid' | 'list';

// Breeding types
export interface BreedingPair {
  male: Pigeon;
  female: Pigeon;
  compatibility: number; // 0-100
  expectedOffspring: number; // 1-3
  breedingTime: number; // in hours
}

export interface BreedingResult {
  id: string;
  maleId: string;
  femaleId: string;
  startDate: string;
  endDate: string;
  eggs: number;
  offspring: Pigeon[];
  success: boolean;
} 

// Pigeon Group types for saved selections
export interface PigeonGroup {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  pigeons?: Pigeon[]; // Optional, for convenience in frontend
}

export interface PigeonGroupMember {
  group_id: string;
  pigeon_id: string;
} 

// Food System Types
export interface Food {
  id: string;
  name: string;
  price: number;
  description?: string;
  best_for?: string;
  effect_type?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFoodInventory {
  user_id: string;
  food_id: string;
  quantity: number;
}

export interface FoodMix {
  id: string;
  user_id: string;
  name: string;
  mix_json: Record<string, number>; // { food_id: percent, ... }
  created_at: string;
  updated_at: string;
}

export interface GroupFeeding {
  id: string;
  group_id: string;
  food_mix_id: string;
  applied_at: string;
}

export interface PigeonFeedHistory {
  id: string;
  pigeon_id: string;
  food_mix_id: string | null;
  applied_at: string;
  group_id?: string | null;
} 