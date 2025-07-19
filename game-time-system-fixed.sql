-- Game Time System Migration
-- Implements scheduled game time progression with 4 daily updates

-- 1. Game Time Settings Table
CREATE TABLE IF NOT EXISTS game_time_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Game Time State Table
CREATE TABLE IF NOT EXISTS game_time_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    current_game_date DATE NOT NULL DEFAULT '1900-01-01',
    last_update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_count INTEGER DEFAULT 0,
    is_paused BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Game Time Log Table (for tracking updates)
CREATE TABLE IF NOT EXISTS game_time_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_date DATE NOT NULL,
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default game time settings
INSERT INTO game_time_settings (setting_key, setting_value, description) VALUES
('game_start_date', '1900-01-01', 'The starting date of the game world'),
('update_times', '00:00,06:00,12:00,18:00', 'Times when game updates occur (24-hour format)'),
('time_zone', 'Europe/Brussels', 'Timezone for game updates (Belgium GMT+2)'),
('auto_updates_enabled', 'true', 'Whether automatic game time updates are enabled'),
('update_interval_hours', '6', 'Hours between updates (should match update_times)');

-- Insert initial game time state
INSERT INTO game_time_state (current_game_date, next_update_time) VALUES
('1900-01-01', 
 (CASE 
   WHEN EXTRACT(hour FROM NOW()) < 6 THEN DATE(NOW()) + INTERVAL '6 hours'
   WHEN EXTRACT(hour FROM NOW()) < 12 THEN DATE(NOW()) + INTERVAL '12 hours'
   WHEN EXTRACT(hour FROM NOW()) < 18 THEN DATE(NOW()) + INTERVAL '18 hours'
   ELSE DATE(NOW() + INTERVAL '1 day') + INTERVAL '0 hours'
 END)
);

-- Function to advance game time by one day
CREATE OR REPLACE FUNCTION advance_game_time()
RETURNS void AS $$
DECLARE
    current_state RECORD;
    next_update TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current game time state
    SELECT * INTO current_state FROM game_time_state ORDER BY created_at DESC LIMIT 1;
    
    -- Advance game date by one day
    UPDATE game_time_state 
    SET 
        current_game_date = current_state.current_game_date + INTERVAL '1 day',
        last_update_time = NOW(),
        update_count = current_state.update_count + 1,
        updated_at = NOW()
    WHERE id = current_state.id;
    
    -- Calculate next update time (4 updates per day)
    SELECT 
        CASE 
            WHEN EXTRACT(hour FROM NOW()) < 6 THEN DATE(NOW()) + INTERVAL '6 hours'
            WHEN EXTRACT(hour FROM NOW()) < 12 THEN DATE(NOW()) + INTERVAL '12 hours'
            WHEN EXTRACT(hour FROM NOW()) < 18 THEN DATE(NOW()) + INTERVAL '18 hours'
            ELSE DATE(NOW() + INTERVAL '1 day') + INTERVAL '0 hours'
        END INTO next_update;
    
    UPDATE game_time_state 
    SET next_update_time = next_update
    WHERE id = current_state.id;
    
    -- Log the update
    INSERT INTO game_time_log (game_date, update_type, description)
    VALUES (
        current_state.current_game_date + INTERVAL '1 day',
        'scheduled',
        'Automatic game time advancement'
    );
    
    -- Trigger game day updates (these functions should exist from previous migrations)
    -- PERFORM updatePigeonFeedingsForGameDay();
    -- PERFORM updateGroupFeedingsForGameDay();
    
    -- Apply pigeon cap penalties if needed
    -- PERFORM apply_pigeon_cap_penalties();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current game date
CREATE OR REPLACE FUNCTION get_current_game_date()
RETURNS DATE AS $$
DECLARE
    game_date DATE;
BEGIN
    SELECT current_game_date INTO game_date 
    FROM game_time_state 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RETURN COALESCE(game_date, '1900-01-01'::DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually advance game time (admin only)
CREATE OR REPLACE FUNCTION manual_advance_game_time()
RETURNS void AS $$
BEGIN
    -- Log manual update
    INSERT INTO game_time_log (game_date, update_type, description)
    VALUES (
        get_current_game_date(),
        'manual',
        'Manual game time advancement by admin'
    );
    
    -- Advance time
    PERFORM advance_game_time();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE game_time_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_time_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_time_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Game time settings - anyone can view, only admins can modify
CREATE POLICY "Anyone can view game time settings" ON game_time_settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify game time settings" ON game_time_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.username = 'admin'
        )
    );

-- Game time state - anyone can view, only system can modify
CREATE POLICY "Anyone can view game time state" ON game_time_state
    FOR SELECT USING (true);

-- Game time log - anyone can view
CREATE POLICY "Anyone can view game time log" ON game_time_log
    FOR SELECT USING (true);

-- Create trigger for updating updated_at columns
CREATE TRIGGER update_game_time_settings_updated_at BEFORE UPDATE ON game_time_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_time_state_updated_at BEFORE UPDATE ON game_time_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_time_log_date ON game_time_log(game_date);
CREATE INDEX IF NOT EXISTS idx_game_time_log_update_time ON game_time_log(update_time); 