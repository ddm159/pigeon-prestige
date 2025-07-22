import { z } from 'zod';

export const raceSchema = z.object({
  id: z.string(),
  name: z.string(),
  distance: z.number(),
  entry_fee: z.number(),
  prize_pool: z.number(),
  max_participants: z.number(),
  start_time: z.string(),
  status: z.string(),
  created_at: z.string(),
});

export const raceParticipantSchema = z.object({
  id: z.string(),
  race_id: z.string(),
  pigeon_id: z.string(),
  user_id: z.string(),
  finish_time: z.number().nullable(),
  finish_position: z.number().nullable(),
  prize_won: z.number(),
  created_at: z.string(),
});

export type RaceFromSchema = z.infer<typeof raceSchema>;
export type RaceParticipantFromSchema = z.infer<typeof raceParticipantSchema>;

export function validateRace(data: unknown): RaceFromSchema {
  return raceSchema.parse(data);
}

export function validateRaceParticipant(data: unknown): RaceParticipantFromSchema {
  return raceParticipantSchema.parse(data);
} 