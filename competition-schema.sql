-- Competition System Database Schema
-- Phase 1: Foundation & Database Schema

-- Create competition-specific types
CREATE TYPE division_type AS ENUM ('1', '2A', '2B');
CREATE TYPE race_category AS ENUM ('global', 'regional', 'youth_global', 'youth_regional');
CREATE TYPE race_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE season_status AS ENUM ('active', 'completed', 'upcoming');
CREATE TYPE promotion_relegation_type AS ENUM ('promotion', 'relegation');

-- Divisions table
CREATE TABLE divisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    division_code division_type UNIQUE NOT NULL,
    name TEXT NOT NULL,
    max_players INTEGER DEFAULT 20,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasons table
CREATE TABLE seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status season_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Season standings table (player performance per season)
CREATE TABLE season_standings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE NOT NULL,
    total_points INTEGER DEFAULT 0,
    races_participated INTEGER DEFAULT 0,
    best_velocity DECIMAL(10,2),
    average_velocity DECIMAL(10,2),
    total_distance DECIMAL(10,2) DEFAULT 0,
    total_time DECIMAL(10,2) DEFAULT 0,
    wins INTEGER DEFAULT 0,
    top_3_finishes INTEGER DEFAULT 0,
    top_10_finishes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, user_id)
);

-- Competition races table (enhanced from existing races)
CREATE TABLE competition_races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category race_category NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    entry_fee INTEGER DEFAULT 0,
    prize_pool INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 100,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status race_status DEFAULT 'scheduled',
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    weather_conditions JSONB, -- Store weather data for race calculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Race entries table (pigeon entries in races)
CREATE TABLE race_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_automatic BOOLEAN DEFAULT false, -- True for auto-entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, pigeon_id)
);

-- Race results table (individual race outcomes)
CREATE TABLE race_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    finish_time DECIMAL(10,2),
    finish_position INTEGER,
    velocity DECIMAL(10,2), -- m/s
    velocity_kmh DECIMAL(10,2), -- km/h for display
    points_earned INTEGER DEFAULT 0,
    prize_won INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, pigeon_id)
);

-- AI Players table
CREATE TABLE ai_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE NOT NULL,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
    performance_rating DECIMAL(5,2) DEFAULT 50.00, -- AI performance modifier
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Player Pigeons table (pigeons owned by AI players)
CREATE TABLE ai_player_pigeons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ai_player_id UUID REFERENCES ai_players(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    gender gender_type NOT NULL,
    age_years INTEGER DEFAULT 0,
    age_months INTEGER DEFAULT 0,
    age_days INTEGER DEFAULT 0,
    -- Same stats as regular pigeons
    speed INTEGER NOT NULL,
    endurance INTEGER NOT NULL,
    sky_iq INTEGER NOT NULL,
    aerodynamics INTEGER NOT NULL,
    vision INTEGER NOT NULL,
    wing_power INTEGER NOT NULL,
    flapacity INTEGER NOT NULL,
    vanity INTEGER NOT NULL,
    strength INTEGER NOT NULL,
    aggression INTEGER NOT NULL,
    landing INTEGER NOT NULL,
    loyalty INTEGER NOT NULL,
    health INTEGER NOT NULL,
    happiness INTEGER NOT NULL,
    fertility INTEGER NOT NULL,
    disease_resistance INTEGER NOT NULL,
    -- Racing stats
    races_won INTEGER DEFAULT 0,
    races_lost INTEGER DEFAULT 0,
    total_races INTEGER DEFAULT 0,
    best_time DECIMAL(10,2),
    total_distance DECIMAL(10,2) DEFAULT 0,
    picture_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion/Relegation history table
CREATE TABLE promotion_relegation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ai_player_id UUID REFERENCES ai_players(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
    from_division_id UUID REFERENCES divisions(id) ON DELETE CASCADE NOT NULL,
    to_division_id UUID REFERENCES divisions(id) ON DELETE CASCADE NOT NULL,
    type promotion_relegation_type NOT NULL,
    final_standing_position INTEGER,
    final_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pre-calculated races table (complete race outcomes stored)
CREATE TABLE pre_calculated_races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    calculation_data JSONB NOT NULL, -- Store complete race calculation
    is_calculated BOOLEAN DEFAULT false,
    calculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id)
);

