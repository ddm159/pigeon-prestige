-- Add leadership and raceStart stats to all existing pigeons
-- These are hidden stats that affect group formation and departure timing

-- First, add the columns if they don't exist
ALTER TABLE pigeons 
ADD COLUMN IF NOT EXISTS leadership INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS raceStart INTEGER DEFAULT 50;

-- Update all existing pigeons with realistic random values
-- leadership: 20-80 (affects group leadership and departure timing)
-- raceStart: 20-100 (affects loitering time at start, higher = longer loitering)
UPDATE pigeons 
SET 
  leadership = 20 + (random() * 60)::INTEGER,
  raceStart = 20 + (random() * 80)::INTEGER
WHERE leadership IS NULL OR raceStart IS NULL;

-- Add some variation based on existing stats to make it more realistic
-- Pigeons with higher experience tend to have better leadership
UPDATE pigeons 
SET leadership = GREATEST(20, LEAST(80, leadership + (experience * 10)::INTEGER))
WHERE experience > 0.5;

-- Pigeons with higher aggression tend to have lower raceStart (leave earlier)
UPDATE pigeons 
SET raceStart = GREATEST(20, LEAST(100, raceStart - (aggression * 20)::INTEGER))
WHERE aggression > 0.6;

-- Add some outliers for more dramatic racing
-- A few "natural leaders" with very high leadership
UPDATE pigeons 
SET leadership = 75 + (random() * 20)::INTEGER
WHERE id IN (
  SELECT id FROM pigeons 
  WHERE experience > 0.7 AND navigation > 0.8 
  ORDER BY random() LIMIT 5
);

-- A few "late starters" with very high raceStart
UPDATE pigeons 
SET raceStart = 80 + (random() * 20)::INTEGER
WHERE id IN (
  SELECT id FROM pigeons 
  WHERE aggression < 0.4 AND focus < 0.6
  ORDER BY random() LIMIT 3
);

-- Verify the update
SELECT 
  COUNT(*) as total_pigeons,
  AVG(leadership) as avg_leadership,
  AVG(raceStart) as avg_raceStart,
  MIN(leadership) as min_leadership,
  MAX(leadership) as max_leadership,
  MIN(raceStart) as min_raceStart,
  MAX(raceStart) as max_raceStart
FROM pigeons; 