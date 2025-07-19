-- Migration to add temperature column to weather_forecast table
-- This will update existing data and add the temperature column

-- Add temperature column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weather_forecast' 
        AND column_name = 'temperature'
    ) THEN
        ALTER TABLE weather_forecast ADD COLUMN temperature DECIMAL(3,1);
    END IF;
END $$;

-- Add check constraint for temperature range
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'weather_forecast_temperature_check'
    ) THEN
        ALTER TABLE weather_forecast ADD CONSTRAINT weather_forecast_temperature_check 
        CHECK (temperature >= -5 AND temperature <= 40);
    END IF;
END $$;

-- Update existing records with generated temperature data
-- This will generate realistic temperatures for existing weather records
UPDATE weather_forecast 
SET temperature = (
    CASE 
        WHEN EXTRACT(MONTH FROM date::date) IN (12, 1, 2) THEN -- Winter
            -2 + (RANDOM() * 9) -- -2 to 7
        WHEN EXTRACT(MONTH FROM date::date) IN (3, 4, 5) THEN -- Spring
            8 + (RANDOM() * 17) -- 8 to 25
        WHEN EXTRACT(MONTH FROM date::date) IN (6, 7, 8) THEN -- Summer
            25 + (RANDOM() * 10) -- 25 to 35
        ELSE -- Autumn
            8 + (RANDOM() * 12) -- 8 to 20
    END
)
WHERE temperature IS NULL;

-- Make temperature column NOT NULL after populating data
ALTER TABLE weather_forecast ALTER COLUMN temperature SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN weather_forecast.temperature IS 'Temperature in Celsius (-5 to 40)'; 