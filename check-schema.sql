-- Check current schema for food system columns
-- Run this to see what columns already exist

-- Check pigeons table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pigeons' 
AND column_name IN ('current_food_mix_id', 'food_shortage_streak')
ORDER BY column_name;

-- Check pigeon_groups table structure  
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pigeon_groups' 
AND column_name = 'current_food_mix_id'
ORDER BY column_name;

-- Check pigeon_feed_history table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pigeon_feed_history' 
AND column_name = 'food_shortage'
ORDER BY column_name;

-- Check if food_mix table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'food_mix';

-- Show all columns in pigeons table (for reference)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pigeons' 
ORDER BY ordinal_position; 