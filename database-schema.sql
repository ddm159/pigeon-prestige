-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE pigeon_status AS ENUM ('active', 'injured', 'retired', 'deceased');
CREATE TYPE player_type AS ENUM ('human', 'ai');

-- Game settings table (for admin-configurable settings)
CREATE TABLE game_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    player_type player_type DEFAULT 'human',
    balance INTEGER DEFAULT 1000,
    total_pigeons INTEGER DEFAULT 0,
    pigeon_cap INTEGER DEFAULT 50, -- Configurable pigeon limit
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pigeons table
CREATE TABLE pigeons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    gender gender_type NOT NULL,
    age_years INTEGER DEFAULT 0,
    age_months INTEGER DEFAULT 0,
    age_days INTEGER DEFAULT 0,
    status pigeon_status DEFAULT 'active',
    
    -- Stats (40-100 range)
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
    
    -- Peak stats (40-100 range)
    peak_speed INTEGER NOT NULL,
    peak_endurance INTEGER NOT NULL,
    peak_sky_iq INTEGER NOT NULL,
    peak_aerodynamics INTEGER NOT NULL,
    peak_vision INTEGER NOT NULL,
    peak_wing_power INTEGER NOT NULL,
    peak_flapacity INTEGER NOT NULL,
    peak_vanity INTEGER NOT NULL,
    peak_strength INTEGER NOT NULL,
    peak_aggression INTEGER NOT NULL,
    peak_landing INTEGER NOT NULL,
    peak_loyalty INTEGER NOT NULL,
    peak_health INTEGER NOT NULL,
    peak_happiness INTEGER NOT NULL,
    peak_fertility INTEGER NOT NULL,
    peak_disease_resistance INTEGER NOT NULL,
    
    -- Hidden stats
    eggs INTEGER NOT NULL,
    offspring INTEGER NOT NULL,
    breeding_quality INTEGER NOT NULL,
    adaptability INTEGER NOT NULL,
    recovery_rate INTEGER NOT NULL,
    laser_focus INTEGER NOT NULL,
    morale INTEGER NOT NULL,
    food INTEGER NOT NULL,
    
    -- Hidden peak stats
    peak_eggs INTEGER NOT NULL,
    peak_offspring INTEGER NOT NULL,
    peak_breeding_quality INTEGER NOT NULL,
    peak_adaptability INTEGER NOT NULL,
    peak_recovery_rate INTEGER NOT NULL,
    peak_laser_focus INTEGER NOT NULL,
    peak_morale INTEGER NOT NULL,
    peak_food INTEGER NOT NULL,
    
    -- Racing stats
    races_won INTEGER DEFAULT 0,
    races_lost INTEGER DEFAULT 0,
    total_races INTEGER DEFAULT 0,
    best_time DECIMAL(10,2),
    total_distance DECIMAL(10,2) DEFAULT 0,
    
    -- Breeding stats
    offspring_produced INTEGER DEFAULT 0,
    successful_breedings INTEGER DEFAULT 0,
    
    -- Picture number for pigeon images (1-50 for males, 51-100 for females)
    picture_number INTEGER NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Races table
CREATE TABLE races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    entry_fee INTEGER NOT NULL,
    prize_pool INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Race participants table
CREATE TABLE race_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES races(id) ON DELETE CASCADE NOT NULL,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    finish_time DECIMAL(10,2),
    finish_position INTEGER,
    prize_won INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, pigeon_id)
);

-- Breeding pairs table
CREATE TABLE breeding_pairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    male_pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    female_pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    eggs_produced INTEGER DEFAULT 0,
    offspring_produced INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market listings table
CREATE TABLE market_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    price INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'race_win', 'race_entry', 'market_sale', 'market_purchase', etc.
    amount INTEGER NOT NULL,
    description TEXT,
    related_id UUID, -- ID of related record (race, pigeon, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pigeon Groups (for saved pigeon selections)
CREATE TABLE IF NOT EXISTS pigeon_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, name)
    -- Max 20 groups per owner: enforce in app logic or with a trigger (see below)
);

CREATE TABLE IF NOT EXISTS pigeon_group_members (
    group_id UUID REFERENCES pigeon_groups(id) ON DELETE CASCADE NOT NULL,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (group_id, pigeon_id)
);

