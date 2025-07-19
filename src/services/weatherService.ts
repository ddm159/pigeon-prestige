import { supabase } from './supabase';
import type { 
  WeatherForecast, 
  WeatherType, 
  WeatherDisplay, 
  DayNightCycle 
} from '../types/weather';
import { 
  WEATHER_CONFIGS, 
  WEATHER_TRANSITIONS,
  SEASONAL_TEMPERATURES,
  TEMPERATURE_VARIATION
} from '../types/weather';

/**
 * Weather service for managing weather forecasts and day/night cycles
 */
class WeatherService {
  /**
   * Get the current day/night cycle based on real time
   */
  getDayNightCycle(): DayNightCycle {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Night time: 20:00 (8 PM) to 07:00 (7 AM)
    const isNight = currentHour >= 20 || currentHour < 7;
    
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const sunriseTime = '07:00';
    const sunsetTime = '20:00';
    
    return {
      isNight,
      currentTime,
      sunriseTime,
      sunsetTime
    };
  }

  /**
   * Generate a realistic weather type based on transition probabilities
   */
  private generateWeatherType(previousWeather?: WeatherType): WeatherType {
    if (!previousWeather) {
      // For the first day, use base probabilities
      const random = Math.random();
      let cumulative = 0;
      
      for (const [type, config] of Object.entries(WEATHER_CONFIGS)) {
        cumulative += config.baseProbability;
        if (random <= cumulative) {
          return type as WeatherType;
        }
      }
      return 'sunny'; // fallback
    }

    // Use transition matrix for subsequent days
    const transitions = WEATHER_TRANSITIONS[previousWeather];
    const random = Math.random();
    let cumulative = 0;
    
    for (const [type, probability] of Object.entries(transitions)) {
      cumulative += probability;
      if (random <= cumulative) {
        return type as WeatherType;
      }
    }
    
    return previousWeather; // fallback
  }

