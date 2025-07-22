-- Competition System Schema for Pigeon Racing Game
-- All tables are normalized and documented for maintainability and scalability

-- League tiers and race types as enums
CREATE TYPE league_tier AS ENUM ('pro', 'second-division');
CREATE TYPE race_type AS ENUM ('regional', 'international');
CREATE TYPE age_group AS ENUM ('all', 'under-1-year');

-- Leagues table
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier league_tier NOT NULL,
    season INTEGER NOT NULL
);

-- AI profiles table
CREATE TABLE ai_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    personality TEXT NOT NULL,
    avatar_url TEXT
);

-- Players table (human or AI)
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- present if human
    is_human BOOLEAN NOT NULL,
    ai_profile_id UUID, -- present if AI
    username TEXT NOT NULL,
    last_active TIMESTAMPTZ NOT NULL,
    league_id UUID REFERENCES leagues(id)
);

-- League assignments (tracks which player is in which league for which season)
CREATE TABLE league_assignments (
    player_id UUID REFERENCES players(id),
    league_id UUID REFERENCES leagues(id),
    season INTEGER NOT NULL,
    PRIMARY KEY (player_id, season)
);

-- Races table
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type race_type NOT NULL,
    date DATE NOT NULL,
    league_id UUID REFERENCES leagues(id),
    age_group age_group NOT NULL,
    season INTEGER NOT NULL
);

-- Race entries (which pigeon is entered in which race)
CREATE TABLE race_entries (
    race_id UUID REFERENCES races(id),
    pigeon_id UUID NOT NULL,
    player_id UUID REFERENCES players(id),
    PRIMARY KEY (race_id, pigeon_id)
);

-- Race results
CREATE TABLE race_results (
    race_id UUID REFERENCES races(id),
    pigeon_id UUID NOT NULL,
    player_id UUID REFERENCES players(id),
    position INTEGER NOT NULL,
    points INTEGER NOT NULL,
    PRIMARY KEY (race_id, pigeon_id)
);

-- Season standings
CREATE TABLE season_standings (
    player_id UUID REFERENCES players(id),
    league_id UUID REFERENCES leagues(id),
    season INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    international_points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, league_id, season)
); 