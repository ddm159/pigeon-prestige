/**
 * Competition system types for pigeon racing game.
 * All types are strictly typed and documented for maintainability and scalability.
 */

/**
 * Enum for league tiers.
 */
export type LeagueTier = 'pro' | 'second-division';

/**
 * Enum for race types.
 */
export type RaceType = 'regional' | 'international';

/**
 * Enum for age groups in races.
 */
export type AgeGroup = 'all' | 'under-1-year';

/**
 * Represents a league in the competition system.
 */
export interface League {
  id: string;
  name: string;
  tier: LeagueTier;
  season: number;
}

/**
 * Represents a player (human or AI) in the competition system.
 */
export interface Player {
  id: string;
  userId?: string; // present if human
  isHuman: boolean;
  aiProfileId?: string; // present if AI
  username: string;
  lastActive: string; // ISO date string
  leagueId: string;
}

/**
 * Represents an assignment of a player to a league for a season.
 */
export interface LeagueAssignment {
  playerId: string;
  leagueId: string;
  season: number;
}

/**
 * Represents a race in the competition system.
 */
export interface Race {
  id: string;
  type: RaceType;
  date: string; // ISO date string
  leagueId: string;
  ageGroup: AgeGroup;
  season: number;
}

/**
 * Represents an entry of a pigeon in a race.
 */
export interface RaceEntry {
  raceId: string;
  pigeonId: string;
  playerId: string;
}

/**
 * Represents the result of a pigeon in a race.
 */
export interface RaceResult {
  raceId: string;
  pigeonId: string;
  playerId: string;
  position: number;
  points: number;
}

/**
 * Represents the season standings for a player in a league.
 */
export interface SeasonStanding {
  playerId: string;
  leagueId: string;
  season: number;
  points: number;
  internationalPoints: number;
}

/**
 * Represents an AI profile for AI players.
 */
export interface AIProfile {
  id: string;
  name: string;
  personality: string;
  avatarUrl?: string;
} 