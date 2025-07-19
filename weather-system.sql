-- Weather system migration for pigeon racing game
-- This creates the weather forecast table and related functionality

-- Create weather type enum
CREATE TYPE weather_type AS ENUM ('sunny', 'rainy', 'windy', 'foggy', 'stormy', 'cloudy');

-- Create weather forecast table
CREATE TABLE weather_forecast (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    weather_type weather_type NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 100),
    temperature DECIMAL(3,1) NOT NULL CHECK (temperature >= -5 AND temperature <= 40),
    is_night BOOLEAN NOT NULL DEFAULT false,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for fast lookups
CREATE INDEX idx_weather_forecast_date ON weather_forecast(date);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_weather_forecast_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_weather_forecast_updated_at
    BEFORE UPDATE ON weather_forecast
    FOR EACH ROW
    EXECUTE FUNCTION update_weather_forecast_updated_at();

-- Add comments for documentation
COMMENT ON TABLE weather_forecast IS 'Stores weather forecasts for the pigeon racing game';
COMMENT ON COLUMN weather_forecast.date IS 'Date of the forecast (YYYY-MM-DD)';
COMMENT ON COLUMN weather_forecast.weather_type IS 'Type of weather condition';
COMMENT ON COLUMN weather_forecast.severity IS 'Severity level from 1-100 (higher = more rare/severe)';
COMMENT ON COLUMN weather_forecast.temperature IS 'Temperature in Celsius (-5 to 40)';
COMMENT ON COLUMN weather_forecast.is_night IS 'Whether it is night time (20:00-07:00)'; 