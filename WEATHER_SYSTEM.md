# Weather System Documentation

## Overview

The weather system is a core feature of the pigeon racing game that simulates realistic weather conditions that affect racing performance. The system generates weather forecasts for 7 days and updates **only once daily at 20:00 (8 PM)**. Weather conditions remain constant throughout each day, with only the day/night cycle changing in real-time.

## Features

### Weather Types
- **☀️ Sunny** (30% chance) - Optimal racing conditions
- **🌧️ Rainy** (20% chance) - Reduces speed and visibility
- **💨 Windy** (20% chance) - Affects flight stability and speed
- **🌫️ Foggy** (10% chance) - Severely impacts navigation and visibility
- **⛈️ Stormy** (10% chance) - Most challenging conditions
- **☁️ Cloudy** (10% chance) - Mild impact on performance

### Temperature System
Seasonal temperatures following Belgian climate patterns:
- **Winter** (Dec-Feb): -2°C to 7°C
- **Spring** (Mar-May): 8°C to 25°C
- **Summer** (Jun-Aug): 25°C to 35°C
- **Autumn** (Sep-Nov): 8°C to 20°C

**Features:**
- Realistic day-to-day temperature variations (max 5°C change per day)
- Seasonal progression following real Belgian climate
- Temperature affects racing performance (extreme temperatures impact pigeons)

### Severity System
Each weather type has a severity level from 1-100:
- **1-30**: Common, mild conditions
- **31-60**: Moderate conditions
- **61-80**: Rare, severe conditions
- **81-100**: Very rare, extreme conditions

**Higher numbers = more rare and impactful conditions**
**Lower numbers = more common and mild conditions**

### Day/Night Cycle
- **Day time**: 07:00 (7 AM) to 20:00 (8 PM)
- **Night time**: 20:00 (8 PM) to 07:00 (7 AM)
- Updates in real-time based on the user's local time
- **Weather conditions remain constant** throughout each day, only day/night indicators change

## Architecture

### Components

#### 1. Types (`src/types/weather.ts`)
- `WeatherType` - Enum for weather conditions
- `WeatherForecast` - Database model for weather data
- `WeatherDisplay` - UI-friendly weather representation
- `DayNightCycle` - Day/night state information
- `WEATHER_CONFIGS` - Configuration for each weather type
- `WEATHER_TRANSITIONS` - Probability matrix for weather changes

#### 2. Service (`src/services/weatherService.ts`)
- `WeatherService` class with all business logic
- Weather generation algorithms
- Database operations
- Day/night cycle calculations
- Weather impact multipliers for racing

#### 3. Hook (`src/hooks/useWeather.ts`)
- `useWeather` custom hook for React components
- State management for weather data
- Automatic updates and refresh functionality
- Error handling and loading states

#### 4. UI Components
- `WeatherWidget` - Main weather display component
- `CurrentWeatherDisplay` - Current weather with severity
- `WeeklyForecast` - 7-day forecast carousel

### Database Schema

```sql
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
```

## Usage

### Basic Implementation

```tsx
import { useWeather } from '../hooks/useWeather';
import WeatherWidget from '../components/WeatherWidget';

const MyComponent = () => {
  const { currentWeather, weeklyForecast, loading, error } = useWeather();
  
  return <WeatherWidget />;
};
```

### Getting Weather Impact for Racing

```tsx
import { useWeather } from '../hooks/useWeather';

const RacingComponent = () => {
  const { getWeatherImpactMultiplier } = useWeather();
  
  const calculateRaceSpeed = (baseSpeed: number) => {
    const weatherMultiplier = getWeatherImpactMultiplier();
    return baseSpeed * weatherMultiplier;
  };
};
```

### Manual Weather Refresh

```tsx
import { useWeather } from '../hooks/useWeather';

const WeatherControl = () => {
  const { refreshWeather } = useWeather();
  
  const handleRefresh = () => {
    refreshWeather();
  };
  
  return <button onClick={handleRefresh}>Refresh Weather</button>;
};
```

## Weather Generation Algorithm

### Realistic Transitions
The system uses a transition matrix to ensure realistic weather changes:

- **Sunny → Sunny**: 60% chance
- **Sunny → Cloudy**: 25% chance
- **Sunny → Rainy**: 5% chance
- **Sunny → Windy**: 5% chance
- **Sunny → Foggy**: 2% chance
- **Sunny → Stormy**: 3% chance

Similar probabilities exist for all weather types, ensuring gradual changes rather than dramatic swings.

### Severity Generation
All weather types use the full 1-100 severity range with weighted distribution:
- **1-30**: Very common (most weather conditions)
- **31-60**: Common to moderate
- **61-80**: Rare conditions
- **81-100**: Very rare, extreme conditions

**Distribution**: Uses exponential weighting where higher numbers are exponentially less likely to occur. A stormy day is much more likely to be 20% severe than 90% severe.

### Temperature Generation
Temperatures follow seasonal patterns with realistic day-to-day variations:
- **Seasonal Ranges**: Based on real Belgian climate data
- **Daily Variation**: Maximum 5°C change between consecutive days
- **Progression**: Temperatures gradually change following seasonal trends
- **Realistic Bounds**: All temperatures stay within -5°C to 40°C range

## Racing Impact

Weather conditions affect pigeon racing performance through multipliers:

- **Sunny**: +0.03% to +30% (higher severity = better conditions)
- **Cloudy**: -0.15% to -15% (higher severity = worse conditions)
- **Rainy**: -0.1% to -40% (higher severity = worse conditions)
- **Windy**: -0.105% to -35% (higher severity = worse conditions)
- **Foggy**: -0.3% to -60% (higher severity = worse conditions)
- **Stormy**: -0.49% to -70% (higher severity = worse conditions)

**Note**: Since severity now uses full 1-100 range, impact ranges are much wider.

## Testing

The weather system includes comprehensive tests:

- **Service Tests**: `src/services/__tests__/weatherService.test.ts`
- **Hook Tests**: `src/hooks/__tests__/useWeather.test.tsx`
- **Component Tests**: `src/components/__tests__/WeatherWidget.test.tsx`

Run tests with:
```bash
npm test -- --run src/services/__tests__/weatherService.test.ts
npm test -- --run src/hooks/__tests__/useWeather.test.tsx
npm test -- --run src/components/__tests__/WeatherWidget.test.tsx
```

## Database Migration

To set up the weather system in your database, run the migration:

```sql
-- Run the weather-system.sql file
\i weather-system.sql
```

## Future Enhancements

1. **Seasonal Weather Patterns** - Different weather probabilities based on real seasons
2. **Regional Weather** - Different weather zones for different race locations
3. **Weather Events** - Special weather events that affect all races
4. **Weather History** - Historical weather data for analysis
5. **Weather Alerts** - Notifications for extreme weather conditions

## Configuration

Weather probabilities and transition matrices can be adjusted in `src/types/weather.ts`:

- `WEATHER_CONFIGS` - Base probabilities for each weather type
- `WEATHER_TRANSITIONS` - Transition probabilities between weather types

## Performance Considerations

- Weather data is cached and only updated when necessary
- Day/night cycle updates every minute
- Weather forecasts are generated once per day at 20:00
- Database queries are optimized with proper indexes 