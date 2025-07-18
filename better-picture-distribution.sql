-- Better picture number distribution using deterministic approach
-- This ensures we get better coverage across the full range

-- Update picture numbers using a more deterministic approach
-- This uses the hash of the pigeon ID to ensure better distribution
UPDATE pigeons 
SET picture_number = CASE 
  WHEN gender = 'male' THEN (abs(hash(pigeons.id::text)) % 50) + 1
  WHEN gender = 'female' THEN (abs(hash(pigeons.id::text)) % 50) + 51
  ELSE 1
END;

-- Verify the distribution
SELECT 
  gender, 
  COUNT(*) as count,
  MIN(picture_number) as min_picture,
  MAX(picture_number) as max_picture,
  AVG(picture_number) as avg_picture
FROM pigeons 
GROUP BY gender;

-- Show detailed distribution
SELECT 
  gender,
  CASE 
    WHEN picture_number BETWEEN 1 AND 10 THEN '1-10'
    WHEN picture_number BETWEEN 11 AND 20 THEN '11-20'
    WHEN picture_number BETWEEN 21 AND 30 THEN '21-30'
    WHEN picture_number BETWEEN 31 AND 40 THEN '31-40'
    WHEN picture_number BETWEEN 41 AND 50 THEN '41-50'
    WHEN picture_number BETWEEN 51 AND 60 THEN '51-60'
    WHEN picture_number BETWEEN 61 AND 70 THEN '61-70'
    WHEN picture_number BETWEEN 71 AND 80 THEN '71-80'
    WHEN picture_number BETWEEN 81 AND 90 THEN '81-90'
    WHEN picture_number BETWEEN 91 AND 100 THEN '91-100'
  END as picture_range,
  COUNT(*) as count
FROM pigeons 
GROUP BY gender, picture_range
ORDER BY gender, picture_range; 