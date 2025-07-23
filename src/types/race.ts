/**
 * Types for stat-driven race events and pigeon race results.
 */

import type { Pigeon } from './pigeon';

/**
 * A single event that affects a pigeon's race progress.
 */
export interface PigeonRaceEvent {
  /** Minutes since race start when the event occurs */
  t: number;
  /** Type of event (e.g., boost, slowdown, lost, recovery) */
  effect: 'boost' | 'slowdown' | 'lost' | 'recovery';
  /** Multiplier for speed (e.g., 0.8 for slowdown, 1.25 for boost) */
  mod: number;
  /** Human-readable reason for the event (e.g., 'wind gust 💨') */
  reason: string;
  /** Optional: where on the map (km) */
  locationKm?: number;
}

/**
 * The result and event script for a pigeon in a race.
 */
export interface PigeonRaceResult {
  pigeonId: string;
  startTime: string; // ISO string
  duration: number | null; // Minutes until finish (null if DNF)
  distanceKm: number;
  baseSpeed: number; // km/h
  events: PigeonRaceEvent[];
  stats: Pigeon; // Full pigeon stats for client-side rendering
  didNotFinish?: boolean;
} 