  /**
   * Generate a realistic severity value (1-100) based on weather type
   * Higher numbers = more rare and severe conditions
   * Lower numbers = more common and mild conditions
   * Uses weighted distribution to make higher numbers less likely
   */
  private generateSeverity(weatherType: WeatherType): number {
    // Use full 1-100 range for all weather types
    // Higher numbers are weighted to be less likely
    const random = Math.random();
    
    // Use exponential distribution to favor lower numbers
    // This makes higher severity values much rarer
    const severity = Math.floor(Math.pow(random, 2) * 100) + 1;
    
    // Ensure severity is within 1-100 range
    const finalSeverity = Math.max(1, Math.min(100, severity));
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Generated severity for ${weatherType}: ${finalSeverity}% (random: ${random.toFixed(3)})`);
    }
    
    return finalSeverity;
  }

  /**
   * Get the current season based on the date
   */
  private getSeason(date: Date): keyof typeof SEASONAL_TEMPERATURES {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'autumn';
  }

  /**
   * Generate realistic temperature based on season and previous temperature
   */
  private generateTemperature(date: Date, previousTemperature?: number): number {
    const season = this.getSeason(date);
    const seasonRange = SEASONAL_TEMPERATURES[season];
    
    let targetTemperature: number;
    
    if (previousTemperature !== undefined) {
      // Generate temperature with realistic day-to-day variation (max 5°C change)
      const maxChange = TEMPERATURE_VARIATION.maxDailyChange;
      
      // Random change between -maxChange and +maxChange
      const change = (Math.random() - 0.5) * 2 * maxChange;
      targetTemperature = previousTemperature + change;
      
      // Ensure the change doesn't exceed max daily variation
      const actualChange = Math.abs(targetTemperature - previousTemperature);
      if (actualChange > maxChange) {
        // If change is too large, cap it at maxChange
        const direction = targetTemperature > previousTemperature ? 1 : -1;
        targetTemperature = previousTemperature + (direction * maxChange);
      }
    } else {
      // First day - generate within seasonal range
      targetTemperature = seasonRange.min + Math.random() * (seasonRange.max - seasonRange.min);
    }
    
    // Clamp to seasonal range
    targetTemperature = Math.max(seasonRange.min, Math.min(seasonRange.max, targetTemperature));
    
    // Ensure it's within the overall game range (-5 to 40)
    targetTemperature = Math.max(-5, Math.min(40, targetTemperature));
    
    return Math.round(targetTemperature * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Generate weather forecast for a specific date
   */
  private generateForecastForDate(date: string, previousWeather?: WeatherType, previousTemperature?: number): WeatherForecast {
    const weatherType = this.generateWeatherType(previousWeather);
    const severity = this.generateSeverity(weatherType);
    const dateObj = new Date(date);
    const temperature = this.generateTemperature(dateObj, previousTemperature);
    
    // Determine if it's night time (simplified - assume night for now, will be updated by day/night cycle)
    const isNight = false; // This will be updated by the day/night cycle logic
    
    return {
      id: '', // Will be set by database
      date,
      weather_type: weatherType,
      severity,
      temperature,
      is_night: isNight,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Generate a 7-day weather forecast
   */
  async generateWeeklyForecast(): Promise<WeatherForecast[]> {
    const forecasts: WeatherForecast[] = [];
    const today = new Date();
    let previousWeather: WeatherType | undefined;
    let previousTemperature: number | undefined;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const forecast = this.generateForecastForDate(dateString, previousWeather, previousTemperature);
      forecasts.push(forecast);
      previousWeather = forecast.weather_type;
      previousTemperature = forecast.temperature;
    }

    return forecasts;
  }

  /**
   * Save weather forecasts to database
   */
  async saveForecasts(forecasts: WeatherForecast[]): Promise<void> {
    const { error } = await supabase
      .from('weather_forecast')
      .upsert(forecasts, { onConflict: 'date' });

    if (error) {
      console.error('Error saving weather forecasts:', error);
      throw new Error(`Failed to save weather forecasts: ${error.message}`);
    }
  }

  /**
   * Get weather forecast for a specific date
   */
  async getForecastForDate(date: string): Promise<WeatherForecast | null> {
    const { data, error } = await supabase
      .from('weather_forecast')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching weather forecast:', error);
      throw new Error(`Failed to fetch weather forecast: ${error.message}`);
    }

    return data;
  }

  /**
   * Get weather forecasts for the next 7 days
   */
  async getWeeklyForecast(): Promise<WeatherForecast[]> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    
    const startDateString = today.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('weather_forecast')
      .select('*')
      .gte('date', startDateString)
      .lte('date', endDateString)
      .order('date');

    if (error) {
      console.error('Error fetching weekly weather forecast:', error);
      throw new Error(`Failed to fetch weekly weather forecast: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get current weather (today's forecast)
   */
  async getCurrentWeather(): Promise<WeatherForecast | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.getForecastForDate(today);
  }

  /**
   * Convert weather forecast to display format
   */
  formatWeatherForDisplay(forecast: WeatherForecast): WeatherDisplay {
    const config = WEATHER_CONFIGS[forecast.weather_type];
    const dayNightCycle = this.getDayNightCycle();
    
    return {
      type: forecast.weather_type,
      severity: forecast.severity,
      temperature: forecast.temperature,
      isNight: dayNightCycle.isNight,
      emoji: config.emoji,
      description: config.description,
      impact: config.impact
    };
  }

  /**
   * Check if weather forecast needs to be updated (daily at 20:00 only)
   * Weather stays the same throughout the day, only day/night cycle changes
   */
  shouldUpdateForecast(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Update only at 20:00 (8 PM) - weather stays constant throughout the day
    return currentHour === 20 && currentMinute === 0;
  }

  /**
   * Initialize weather system - generate forecasts if none exist
   */
  async initializeWeatherSystem(): Promise<void> {
    try {
      const existingForecasts = await this.getWeeklyForecast();
      
      if (existingForecasts.length === 0) {
        console.log('No weather forecasts found, generating initial forecast...');
        const forecasts = await this.generateWeeklyForecast();
        await this.saveForecasts(forecasts);
        console.log('Initial weather forecast generated successfully');
      }
    } catch (error) {
      console.error('Error initializing weather system:', error);
      throw error;
    }
  }

  /**
   * Force regenerate weather forecasts with new distribution
   * This will overwrite existing forecasts with the new severity distribution
   */
  async forceRegenerateForecasts(): Promise<void> {
    try {
      console.log('Force regenerating weather forecasts with new distribution...');
      
      // Clear ALL existing forecasts (not just 7 days)
      const { error: deleteError } = await supabase
        .from('weather_forecast')
        .delete()
        .gte('date', '2024-01-01'); // Delete all forecasts from 2024 onwards

      if (deleteError) {
        console.error('Error clearing existing forecasts:', deleteError);
        throw new Error(`Failed to clear existing forecasts: ${deleteError.message}`);
      }

      console.log('Cleared existing forecasts, generating new ones...');

      // Generate new forecasts with correct distribution
      const forecasts = await this.generateWeeklyForecast();
      
      // Log the generated forecasts for debugging
      console.log('Generated forecasts:');
      forecasts.forEach((forecast, index) => {
        console.log(`Day ${index + 1}: ${forecast.weather_type} - Severity: ${forecast.severity}% - Temp: ${forecast.temperature}°C`);
      });
      
      await this.saveForecasts(forecasts);
      console.log('Weather forecasts regenerated successfully');
    } catch (error) {
      console.error('Error regenerating weather forecasts:', error);
      throw error;
    }
  }

  /**
   * Update weather forecasts (called daily at 20:00)
   */
  async updateDailyForecast(): Promise<void> {
    try {
      console.log('Updating daily weather forecast...');
      
      // Get the last forecast to use as previous weather
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      const yesterdayForecast = await this.getForecastForDate(yesterdayString);
      const previousWeather = yesterdayForecast?.weather_type;
      const previousTemperature = yesterdayForecast?.temperature;
      
      // Generate new forecast for today
      const todayString = today.toISOString().split('T')[0];
      const newForecast = this.generateForecastForDate(todayString, previousWeather, previousTemperature);
      
      // Save the new forecast
      await this.saveForecasts([newForecast]);
      
      console.log('Daily weather forecast updated successfully');
    } catch (error) {
      console.error('Error updating daily weather forecast:', error);
      throw error;
    }
  }

  /**
   * Get weather impact multiplier for racing (to be used in race calculations)
   * Higher severity = more impact (positive or negative)
   */
  getWeatherImpactMultiplier(weather: WeatherDisplay): number {
    const baseMultiplier = 1.0;
    
    switch (weather.type) {
      case 'sunny':
        // Higher severity = better conditions (more sun = better racing)
        return baseMultiplier + (weather.severity / 100) * 0.3; // +0.03 to +0.18
      case 'cloudy':
        // Higher severity = more cloudy = worse conditions
        return baseMultiplier - (weather.severity / 100) * 0.15; // -0.015 to -0.105
      case 'rainy':
        // Higher severity = more rain = worse conditions
        return baseMultiplier - (weather.severity / 100) * 0.4; // -0.1 to -0.34
      case 'windy':
        // Higher severity = more wind = worse conditions
        return baseMultiplier - (weather.severity / 100) * 0.35; // -0.105 to -0.28
      case 'foggy':
        // Higher severity = denser fog = worse conditions
        return baseMultiplier - (weather.severity / 100) * 0.6; // -0.3 to -0.54
      case 'stormy':
        // Higher severity = more severe storm = worse conditions
        return baseMultiplier - (weather.severity / 100) * 0.7; // -0.49 to -0.665
      default:
        return baseMultiplier;
    }
  }
}

export const weatherService = new WeatherService(); 