import { supabase } from './supabase';
import { raceSchema, raceParticipantSchema, validateRace, validateRaceParticipant } from '../types/raceSchema';
import { pigeonSchema } from '../types/pigeonSchema';
import { z } from 'zod';
import type { Race, RaceParticipant } from '../types/pigeon';
import type { Pigeon } from '../types/pigeon';
import type { PigeonRaceResult, PigeonRaceEvent } from '../types/race';

type PigeonStats = {
  speed: number;
  endurance: number;
  sky_iq: number;
  aerodynamics: number;
  wing_power: number;
  flapacity: number;
};

function isPigeonStats(obj: unknown): obj is PigeonStats {
  if (typeof obj !== 'object' || obj === null) return false;
  const keys: (keyof PigeonStats)[] = [
    'speed',
    'endurance',
    'sky_iq',
    'aerodynamics',
    'wing_power',
    'flapacity',
  ];
  return keys.every(
    (key) => typeof (obj as Record<string, unknown>)[key] === 'number'
  );
}

interface Weather {
  wind: number;
  // Add more properties as needed
}

/**
 * Generates a stat-driven event script and race result for a pigeon.
 * @param pigeon - The pigeon object
 * @param raceConfig - { startTime: string, distanceKm: number, weather: any }
 * @returns PigeonRaceResult
 */
export function generatePigeonRaceResult(
  pigeon: Pigeon,
  raceConfig: { startTime: string; distanceKm: number; weather: Weather }
): PigeonRaceResult {
  // Calculate base speed from stats (example formula)
  const baseSpeed = pigeon.speed * 0.8 + pigeon.endurance * 0.2;
  // Calculate duration (minutes)
  const duration = Math.round((raceConfig.distanceKm / baseSpeed) * 60);
  const events: PigeonRaceEvent[] = [];

  // Example: Low endurance = mid-race slowdown
  if (pigeon.endurance < 50) {
    events.push({
      t: Math.round(duration * 0.4),
      effect: 'slowdown',
      mod: 0.8,
      reason: 'tired legs 💤',
    });
  }
  // Example: High speed = late boost
  if (pigeon.speed > 70) {
    events.push({
      t: duration - 100,
      effect: 'boost',
      mod: 1.2,
      reason: 'final sprint! 🦅',
    });
  }
  // Example: Weather impact (wind)
  if (raceConfig.weather?.wind > 20 && pigeon.aerodynamics < 50) {
    events.push({
      t: Math.round(duration * 0.6),
      effect: 'slowdown',
      mod: 0.7,
      reason: 'strong headwind 💨',
    });
  }
  // Example: Navigation (sky_iq)
  if (pigeon.sky_iq < 30 && Math.random() < 0.1) {
    events.push({
      t: Math.round(duration * 0.5),
      effect: 'lost',
      mod: 0,
      reason: 'got lost in the hills 🏔️',
    });
    return {
      pigeonId: pigeon.id,
      startTime: raceConfig.startTime,
      duration: null,
      distanceKm: raceConfig.distanceKm,
      baseSpeed,
      events,
      stats: pigeon,
      didNotFinish: true,
    };
  }
  // Example: Grit (morale) = chance for dramatic recovery
  if (pigeon.morale > 80 && Math.random() < 0.05) {
    events.push({
      t: duration - 10,
      effect: 'recovery',
      mod: 1.5,
      reason: 'miracle finish! ❤️',
    });
  }
  // Sort events by time
  events.sort((a, b) => a.t - b.t);
  return {
    pigeonId: pigeon.id,
    startTime: raceConfig.startTime,
    duration,
    distanceKm: raceConfig.distanceKm,
    baseSpeed,
    events,
    stats: pigeon,
  };
}

/**
 * Simulate race results using stat-driven event generation for all participants.
 * @param raceId - The ID of the race
 * @returns Array of PigeonRaceResult
 */
