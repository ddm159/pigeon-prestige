import { supabase } from './supabase';
import { raceSchema, raceParticipantSchema, validateRace, validateRaceParticipant } from '../types/raceSchema';
import { pigeonSchema } from '../types/pigeonSchema';
import { z } from 'zod';
import type { Race, RaceParticipant } from '../types/pigeon';

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
   */
  async joinRace(raceId: string, pigeonId: string, userId: string): Promise<RaceParticipant> {
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