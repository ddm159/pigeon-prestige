import { z } from 'zod';

/**
 * League zod schema
 */
export const leagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['pro', '2a', '2b', 'international']),
  is_active: z.boolean(),
  created_at: z.string(),
});

/**
 * Season zod schema
 */
export const seasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
});

/**
 * LeagueAssignment zod schema
 */
export const leagueAssignmentSchema = z.object({
  user_id: z.string(),
  league_id: z.string(),
  season_id: z.string(),
  joined_at: z.string(),
  is_ai: z.boolean(),
  last_active: z.string().nullable(),
});

/**
 * Standing zod schema
 */
export const standingSchema = z.object({
  user_id: z.string(),
  league_id: z.string(),
  season_id: z.string(),
  points: z.number(),
  position: z.number().nullable(),
  tiebreaker_points: z.number(),
  updated_at: z.string(),
});

/**
 * AIName zod schema
 */
export const aiNameSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type League = z.infer<typeof leagueSchema>;
export type Season = z.infer<typeof seasonSchema>;
export type LeagueAssignment = z.infer<typeof leagueAssignmentSchema>;
export type Standing = z.infer<typeof standingSchema>;
export type AIName = z.infer<typeof aiNameSchema>; 