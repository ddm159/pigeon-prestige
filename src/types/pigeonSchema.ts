import { z } from 'zod';

export const pigeonSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  name: z.string(),
  alias: z.string().nullable().optional(),
  gender: z.enum(['male', 'female']),
  age_years: z.number(),
  age_months: z.number(),
  age_days: z.number(),
  status: z.enum(['active', 'injured', 'retired', 'deceased']),
  // Stats
  speed: z.number(),
  endurance: z.number(),
  sky_iq: z.number(),
  aerodynamics: z.number(),
  vision: z.number(),
  wing_power: z.number(),
  flapacity: z.number(),
  vanity: z.number(),
  strength: z.number(),
  aggression: z.number(),
  landing: z.number(),
  loyalty: z.number(),
  health: z.number(),
  happiness: z.number(),
  fertility: z.number(),
  disease_resistance: z.number(),
  // Peak stats
  peak_speed: z.number(),
  peak_endurance: z.number(),
  peak_sky_iq: z.number(),
  peak_aerodynamics: z.number(),
  peak_vision: z.number(),
  peak_wing_power: z.number(),
  peak_flapacity: z.number(),
  peak_vanity: z.number(),
  peak_strength: z.number(),
  peak_aggression: z.number(),
  peak_landing: z.number(),
  peak_loyalty: z.number(),
  peak_health: z.number(),
  peak_happiness: z.number(),
  peak_fertility: z.number(),
  peak_disease_resistance: z.number(),
  // Hidden stats
  eggs: z.number(),
  offspring: z.number(),
  breeding_quality: z.number(),
  adaptability: z.number(),
  recovery_rate: z.number(),
  laser_focus: z.number(),
  morale: z.number(),
  food: z.number(),
  // Hidden peak stats
  peak_eggs: z.number(),
  peak_offspring: z.number(),
  peak_breeding_quality: z.number(),
  peak_adaptability: z.number(),
  peak_recovery_rate: z.number(),
  peak_laser_focus: z.number(),
  peak_morale: z.number(),
  peak_food: z.number(),
  // Racing stats
  races_won: z.number(),
  races_lost: z.number(),
  total_races: z.number(),
  best_time: z.number().nullable(),
  total_distance: z.number(),
  // Breeding stats
  offspring_produced: z.number(),
  successful_breedings: z.number(),
  // Picture number
  picture_number: z.number(),
  // Food system fields
  current_food_mix_id: z.string().nullable().optional(),
  food_shortage_streak: z.number().optional(),
  // Timestamps
  created_at: z.string(),
  updated_at: z.string(),
});

export type PigeonFromSchema = z.infer<typeof pigeonSchema>;

export function validatePigeon(data: unknown): PigeonFromSchema {
  return pigeonSchema.parse(data);
} 