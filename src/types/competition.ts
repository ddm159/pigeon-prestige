/**
 * Competition system types for pigeon racing game.
 * All types are strictly typed and documented for maintainability and scalability.
 */

/**
 * League entity (Pro, 2A, 2B, International, etc.)
 */
export interface League {
  id: string;
  name: string;
  type: 'pro' | '2a' | '2b' | 'international';
  is_active: boolean;
  created_at: string;
}

/**
 * Season entity
 */
export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

/**
 * League assignment (user in league for a season)
 */
export interface LeagueAssignment {
  user_id: string;
  league_id: string;
  season_id: string;
  joined_at: string;
  is_ai: boolean;
  last_active: string | null;
}

/**
 * League standings for a user in a league/season
 */
export interface Standing {
  user_id: string;
  league_id: string;
  season_id: string;
  points: number;
  rank: number | null;
  tiebreaker_points: number;
  updated_at: string;
}

/**
 * AI player name pool
 */
export interface AIName {
  id: number;
  name: string;
} 