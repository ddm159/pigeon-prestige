/**
 * Weather system types for the pigeon racing game
 */

export type WeatherType = 'sunny' | 'rainy' | 'windy' | 'foggy' | 'stormy' | 'cloudy';

export interface WeatherForecast {
  id: string;
  date: string; // YYYY-MM-DD format
  weather_type: WeatherType;
  severity: number; // 1-100
  temperature: number; // Temperature in Celsius (-5 to 40)
  is_night: boolean;
  generated_at: string;
  updated_at: string;
}

export interface WeatherDisplay {
  type: WeatherType;
  severity: number;
  temperature: number; // Temperature in Celsius
  isNight: boolean;
  emoji: string;
  description: string;
  impact: string;
}

export interface WeatherTransition {
  from: WeatherType;
  to: WeatherType;
  probability: number;
}

export interface DayNightCycle {
  isNight: boolean;
  currentTime: string;
  sunriseTime: string;
  sunsetTime: string;
}

/**
 * Weather type configurations with emojis, descriptions, and impact levels
 */
export const WEATHER_CONFIGS: Record<WeatherType, {
  emoji: string;
  description: string;
  impact: string;
  baseProbability: number;
}> = {
  sunny: {
    emoji: '☀️',
    description: 'Sunny',
    impact: 'Optimal racing conditions',
    baseProbability: 0.30
  },
  rainy: {
    emoji: '🌧️',
    description: 'Rainy',
    impact: 'Reduces speed and visibility',
    baseProbability: 0.20
  },
  windy: {
    emoji: '💨',
    description: 'Windy',
    impact: 'Affects flight stability and speed',
    baseProbability: 0.20
  },
  foggy: {
    emoji: '🌫️',
    description: 'Foggy',
    impact: 'Severely impacts navigation and visibility',
    baseProbability: 0.10
  },
  stormy: {
    emoji: '⛈️',
    description: 'Stormy',
    impact: 'Most challenging conditions',
    baseProbability: 0.10
  },
  cloudy: {
    emoji: '☁️',
    description: 'Cloudy',
    impact: 'Mild impact on performance',
    baseProbability: 0.10
  }
};

/**
 * Seasonal temperature ranges for Belgium (in Celsius)
 * Based on real Belgian climate data
 */
export const SEASONAL_TEMPERATURES = {
  winter: { min: -2, max: 7 },    // Dec-Feb
  spring: { min: 8, max: 25 },    // Mar-May
  summer: { min: 25, max: 35 },   // Jun-Aug
  autumn: { min: 8, max: 20 }     // Sep-Nov
} as const;

/**
 * Temperature variation limits (max change between consecutive days)
 */
export const TEMPERATURE_VARIATION = {
  maxDailyChange: 5,  // Maximum 5°C change per day
  minDailyChange: 0   // Minimum 0°C change per day
} as const;

/**
 * Weather transition matrix for realistic weather changes
 * Each row represents the probability of transitioning FROM a weather type TO other types
 */
export const WEATHER_TRANSITIONS: Record<WeatherType, Record<WeatherType, number>> = {
  sunny: {
    sunny: 0.60,    // 60% chance to stay sunny
    cloudy: 0.25,   // 25% chance to become cloudy
    rainy: 0.05,    // 5% chance to become rainy
    windy: 0.05,    // 5% chance to become windy
    foggy: 0.02,    // 2% chance to become foggy
    stormy: 0.03    // 3% chance to become stormy
  },
  cloudy: {
    sunny: 0.30,    // 30% chance to become sunny
    cloudy: 0.40,   // 40% chance to stay cloudy
    rainy: 0.15,    // 15% chance to become rainy
    windy: 0.10,    // 10% chance to become windy
    foggy: 0.03,    // 3% chance to become foggy
    stormy: 0.02    // 2% chance to become stormy
  },
  rainy: {
    sunny: 0.10,    // 10% chance to become sunny
    cloudy: 0.30,   // 30% chance to become cloudy
    rainy: 0.40,    // 40% chance to stay rainy
    windy: 0.15,    // 15% chance to become windy
    foggy: 0.03,    // 3% chance to become foggy
    stormy: 0.02    // 2% chance to become stormy
  },
  windy: {
    sunny: 0.15,    // 15% chance to become sunny
    cloudy: 0.25,   // 25% chance to become cloudy
    rainy: 0.20,    // 20% chance to become rainy
    windy: 0.30,    // 30% chance to stay windy
    foggy: 0.05,    // 5% chance to become foggy
    stormy: 0.05    // 5% chance to become stormy
  },
  foggy: {
    sunny: 0.05,    // 5% chance to become sunny
    cloudy: 0.40,   // 40% chance to become cloudy
    rainy: 0.20,    // 20% chance to become rainy
    windy: 0.20,    // 20% chance to become windy
    foggy: 0.10,    // 10% chance to stay foggy
    stormy: 0.05    // 5% chance to become stormy
  },
  stormy: {
    sunny: 0.02,    // 2% chance to become sunny
    cloudy: 0.20,   // 20% chance to become cloudy
    rainy: 0.40,    // 40% chance to become rainy
    windy: 0.25,    // 25% chance to become windy
    foggy: 0.08,    // 8% chance to become foggy
    stormy: 0.05    // 5% chance to stay stormy
  }
}; 