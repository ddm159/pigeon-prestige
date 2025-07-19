// Competition System Types for Pigeon Prestige Game

// Division types
export type DivisionType = '1' | '2A' | '2B';
export type RaceCategory = 'global' | 'regional' | 'youth_global' | 'youth_regional';
export type RaceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type SeasonStatus = 'active' | 'completed' | 'upcoming';
export type PromotionRelegationType = 'promotion' | 'relegation';

// Division interface
export interface Division {
  id: string;
  division_code: DivisionType;
  name: string;
  max_players: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Season interface
export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: SeasonStatus;
  created_at: string;
  updated_at: string;
}

// Season standings interface
export interface SeasonStanding {
  id: string;
  season_id: string;
  user_id: string;
  division_id: string;
  total_points: number;
  races_participated: number;
  best_velocity: number | null;
  average_velocity: number | null;
  total_distance: number;
  total_time: number;
  wins: number;
  top_3_finishes: number;
  top_10_finishes: number;
  created_at: string;
  updated_at: string;
  // Joined user data
  users?: {
    username: string;
    player_type: 'human' | 'ai';
  };
  // Joined division data
  divisions?: {
    division_code: DivisionType;
    name: string;
  };
}

// Competition race interface
export interface CompetitionRace {
  id: string;
  name: string;
  category: RaceCategory;
  distance: number;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  start_time: string;
  status: RaceStatus;
  division_id?: string;
  season_id?: string;
  weather_conditions?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Race entry interface
export interface RaceEntry {
  id: string;
  race_id: string;
  pigeon_id: string;
  user_id: string;
  entry_time: string;
  is_automatic: boolean;
  created_at: string;
}

// Race result interface
export interface RaceResult {
  id: string;
  race_id: string;
  pigeon_id: string;
  user_id: string;
  finish_time: number | null;
  finish_position: number | null;
  velocity: number | null; // m/s
  velocity_kmh: number | null; // km/h for display
  points_earned: number;
  prize_won: number;
  created_at: string;
}

// AI Player interface
export interface AIPlayer {
  id: string;
  username: string;
  division_id: string;
  season_id: string;
  performance_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// AI Player Pigeon interface
export interface AIPlayerPigeon {
  id: string;
  ai_player_id: string;
  name: string;
  gender: 'male' | 'female';
  age_years: number;
  age_months: number;
  age_days: number;
  // Same stats as regular pigeons
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
  // Racing stats
  races_won: number;
  races_lost: number;
  total_races: number;
  best_time: number | null;
  total_distance: number;
  picture_number: number;
  created_at: string;
  updated_at: string;
}

// Promotion/Relegation history interface
export interface PromotionRelegationHistory {
  id: string;
  user_id?: string;
  ai_player_id?: string;
  season_id: string;
  from_division_id: string;
  to_division_id: string;
  type: PromotionRelegationType;
  final_standing_position?: number;
  final_points?: number;
  created_at: string;
}

// Pre-calculated race interface
export interface PreCalculatedRace {
  id: string;
  race_id: string;
  calculation_data: Record<string, unknown>;
  is_calculated: boolean;
  calculated_at?: string;
  created_at: string;
}

// Race progress update interface
export interface RaceProgressUpdate {
  id: string;
  race_id: string;
  update_interval: number;
  standings_snapshot: Record<string, unknown>;
  commentary?: string;
  created_at: string;
}

// Race commentary interface
export interface RaceCommentary {
  id: string;
  race_id: string;
  progress_update_id?: string;
  commentary_text: string;
  commentary_type: 'update' | 'highlight' | 'final';
  llm_prompt?: string;
  created_at: string;
}

// Race standings snapshot interface
export interface RaceStandingsSnapshot {
  id: string;
  race_id: string;
  snapshot_time: string;
  standings_data: Record<string, unknown>;
  created_at: string;
}

// Scheduled race interface
export interface ScheduledRace {
  id: string;
  name_template: string;
  category: RaceCategory;
  distance: number;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string; // Time of day (e.g., 08:00)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Race automation interface
export interface RaceAutomation {
  id: string;
  race_category: RaceCategory;
  auto_entry_enabled: boolean;
  youth_age_limit_months: number;
  health_requirement: number;
  energy_requirement: number;
  created_at: string;
  updated_at: string;
}

// Youth race eligibility interface
export interface YouthRaceEligibility {
  id: string;
  pigeon_id?: string;
  ai_pigeon_id?: string;
  race_id: string;
  is_eligible: boolean;
  age_at_race_months: number;
  created_at: string;
}

// Points system configuration
export const RACE_POINTS = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
  // 11-20: 0 points (participation only)
} as const;

// Promotion/Relegation configuration
export const PROMOTION_RELEGATION_CONFIG = {
  division1: {
    relegationCount: 4,
    relegationDestinations: ['2A', '2B'] as const // 2 each
  },
  division2A: {
    promotionCount: 2,
    promotionDestination: '1' as const
  },
  division2B: {
    promotionCount: 2,
    promotionDestination: '1' as const
  }
} as const;

// Race calculation interface
export interface RaceCalculation {
  pigeonId: string;
  userId: string;
  baseVelocity: number;
  weatherModifier: number;
  healthModifier: number;
  energyModifier: number;
  randomFactor: number;
  finalVelocity: number;
  finishTime: number;
  position: number;
}

// Race execution flow types
export interface RaceExecutionPhase {
  phase: 'pre_calculation' | 'in_progress' | 'completed';
  raceId: string;
  startTime: string;
  endTime?: string;
  totalIntervals: number;
  currentInterval: number;
}

// Race standings interface for live updates
export interface LiveRaceStanding {
  position: number;
  pigeonId: string;
  userId: string;
  username: string;
  currentVelocity: number;
  distanceCovered: number;
  estimatedFinishTime: number;
  isAI: boolean;
}

// Competition statistics interface
export interface CompetitionStats {
  totalRaces: number;
  totalParticipants: number;
  averageVelocity: number;
  bestVelocity: number;
  totalDistance: number;
  totalPrizeMoney: number;
}

// Division statistics interface
export interface DivisionStats {
  divisionId: string;
  divisionCode: DivisionType;
  playerCount: number;
  aiPlayerCount: number;
  averagePoints: number;
  promotionZone: string[];
  relegationZone: string[];
}

// Race schedule interface
export interface RaceSchedule {
  dayOfWeek: number;
  startTime: string;
  races: {
    category: RaceCategory;
    name: string;
    distance: number;
    entryFee: number;
    prizePool: number;
  }[];
}

// AI Player replacement interface
export interface AIPlayerReplacement {
  aiPlayerId: string;
  newUserId: string;
  divisionId: string;
  seasonId: string;
  replacementType: 'human_joins' | 'ai_removed';
}

// Youth race calculation interface
export interface YouthRaceCalculation extends RaceCalculation {
  ageAtRaceMonths: number;
  youthBonus: number;
}

// Weather conditions interface for race calculation
export interface RaceWeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  precipitation: number;
}

// Race commentary context interface
export interface CommentaryContext {
  raceId: string;
  currentInterval: number;
  totalIntervals: number;
  standings: LiveRaceStanding[];
  weatherConditions: RaceWeatherConditions;
  raceCategory: RaceCategory;
  distance: number;
  previousCommentary?: string[];
}

// Competition filter types
export interface CompetitionFilters {
  division?: DivisionType;
  season?: string;
  raceCategory?: RaceCategory;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  playerType?: 'human' | 'ai' | 'all';
}

// All types are already exported above 