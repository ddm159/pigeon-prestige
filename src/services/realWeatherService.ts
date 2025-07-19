import { supabase } from './supabase';
import type { WeatherForecast, WeatherType, WeatherDisplay, DayNightCycle } from '../types/weather';
import { WEATHER_CONFIGS } from '../types/weather';

/**
 * Real weather service that fetches actual Belgian weather data
 */
class RealWeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  VITE_OPENWEATHER_API_KEY not found in environment variables');
    }
  }

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
   * Map OpenWeatherMap weather codes to game weather types
   */
  private mapWeatherCodeToGameType(weatherCode: number): WeatherType {
    // OpenWeatherMap weather codes: https://openweathermap.org/weather-conditions
    if (weatherCode >= 200 && weatherCode < 300) return 'stormy';      // Thunderstorm
    if (weatherCode >= 300 && weatherCode < 400) return 'rainy';       // Drizzle
    if (weatherCode >= 500 && weatherCode < 600) return 'rainy';       // Rain
    if (weatherCode >= 600 && weatherCode < 700) return 'foggy';       // Snow
    if (weatherCode >= 700 && weatherCode < 800) return 'foggy';       // Atmosphere (fog, mist, etc.)
    if (weatherCode === 800) return 'sunny';                          // Clear
    if (weatherCode >= 801 && weatherCode <= 804) return 'cloudy';     // Clouds
    return 'cloudy'; // Default fallback
  }

  /**
   * Calculate severity based on real weather conditions
   */
  private calculateSeverity(weatherCode: number, windSpeed: number, rainVolume?: number): number {
    let severity = 10; // Base severity

    // Weather type severity
    if (weatherCode >= 200 && weatherCode < 300) severity += 60; // Thunderstorm
    else if (weatherCode >= 500 && weatherCode < 600) severity += 30; // Rain
    else if (weatherCode >= 600 && weatherCode < 700) severity += 40; // Snow
    else if (weatherCode >= 700 && weatherCode < 800) severity += 50; // Fog/mist
    else if (weatherCode === 800) severity += 5; // Clear sky
    else if (weatherCode >= 801 && weatherCode <= 804) severity += 15; // Clouds

    // Wind severity (wind speed in m/s)
    if (windSpeed > 10) severity += 20; // Strong wind
    else if (windSpeed > 5) severity += 10; // Moderate wind

    // Rain severity
    if (rainVolume && rainVolume > 10) severity += 20; // Heavy rain
    else if (rainVolume && rainVolume > 5) severity += 10; // Moderate rain

    // Cap at 100 and ensure minimum of 1
    return Math.max(1, Math.min(100, severity));
  }

  /**
   * Fetch 7-day weather forecast for Brussels, Belgium
   */
  async fetchBelgianWeather(): Promise<WeatherForecast[]> {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    try {
      console.log('Fetching real Belgian weather data...');
      
      // Fetch 7-day forecast for Brussels
      const response = await fetch(
        `${this.baseUrl}/forecast?q=Brussels,BE&appid=${this.apiKey}&units=metric&cnt=7`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.list || data.list.length === 0) {
        throw new Error('No weather data received from API');
      }

      console.log('Received weather data:', data);

      // Convert API data to game format
      const forecasts: WeatherForecast[] = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const weatherData = data.list[i];
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        const weatherType = this.mapWeatherCodeToGameType(weatherData.weather[0].id);
        const severity = this.calculateSeverity(
          weatherData.weather[0].id,
          weatherData.wind.speed,
          weatherData.rain?.['3h'] // 3-hour rain volume
        );

        const forecast: WeatherForecast = {
          id: '', // Will be set by database
          date: dateString,
          weather_type: weatherType,
          severity,
          temperature: Math.round(weatherData.main.temp * 10) / 10,
          is_night: false, // Will be updated by day/night cycle
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        forecasts.push(forecast);
      }

      console.log('Converted forecasts:', forecasts);
      return forecasts;

    } catch (error) {
      console.error('Error fetching Belgian weather:', error);
      throw new Error(`Failed to fetch Belgian weather: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
   * Update weather with real Belgian data
   * This should be called every Sunday at 20:00
   */
  async updateWithRealWeather(): Promise<void> {
    try {
      console.log('Updating weather with real Belgian data...');
      
      // Fetch real weather data
      const forecasts = await this.fetchBelgianWeather();
      
      // Save to database
      await this.saveForecasts(forecasts);
      
      console.log('Weather updated with real Belgian data successfully');
    } catch (error) {
      console.error('Error updating with real weather:', error);
      throw error;
    }
  }

  /**
   * Check if it's Sunday at 20:00 (time to update weather)
   */
  shouldUpdateWeather(): boolean {
    const now = new Date();
    const isSunday = now.getDay() === 0; // 0 = Sunday
    const is8PM = now.getHours() === 20 && now.getMinutes() === 0;
    
    return isSunday && is8PM;
  }
}

export const realWeatherService = new RealWeatherService(); 