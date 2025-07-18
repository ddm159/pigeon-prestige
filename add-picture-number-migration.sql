-- Migration to add picture_number column to existing pigeons
-- Run this in your Supabase SQL editor

-- Add picture_number column to pigeons table
ALTER TABLE pigeons ADD COLUMN IF NOT EXISTS picture_number INTEGER;

-- Update existing pigeons with random picture numbers based on gender
-- Males get 1-50, females get 51-100
UPDATE pigeons 
SET picture_number = CASE 
  WHEN gender = 'male' THEN floor(random() * 50) + 1
  WHEN gender = 'female' THEN floor(random() * 50) + 51
  ELSE 1
END
WHERE picture_number IS NULL;

-- Make the column NOT NULL after populating it
ALTER TABLE pigeons ALTER COLUMN picture_number SET NOT NULL;

-- Verify the update
SELECT 
  gender, 
  COUNT(*) as count,
  MIN(picture_number) as min_picture,
  MAX(picture_number) as max_picture
FROM pigeons 
GROUP BY gender; 