-- Race progress updates table (2-minute interval standings)
CREATE TABLE race_progress_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    update_interval INTEGER NOT NULL, -- Which 2-minute interval (1, 2, 3, etc.)
    standings_snapshot JSONB NOT NULL, -- Current standings at this interval
    commentary TEXT, -- LLM-generated commentary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Race commentary table (LLM-generated commentary for each update)
CREATE TABLE race_commentary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    progress_update_id UUID REFERENCES race_progress_updates(id) ON DELETE CASCADE,
    commentary_text TEXT NOT NULL,
    commentary_type TEXT DEFAULT 'update', -- 'update', 'highlight', 'final'
    llm_prompt TEXT, -- Store the prompt used for debugging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Race standings snapshots table (historical race progress data)
CREATE TABLE race_standings_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    standings_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled races table (pre-scheduled race templates)
CREATE TABLE scheduled_races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_template TEXT NOT NULL,
    category race_category NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    entry_fee INTEGER DEFAULT 0,
    prize_pool INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 100,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL, -- Time of day (e.g., 08:00)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Race automation table (automatic entry and execution rules)
CREATE TABLE race_automation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_category race_category NOT NULL,
    auto_entry_enabled BOOLEAN DEFAULT true,
    youth_age_limit_months INTEGER DEFAULT 12, -- Pigeons under this age can enter youth races
    health_requirement INTEGER DEFAULT 30, -- Minimum health required
    energy_requirement INTEGER DEFAULT 30, -- Minimum energy required
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Youth race eligibility table (age-based race participation)
CREATE TABLE youth_race_eligibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    ai_pigeon_id UUID REFERENCES ai_player_pigeons(id) ON DELETE CASCADE,
    race_id UUID REFERENCES competition_races(id) ON DELETE CASCADE NOT NULL,
    is_eligible BOOLEAN NOT NULL,
    age_at_race_months INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, COALESCE(pigeon_id, ai_pigeon_id))
);

-- Create indexes for better performance
CREATE INDEX idx_season_standings_season_id ON season_standings(season_id);
CREATE INDEX idx_season_standings_user_id ON season_standings(user_id);
CREATE INDEX idx_season_standings_division_id ON season_standings(division_id);
CREATE INDEX idx_competition_races_category ON competition_races(category);
CREATE INDEX idx_competition_races_start_time ON competition_races(start_time);
CREATE INDEX idx_competition_races_status ON competition_races(status);
CREATE INDEX idx_race_entries_race_id ON race_entries(race_id);
CREATE INDEX idx_race_entries_user_id ON race_entries(user_id);
CREATE INDEX idx_race_results_race_id ON race_results(race_id);
CREATE INDEX idx_race_results_user_id ON race_results(user_id);
CREATE INDEX idx_ai_players_division_id ON ai_players(division_id);
CREATE INDEX idx_ai_players_season_id ON ai_players(season_id);
CREATE INDEX idx_promotion_relegation_season_id ON promotion_relegation_history(season_id);
CREATE INDEX idx_pre_calculated_races_race_id ON pre_calculated_races(race_id);
CREATE INDEX idx_race_progress_updates_race_id ON race_progress_updates(race_id);
CREATE INDEX idx_scheduled_races_day_of_week ON scheduled_races(day_of_week);
CREATE INDEX idx_youth_race_eligibility_race_id ON youth_race_eligibility(race_id);

-- Enable Row Level Security
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_player_pigeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_relegation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_calculated_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_commentary ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_standings_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_race_eligibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Divisions - everyone can view
CREATE POLICY "Anyone can view divisions" ON divisions
    FOR SELECT USING (true);

-- Seasons - everyone can view
CREATE POLICY "Anyone can view seasons" ON seasons
    FOR SELECT USING (true);

-- Season standings - users can view all, but only modify their own
CREATE POLICY "Anyone can view season standings" ON season_standings
    FOR SELECT USING (true);