-- Optional: Enforce max 20 groups per owner with a trigger
CREATE OR REPLACE FUNCTION enforce_max_20_groups_per_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM pigeon_groups WHERE owner_id = NEW.owner_id) >= 20 THEN
        RAISE EXCEPTION 'You can only have up to 20 pigeon groups.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_max_20_groups_per_owner ON pigeon_groups;
CREATE TRIGGER trg_max_20_groups_per_owner
    BEFORE INSERT ON pigeon_groups
    FOR EACH ROW EXECUTE FUNCTION enforce_max_20_groups_per_owner();

-- Create indexes for better performance
CREATE INDEX idx_pigeons_owner_id ON pigeons(owner_id);
CREATE INDEX idx_pigeons_status ON pigeons(status);
CREATE INDEX idx_race_participants_race_id ON race_participants(race_id);
CREATE INDEX idx_race_participants_user_id ON race_participants(user_id);
CREATE INDEX idx_breeding_pairs_owner_id ON breeding_pairs(owner_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_users_player_type ON users(player_type);

-- Enable Row Level Security
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pigeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Game settings - only admins can modify, everyone can view
CREATE POLICY "Anyone can view game settings" ON game_settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify game settings" ON game_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.username = 'admin'
        )
    );

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own pigeons
CREATE POLICY "Users can view own pigeons" ON pigeons
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pigeons" ON pigeons
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pigeons" ON pigeons
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pigeons" ON pigeons
    FOR DELETE USING (auth.uid() = owner_id);

-- Anyone can view races
CREATE POLICY "Anyone can view races" ON races
    FOR SELECT USING (true);

-- Users can only see their own race participants
CREATE POLICY "Users can view own race participants" ON race_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own race participants" ON race_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own breeding pairs
CREATE POLICY "Users can view own breeding pairs" ON breeding_pairs
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own breeding pairs" ON breeding_pairs
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own breeding pairs" ON breeding_pairs
    FOR UPDATE USING (auth.uid() = owner_id);

-- Anyone can view market listings
CREATE POLICY "Anyone can view market listings" ON market_listings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own market listings" ON market_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own market listings" ON market_listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own market listings" ON market_listings
    FOR DELETE USING (auth.uid() = seller_id);

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pigeon Groups RLS Policies
ALTER TABLE pigeon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pigeon_group_members ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pigeon groups
CREATE POLICY "Users can view own pigeon groups" ON pigeon_groups
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pigeon groups" ON pigeon_groups
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pigeon groups" ON pigeon_groups
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pigeon groups" ON pigeon_groups
    FOR DELETE USING (auth.uid() = owner_id);

-- Users can only see pigeon group members for groups they own
CREATE POLICY "Users can view own pigeon group members" ON pigeon_group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pigeon_groups 
            WHERE pigeon_groups.id = pigeon_group_members.group_id 
            AND pigeon_groups.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own pigeon group members" ON pigeon_group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pigeon_groups 
            WHERE pigeon_groups.id = pigeon_group_members.group_id 
            AND pigeon_groups.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own pigeon group members" ON pigeon_group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pigeon_groups 
            WHERE pigeon_groups.id = pigeon_group_members.group_id 
            AND pigeon_groups.owner_id = auth.uid()
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pigeons_updated_at BEFORE UPDATE ON pigeons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_settings_updated_at BEFORE UPDATE ON game_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', 'User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to apply pigeon cap penalties
CREATE OR REPLACE FUNCTION apply_pigeon_cap_penalties()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    pigeon_count INTEGER;
BEGIN
    -- Loop through all users
    FOR user_record IN SELECT id, pigeon_cap FROM users WHERE player_type = 'human'
    LOOP
        -- Count user's active pigeons
        SELECT COUNT(*) INTO pigeon_count 
        FROM pigeons 
        WHERE owner_id = user_record.id AND status = 'active';
        
        -- If user exceeds pigeon cap, apply health penalty to all pigeons
        IF pigeon_count > user_record.pigeon_cap THEN
            UPDATE pigeons 
            SET health = GREATEST(health - 5, 0) -- Reduce health by 5, minimum 0
            WHERE owner_id = user_record.id AND status = 'active';
            
            -- Log the penalty
            INSERT INTO transactions (user_id, type, amount, description)
            VALUES (user_record.id, 'pigeon_cap_penalty', -5, 
                   'Health penalty for exceeding pigeon cap (' || pigeon_count || '/' || user_record.pigeon_cap || ')');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default game settings
