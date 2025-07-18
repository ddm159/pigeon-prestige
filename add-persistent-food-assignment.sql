-- Persistent Food Assignment and Health Penalty Migration
-- Adds current_food_mix_id to pigeons and pigeon_groups tables
-- Adds food_shortage_streak to pigeons table for health penalty tracking
-- Adds food_shortage field to pigeon_feed_history for tracking shortages

-- 1. Add current_food_mix_id to pigeons table
ALTER TABLE pigeons 
ADD COLUMN IF NOT EXISTS current_food_mix_id UUID REFERENCES food_mix(id) ON DELETE SET NULL;

-- 2. Add current_food_mix_id to pigeon_groups table  
ALTER TABLE pigeon_groups 
ADD COLUMN IF NOT EXISTS current_food_mix_id UUID REFERENCES food_mix(id) ON DELETE SET NULL;

-- 3. Add food_shortage_streak to pigeons table for tracking consecutive days without food
ALTER TABLE pigeons 
ADD COLUMN IF NOT EXISTS food_shortage_streak INTEGER DEFAULT 0 CHECK (food_shortage_streak >= 0);

-- 4. Add food_shortage field to pigeon_feed_history for tracking when food was insufficient
ALTER TABLE pigeon_feed_history 
ADD COLUMN IF NOT EXISTS food_shortage BOOLEAN DEFAULT FALSE;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pigeons_current_food_mix_id ON pigeons(current_food_mix_id);
CREATE INDEX IF NOT EXISTS idx_pigeon_groups_current_food_mix_id ON pigeon_groups(current_food_mix_id);
CREATE INDEX IF NOT EXISTS idx_pigeons_food_shortage_streak ON pigeons(food_shortage_streak);
CREATE INDEX IF NOT EXISTS idx_pigeon_feed_history_food_shortage ON pigeon_feed_history(food_shortage);

-- 6. Add comments for documentation
COMMENT ON COLUMN pigeons.current_food_mix_id IS 'Persistent food mix assignment - remains until changed';
COMMENT ON COLUMN pigeon_groups.current_food_mix_id IS 'Persistent food mix assignment for the entire group';
COMMENT ON COLUMN pigeons.food_shortage_streak IS 'Consecutive days without sufficient food (0 = no shortage, 1+ = shortage days)';
COMMENT ON COLUMN pigeon_feed_history.food_shortage IS 'Whether this feeding had insufficient food (health penalty applied)'; 