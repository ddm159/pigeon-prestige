-- =========================
-- 1. Drop All Unwanted Tables (except players, pigeons, users)
-- =========================
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN ('players', 'pigeons', 'users')
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
END $$;

-- =========================
-- 2. Create Enums (if needed)
-- =========================
DO $$ BEGIN
  CREATE TYPE league_tier AS ENUM ('pro', 'second-division');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE race_type AS ENUM ('regional', 'international');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE age_group AS ENUM ('all', 'under-1-year');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =========================
-- 3. Create Competition Tables
-- =========================
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier league_tier NOT NULL,
    season INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    personality TEXT NOT NULL,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS league_assignments (
    player_id UUID REFERENCES players(id),
    league_id UUID REFERENCES leagues(id),
    season INTEGER NOT NULL,
    PRIMARY KEY (player_id, season)
);

CREATE TABLE IF NOT EXISTS races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type race_type NOT NULL,
    date DATE NOT NULL,
    league_id UUID REFERENCES leagues(id),
    age_group age_group NOT NULL,
    season INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS race_entries (
    race_id UUID REFERENCES races(id),
    pigeon_id UUID NOT NULL,
    player_id UUID REFERENCES players(id),
    PRIMARY KEY (race_id, pigeon_id)
);

CREATE TABLE IF NOT EXISTS race_results (
    race_id UUID REFERENCES races(id),
    pigeon_id UUID NOT NULL,
    player_id UUID REFERENCES players(id),
    position INTEGER NOT NULL,
    points INTEGER NOT NULL,
    PRIMARY KEY (race_id, pigeon_id)
);

CREATE TABLE IF NOT EXISTS season_standings (
    player_id UUID REFERENCES players(id),
    league_id UUID REFERENCES leagues(id),
    season INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    international_points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, league_id, season)
); 