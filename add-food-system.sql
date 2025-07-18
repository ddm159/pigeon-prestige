-- Food System Migration for Pigeon Racing Game
-- Adds foods, user_food_inventory, food_mix, group_feedings, pigeon_feed_history tables

-- 1. Foods Table
CREATE TABLE IF NOT EXISTS foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price INTEGER NOT NULL CHECK (price >= 0),
    description TEXT,
    best_for TEXT,
    effect_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Food Inventory
CREATE TABLE IF NOT EXISTS user_food_inventory (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (user_id, food_id)
);

-- 3. Food Mixes (Saved Recipes)
CREATE TABLE IF NOT EXISTS food_mix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    mix_json JSONB NOT NULL, -- { food_id: percent, ... }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 4. Group Feedings (Applied Mixes to Groups)
CREATE TABLE IF NOT EXISTS group_feedings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES pigeon_groups(id) ON DELETE CASCADE NOT NULL,
    food_mix_id UUID REFERENCES food_mix(id) ON DELETE CASCADE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Pigeon Feed History (Per-Pigeon Applied Mixes)
CREATE TABLE IF NOT EXISTS pigeon_feed_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pigeon_id UUID REFERENCES pigeons(id) ON DELETE CASCADE NOT NULL,
    food_mix_id UUID REFERENCES food_mix(id) ON DELETE SET NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    group_id UUID REFERENCES pigeon_groups(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_food_inventory_user_id ON user_food_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_food_inventory_food_id ON user_food_inventory(food_id);
CREATE INDEX IF NOT EXISTS idx_food_mix_user_id ON food_mix(user_id);
CREATE INDEX IF NOT EXISTS idx_group_feedings_group_id ON group_feedings(group_id);
CREATE INDEX IF NOT EXISTS idx_pigeon_feed_history_pigeon_id ON pigeon_feed_history(pigeon_id);

-- Enable Row Level Security
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pigeon_feed_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Foods: anyone can view, only admins can insert/update/delete
CREATE POLICY "Anyone can view foods" ON foods FOR SELECT USING (true);
CREATE POLICY "Only admins can modify foods" ON foods FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.username = 'admin')
);

-- User Food Inventory: users can view/modify their own
CREATE POLICY "Users can view own food inventory" ON user_food_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify own food inventory" ON user_food_inventory FOR ALL USING (auth.uid() = user_id);

-- Food Mix: users can view/modify their own
CREATE POLICY "Users can view own food mixes" ON food_mix FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify own food mixes" ON food_mix FOR ALL USING (auth.uid() = user_id);

-- Group Feedings: users can view/modify for their groups
CREATE POLICY "Users can view own group feedings" ON group_feedings FOR SELECT USING (
    EXISTS (SELECT 1 FROM pigeon_groups WHERE pigeon_groups.id = group_feedings.group_id AND pigeon_groups.owner_id = auth.uid())
);
CREATE POLICY "Users can modify own group feedings" ON group_feedings FOR ALL USING (
    EXISTS (SELECT 1 FROM pigeon_groups WHERE pigeon_groups.id = group_feedings.group_id AND pigeon_groups.owner_id = auth.uid())
);

-- Pigeon Feed History: users can view for their pigeons
CREATE POLICY "Users can view own pigeon feed history" ON pigeon_feed_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM pigeons WHERE pigeons.id = pigeon_feed_history.pigeon_id AND pigeons.owner_id = auth.uid())
);
-- Only system/game logic can insert (handled by backend, not exposed to client)

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_mix_updated_at BEFORE UPDATE ON food_mix
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 