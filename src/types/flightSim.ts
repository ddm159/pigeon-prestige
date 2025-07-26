/**
 * Types for Pigeon Flight Path Simulation and Standings
 * @module flightSim
 */

// --- Pigeon Race Event Types ---

/**
 * Event that occurs during a pigeon's race, with timestamp and optional data.
 */
export type PigeonRaceEvent =
  | { type: 'joined_group'; t: number; groupId: string }
  | { type: 'left_group'; t: number }
  | { type: 'strayed'; t: number; duration: number }
  | { type: 'overshot'; t: number; distance: number }
  | { type: 'lost'; t: number }
  | { type: 'returned'; t: number }
  | { type: 'accident'; t: number }
  | { type: 'miracle_finish'; t: number }
  | { type: 'death'; t: number };

/**
 * Script of events and outcome for a single pigeon in a race.
 */
export interface PigeonRaceScript {
  pigeonId: string;
  events: PigeonRaceEvent[];
  outcome: PigeonRaceOutcome;
  finishTime?: number; // seconds since race start
}

/**
 * Possible outcomes for a pigeon in a race.
 */
export type PigeonRaceOutcome = 'finished' | 'lost' | 'injured' | 'dead' | 'dnf' | 'returned';

// --- Standings & State Types ---

/**
 * Standings info for leaderboard and live race view.
 */
export interface PigeonStanding {
  pigeonId: string;
  pigeonName: string;
  ownerName: string;
  velocity: number; // m/min or km/h
  distanceLeft: number; // meters
  speed: number; // current speed (m/min or km/h)
  state: PigeonRaceOutcome;
}

/**
 * LatLng coordinate for map/canvas visualization.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Weather zone affecting the race.
 */
export interface WeatherZone {
  type: string; // e.g., 'wind', 'rain'
  severity: number; // 0-1 or scale
  area: LatLng[]; // polygon or circle
}

/**
 * State of a pigeon at a given time for visualization.
 */
export interface PigeonFlightState {
  position: LatLng;
  groupId?: string;
  state: 'normal' | 'strayed' | 'lost' | 'overshot' | 'dead' | 'returned' | 'finished';
}

// --- Stat Gain Types ---

/**
 * Stat gain for a pigeon after a race.
 */
export interface PigeonStatGain {
  pigeonId: string;
  experience: number;
  racing: number;
  // Add more stats as needed
}

// --- Pigeon Stats (for simulation) ---

/**
 * Core stats used in flight simulation.
 * leadership and raceStart are hidden stats for group/solo and start logic.
 */
export interface PigeonStats {
  speed: number;
  focus: number;
  aggression: number;
  navigation: number;
  skyIQ: number;
  experience: number;
  windResistance: number;
  endurance: number;
  leadership?: number; // hidden stat
  raceStart?: number; // hidden stat
  // Add more as needed
}

/**
 * Race configuration (start, home, distance, etc.)
 */
export interface RaceConfig {
  start: LatLng;
  homeBases: LatLng[];
  totalDistance: number; // meters
  weatherZone: WeatherZone;
  // Add more as needed
}

/**
 * Calculates the current flight state (position, group, state) for a pigeon at time t.
 * Used by the visualization layer for real-time race animation.
 *
 * @param pigeonScript - The event script and outcome for the pigeon
 * @param stats - The stats for the pigeon
 * @param t - The current race time
 * @param weatherZone - The weather zone affecting the race
 * @param raceConfig - The race configuration (start, homeBases, etc.)
 * @param allPigeons - The current flight states of all pigeons (for group logic)
 * @returns The current flight state of the pigeon
 */
export declare function getPigeonFlightStateAtTime(
  pigeonScript: PigeonRaceScript,
  stats: PigeonStats,
  t: number,
  weatherZone: WeatherZone,
  raceConfig: RaceConfig,
  allPigeons: PigeonFlightState[]
): PigeonFlightState; 