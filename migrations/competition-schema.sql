-- Competition System Schema for Pigeon Prestige
-- Follows project guidelines and supports all league, AI, and race requirements

-- Seasons table: tracks each competition season
CREATE TABLE IF NOT EXISTS seasons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Leagues table: Pro, Regional 2A, Regional 2B, International, etc.
CREATE TABLE IF NOT EXISTS leagues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('pro', '2a', '2b', 'international')),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- League assignments: which user is in which league/season
CREATE TABLE IF NOT EXISTS league_assignments (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    league_id uuid REFERENCES leagues(id) ON DELETE CASCADE,
    season_id uuid REFERENCES seasons(id) ON DELETE CASCADE,
    joined_at timestamptz NOT NULL DEFAULT now(),
    is_ai boolean NOT NULL DEFAULT false,
    last_active timestamptz,
    PRIMARY KEY (user_id, league_id, season_id)
);

-- Standings: points and position for each user in a league/season
CREATE TABLE IF NOT EXISTS standings (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    league_id uuid REFERENCES leagues(id) ON DELETE CASCADE,
    season_id uuid REFERENCES seasons(id) ON DELETE CASCADE,
    points integer NOT NULL DEFAULT 0,
    position integer,
    tiebreaker_points integer NOT NULL DEFAULT 0, -- e.g., international race points
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, league_id, season_id)
);

-- AI player names pool
CREATE TABLE IF NOT EXISTS ai_names (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE
);

-- Race categories: 'all' (all pigeons), 'u1' (under 1 year)
-- Add a column to races table for category if not present
ALTER TABLE races ADD COLUMN IF NOT EXISTS race_category text NOT NULL DEFAULT 'all';
-- Valid values: 'all', 'u1'

-- Note: Retired pigeons are deleted from the pigeons table, not archived.

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_league_assignments_league ON league_assignments(league_id);
CREATE INDEX IF NOT EXISTS idx_league_assignments_user ON league_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league_id);
CREATE INDEX IF NOT EXISTS idx_standings_user ON standings(user_id);

-- RLS Policy Comments:
-- - Only allow users to see their own league_assignments, but standings are public.
-- - Admins can manage all data.
-- - AI players are managed by backend jobs/scripts.
-- - All users can view all standings and league info. 