export async function simulateRaceWithEvents(raceId: string): Promise<PigeonRaceResult[]> {
  // 1. Fetch race config
  const { data: race, error: raceError } = await supabase
    .from('races')
    .select('*')
    .eq('id', raceId)
    .single();
  if (raceError || !race) throw new Error('Race not found');
  // 2. Fetch weather (stub for now, replace with real weather service)
  const weather = { wind: 10 }; // TODO: integrate real weather
  // 3. Fetch all participants and their pigeons
  const { data: participants, error: participantsError } = await supabase
    .from('race_participants')
    .select('*, pigeons(*)')
    .eq('race_id', raceId);
  if (participantsError || !participants) throw new Error('No participants found');
  // 4. Generate results for each pigeon
  const results: PigeonRaceResult[] = (participants as Array<{ pigeons: Pigeon } & RaceParticipant>)
    .map((participant) => {
      const pigeon = participant.pigeons;
      if (!pigeon) return null;
      return generatePigeonRaceResult(pigeon, {
        startTime: race.start_time,
        distanceKm: race.distance,
        weather,
      });
    })
    .filter((r): r is PigeonRaceResult => r !== null);
  return results;
}

/**
 * Race Services
 */
export const raceService = {
  /**
   * Get all upcoming races, validated with zod.
   */
  async getUpcomingRaces(): Promise<Race[]> {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('status', 'upcoming')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });
    if (error) throw error;
    if (!data) return [];
    return z.array(raceSchema).parse(data);
  },

  /**
   * Get race details with participants and nested pigeons/users, validated with zod.
   */
  async getRaceDetails(raceId: string): Promise<unknown> {
    const { data, error } = await supabase
      .from('races')
      .select(`
        *,
        race_participants (
          *,
          pigeons (*),
          users (username)
        )
      `)
      .eq('id', raceId)
      .single();
    if (error) throw error;
    if (!data) return null;
    validateRace(data);
    if (data.race_participants) {
      z.array(raceParticipantSchema).parse(data.race_participants);
      data.race_participants.forEach((p: Record<string, unknown>) => {
        if (p.pigeons) pigeonSchema.parse(p.pigeons);
      });
    }
    return data;
  },

  /**
   * Join a race with a pigeon, validated with zod.
   * Enforces that a pigeon can only participate in one race per day.
   * @param raceId - The ID of the race to join
   * @param pigeonId - The ID of the pigeon
   * @param userId - The ID of the user
   * @returns The RaceParticipant object
   * @throws Error if the pigeon is already in a race on the same day
   */
  async joinRace(raceId: string, pigeonId: string, userId: string): Promise<RaceParticipant> {
    // 1. Check if pigeon is already in a race on the same day
    // Get the start_time of the target race
    const { data: targetRace, error: targetRaceError } = await supabase
      .from('races')
      .select('start_time')
      .eq('id', raceId)
      .single();
    if (targetRaceError || !targetRace) throw new Error('Target race not found');
    const targetDate = new Date(targetRace.start_time);
    const targetDay = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD

    // Find all races this pigeon is already signed up for on the same day
    const { data: existingRaces, error: existingRacesError } = await supabase
      .from('race_participants')
      .select('race_id')
      .eq('pigeon_id', pigeonId);
    if (existingRacesError) throw new Error('Failed to check pigeon race participation');
    if (existingRaces && existingRaces.length > 0) {
      // Get start times for these races
      const raceIds = existingRaces.map((r: { race_id: string }) => r.race_id);
      if (raceIds.length > 0) {
        const { data: racesOnSameDay, error: racesOnSameDayError } = await supabase
          .from('races')
          .select('id, start_time')
          .in('id', raceIds);
        if (racesOnSameDayError) throw new Error('Failed to check race dates for pigeon');
        const alreadyParticipating = racesOnSameDay?.some((r: { start_time: string }) => {
          const d = new Date(r.start_time);
          return d.toISOString().slice(0, 10) === targetDay;
        });
        if (alreadyParticipating) {
          throw new Error('This pigeon is already participating in a race on this day.');
        }
      }
    }

    // 2. Proceed with normal join logic
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();
    const { data: race } = await supabase
      .from('races')
      .select('entry_fee')
      .eq('id', raceId)
      .single();
    if (!user || !race) throw new Error('User or race not found');
    if (user.balance < race.entry_fee) throw new Error('Insufficient balance');
    await supabase
      .from('users')
      .update({ balance: user.balance - race.entry_fee })
      .eq('id', userId);
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'race_entry',
        amount: -race.entry_fee,
        description: `Race entry fee`,
        related_id: raceId
      });
    const { data, error } = await supabase
      .from('race_participants')
      .insert({
        race_id: raceId,
        pigeon_id: pigeonId,
        user_id: userId
      })
      .select()
      .single();
    if (error) throw error;
    return validateRaceParticipant(data);
  },

  /**
   * Simulate race results, update participants, and award prizes. Validates all data with zod.
   */
  async simulateRace(raceId: string): Promise<Array<Record<string, unknown>>> {
    const { data: participants } = await supabase
      .from('race_participants')
      .select(`
        *,
        pigeons (*)
      `)
      .eq('race_id', raceId);
    if (!participants) return [];
    z.array(raceParticipantSchema).parse(participants);
    participants.forEach((p: Record<string, unknown>) => {
      if (p.pigeons) pigeonSchema.parse(p.pigeons);
    });
    const results = participants.map((participant: Record<string, unknown>) => {
      const pigeon = participant.pigeons;
      if (!isPigeonStats(pigeon)) return participant;
      const {
        speed,
        endurance,
        sky_iq,
        aerodynamics,
        wing_power,
        flapacity,
      } = pigeon as PigeonStats;
      // Type guard, destructuring, and explicit Number() ensure type safety for pigeon stats (see PRO_CODING_GUIDELINES.md)
      const perf = Number(
        Number(speed) * 0.3 +
        Number(endurance) * 0.2 +
        Number(sky_iq) * 0.15 +
        Number(aerodynamics) * 0.15 +
        Number(wing_power) * 0.1 +
        Number(flapacity) * 0.1
      );
      const performance = perf / 100;
      const randomFactor = 0.8 + Math.random() * 0.4;
      const finishTime = performance > 0 ? (100 / performance) * randomFactor : 0;
      return {
        ...participant,
        finish_time: parseFloat(finishTime.toFixed(2)),
        finish_position: 0
      };
    });
    results.sort((a, b) => (Number(a.finish_time) || 0) - (Number(b.finish_time) || 0));
    results.forEach((result, index) => {
      result.finish_position = index + 1;
    });
    for (const result of results) {
      await supabase
        .from('race_participants')
        .update({
          finish_time: result.finish_time,
          finish_position: result.finish_position
        })
        .eq('id', result.id);
    }
    const { data: race } = await supabase
      .from('races')
      .select('prize_pool')
      .eq('id', raceId)
      .single();
    if (race) {
      const prizes = [race.prize_pool * 0.5, race.prize_pool * 0.3, race.prize_pool * 0.2];
      for (let i = 0; i < Math.min(3, results.length); i++) {
        const participant = results[i];
        const prize = Math.floor(prizes[i]);
        await supabase
          .from('users')
          .update({ 
            balance: supabase.rpc('increment', { 
              row: { id: participant.user_id }, 
              amount: prize 
            })
          })
          .eq('id', participant.user_id);
        await supabase
          .from('race_participants')
          .update({ prize_won: prize })
          .eq('id', participant.id);
        await supabase
          .from('transactions')
          .insert({
            user_id: participant.user_id,
            type: 'race_win',
            amount: prize,
            description: `Race prize - ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'} place`,
            related_id: raceId
          });
      }
    }
    await supabase
      .from('races')
      .update({ status: 'completed' })
      .eq('id', raceId);
    return results;
  }
}; 