INSERT INTO game_settings (setting_key, setting_value, description) VALUES
('default_pigeon_cap', '50', 'Default pigeon cap for new users'),
('ai_pigeon_cap', '50', 'Pigeon cap for AI players'),
('health_penalty_amount', '5', 'Health penalty for exceeding pigeon cap'),
('penalty_check_interval_hours', '24', 'How often to check for pigeon cap penalties (in hours)');

-- Create a scheduled job to run pigeon cap penalties (this would need to be set up with pg_cron or similar)
-- For now, this function can be called manually or via API 

-- MIGRATION: Change all pigeon stat columns to NUMERIC(6,2) for fractional stats
ALTER TABLE pigeons
  ALTER COLUMN speed TYPE NUMERIC(6,2),
  ALTER COLUMN endurance TYPE NUMERIC(6,2),
  ALTER COLUMN sky_iq TYPE NUMERIC(6,2),
  ALTER COLUMN aerodynamics TYPE NUMERIC(6,2),
  ALTER COLUMN vision TYPE NUMERIC(6,2),
  ALTER COLUMN wing_power TYPE NUMERIC(6,2),
  ALTER COLUMN flapacity TYPE NUMERIC(6,2),
  ALTER COLUMN vanity TYPE NUMERIC(6,2),
  ALTER COLUMN strength TYPE NUMERIC(6,2),
  ALTER COLUMN aggression TYPE NUMERIC(6,2),
  ALTER COLUMN landing TYPE NUMERIC(6,2),
  ALTER COLUMN loyalty TYPE NUMERIC(6,2),
  ALTER COLUMN health TYPE NUMERIC(6,2),
  ALTER COLUMN happiness TYPE NUMERIC(6,2),
  ALTER COLUMN fertility TYPE NUMERIC(6,2),
  ALTER COLUMN disease_resistance TYPE NUMERIC(6,2),
  ALTER COLUMN peak_speed TYPE NUMERIC(6,2),
  ALTER COLUMN peak_endurance TYPE NUMERIC(6,2),
  ALTER COLUMN peak_sky_iq TYPE NUMERIC(6,2),
  ALTER COLUMN peak_aerodynamics TYPE NUMERIC(6,2),
  ALTER COLUMN peak_vision TYPE NUMERIC(6,2),
  ALTER COLUMN peak_wing_power TYPE NUMERIC(6,2),
  ALTER COLUMN peak_flapacity TYPE NUMERIC(6,2),
  ALTER COLUMN peak_vanity TYPE NUMERIC(6,2),
  ALTER COLUMN peak_strength TYPE NUMERIC(6,2),
  ALTER COLUMN peak_aggression TYPE NUMERIC(6,2),
  ALTER COLUMN peak_landing TYPE NUMERIC(6,2),
  ALTER COLUMN peak_loyalty TYPE NUMERIC(6,2),
  ALTER COLUMN peak_health TYPE NUMERIC(6,2),
  ALTER COLUMN peak_happiness TYPE NUMERIC(6,2),
  ALTER COLUMN peak_fertility TYPE NUMERIC(6,2),
  ALTER COLUMN peak_disease_resistance TYPE NUMERIC(6,2),
  ALTER COLUMN eggs TYPE NUMERIC(6,2),
  ALTER COLUMN offspring TYPE NUMERIC(6,2),
  ALTER COLUMN breeding_quality TYPE NUMERIC(6,2),
  ALTER COLUMN adaptability TYPE NUMERIC(6,2),
  ALTER COLUMN recovery_rate TYPE NUMERIC(6,2),
  ALTER COLUMN laser_focus TYPE NUMERIC(6,2),
  ALTER COLUMN morale TYPE NUMERIC(6,2),
  ALTER COLUMN food TYPE NUMERIC(6,2),
  ALTER COLUMN peak_eggs TYPE NUMERIC(6,2),
  ALTER COLUMN peak_offspring TYPE NUMERIC(6,2),
  ALTER COLUMN peak_breeding_quality TYPE NUMERIC(6,2),
  ALTER COLUMN peak_adaptability TYPE NUMERIC(6,2),
  ALTER COLUMN peak_recovery_rate TYPE NUMERIC(6,2),
  ALTER COLUMN peak_laser_focus TYPE NUMERIC(6,2),
  ALTER COLUMN peak_morale TYPE NUMERIC(6,2),
  ALTER COLUMN peak_food TYPE NUMERIC(6,2); 