CREATE POLICY "Users can modify own season standings" ON season_standings
    FOR ALL USING (auth.uid() = user_id);

-- Competition races - everyone can view
CREATE POLICY "Anyone can view competition races" ON competition_races
    FOR SELECT USING (true);

-- Race entries - users can view all, but only modify their own
CREATE POLICY "Anyone can view race entries" ON race_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can modify own race entries" ON race_entries
    FOR ALL USING (auth.uid() = user_id);

-- Race results - everyone can view
CREATE POLICY "Anyone can view race results" ON race_results
    FOR SELECT USING (true);

-- AI players - everyone can view
CREATE POLICY "Anyone can view AI players" ON ai_players
    FOR SELECT USING (true);

-- AI player pigeons - everyone can view
CREATE POLICY "Anyone can view AI player pigeons" ON ai_player_pigeons
    FOR SELECT USING (true);

-- Promotion/relegation history - everyone can view
CREATE POLICY "Anyone can view promotion relegation history" ON promotion_relegation_history
    FOR SELECT USING (true);

-- Pre-calculated races - everyone can view
CREATE POLICY "Anyone can view pre-calculated races" ON pre_calculated_races
    FOR SELECT USING (true);

-- Race progress updates - everyone can view
CREATE POLICY "Anyone can view race progress updates" ON race_progress_updates
    FOR SELECT USING (true);

-- Race commentary - everyone can view
CREATE POLICY "Anyone can view race commentary" ON race_commentary
    FOR SELECT USING (true);

-- Race standings snapshots - everyone can view
CREATE POLICY "Anyone can view race standings snapshots" ON race_standings_snapshots
    FOR SELECT USING (true);

-- Scheduled races - everyone can view
CREATE POLICY "Anyone can view scheduled races" ON scheduled_races
    FOR SELECT USING (true);

-- Race automation - everyone can view
CREATE POLICY "Anyone can view race automation" ON race_automation
    FOR SELECT USING (true);

-- Youth race eligibility - everyone can view
CREATE POLICY "Anyone can view youth race eligibility" ON youth_race_eligibility
    FOR SELECT USING (true);

-- Insert initial data

-- Insert divisions
INSERT INTO divisions (division_code, name, max_players, description) VALUES
('1', 'Division 1 - Elite', 20, 'The highest tier of competition with the most skilled players'),
('2A', 'Division 2A - Intermediate', 20, 'Intermediate tier with promotion path to Division 1'),
('2B', 'Division 2B - Intermediate', 20, 'Intermediate tier with promotion path to Division 1');

-- Insert race automation rules
INSERT INTO race_automation (race_category, auto_entry_enabled, youth_age_limit_months, health_requirement, energy_requirement) VALUES
('global', true, 12, 30, 30),
('regional', true, 12, 30, 30),
('youth_global', true, 12, 30, 30),
('youth_regional', true, 12, 30, 30);

-- Insert scheduled races
INSERT INTO scheduled_races (name_template, category, distance, entry_fee, prize_pool, max_participants, day_of_week, start_time) VALUES
('Regional Race', 'regional', 100.0, 5, 500, 100, 3, '08:00'), -- Wednesday
('Regional Race', 'regional', 100.0, 5, 500, 100, 6, '08:00'), -- Saturday
('International Race', 'global', 200.0, 10, 1000, 100, 0, '08:00'), -- Sunday
('Youth Regional Race', 'youth_regional', 50.0, 0, 200, 100, 3, '08:00'), -- Wednesday
('Youth Regional Race', 'youth_regional', 50.0, 0, 200, 100, 6, '08:00'), -- Saturday
('Youth International Race', 'youth_global', 100.0, 0, 400, 100, 0, '08:00'); -- Sunday

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_season_standings_updated_at BEFORE UPDATE ON season_standings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_races_updated_at BEFORE UPDATE ON competition_races
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_players_updated_at BEFORE UPDATE ON ai_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_player_pigeons_updated_at BEFORE UPDATE ON ai_player_pigeons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_races_updated_at BEFORE UPDATE ON scheduled_races
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_automation_updated_at BEFORE UPDATE ON race_automation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 