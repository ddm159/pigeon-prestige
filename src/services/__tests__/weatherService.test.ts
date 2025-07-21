import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { weatherService } from '../weatherService';
import type { WeatherForecast, WeatherDisplay } from '../../types/weather';
import * as supabaseModule from '../supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(supabaseModule.supabase as any).rpc = vi.fn((fnName: string) => {
  if (fnName === 'get_current_game_date') {
    return Promise.resolve({ data: '1900-01-02', error: null });
  }
  return Promise.resolve({ data: null, error: null });
});

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('WeatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDayNightCycle', () => {
    it('should return correct day/night cycle for day time', () => {
      const mockDate = new Date('2024-01-15T14:30:00');
      vi.setSystemTime(mockDate);

      const cycle = weatherService.getDayNightCycle();

      expect(cycle.isNight).toBe(false);
      expect(cycle.currentTime).toBe('14:30');
      expect(cycle.sunriseTime).toBe('07:00');
      expect(cycle.sunsetTime).toBe('20:00');
    });

    it('should return correct day/night cycle for night time', () => {
      const mockDate = new Date('2024-01-15T22:30:00');
      vi.setSystemTime(mockDate);

      const cycle = weatherService.getDayNightCycle();

      expect(cycle.isNight).toBe(true);
      expect(cycle.currentTime).toBe('22:30');
    });

    it('should handle early morning hours correctly', () => {
      const mockDate = new Date('2024-01-15T03:30:00');
      vi.setSystemTime(mockDate);

      const cycle = weatherService.getDayNightCycle();

      expect(cycle.isNight).toBe(true);
      expect(cycle.currentTime).toBe('03:30');
    });
  });

  describe('generateWeatherType', () => {
    it('should generate weather type without previous weather', () => {
      const weatherType = (weatherService as unknown as { generateWeatherType: () => string }).generateWeatherType();
      expect(['sunny', 'rainy', 'windy', 'foggy', 'stormy', 'cloudy']).toContain(weatherType);
    });

    it('should generate weather type with previous weather', () => {
      const weatherType = (weatherService as unknown as { generateWeatherType: (prev?: string) => string }).generateWeatherType('sunny');
      expect(['sunny', 'rainy', 'windy', 'foggy', 'stormy', 'cloudy']).toContain(weatherType);
    });
  });

  describe('generateSeverity', () => {
    it('should generate severity within correct range for any weather type', () => {
      const severity = (weatherService as unknown as { generateSeverity: (type: string) => number }).generateSeverity('sunny');
      expect(severity).toBeGreaterThanOrEqual(1);
      expect(severity).toBeLessThanOrEqual(100);
    });

    it('should favor lower severity values (weighted distribution)', () => {
      const severities: number[] = [];
      for (let i = 0; i < 1000; i++) {
        severities.push((weatherService as unknown as { generateSeverity: (type: string) => number }).generateSeverity('stormy'));
      }
      
      // Calculate average - should be lower due to weighted distribution
      const average = severities.reduce((sum, val) => sum + val, 0) / severities.length;
      expect(average).toBeLessThan(50); // Should favor lower numbers
    });
  });

  describe('generateForecastForDate', () => {
    it('should generate forecast for a specific date', () => {
      const forecast = (weatherService as unknown as { generateForecastForDate: (date: string) => WeatherForecast }).generateForecastForDate('2024-01-15');
      
      expect(forecast.date).toBe('2024-01-15');
      expect(forecast.weather_type).toBeDefined();
      expect(forecast.severity).toBeGreaterThan(0);
      expect(forecast.severity).toBeLessThanOrEqual(100);
      expect(typeof forecast.is_night).toBe('boolean');
    });
  });

  describe('generateWeeklyForecast', () => {
    it('should generate 7 days of forecasts', async () => {
      const forecasts = await weatherService.generateWeeklyForecast();
      
      expect(forecasts).toHaveLength(7);
      forecasts.forEach((forecast) => {
        expect(forecast.weather_type).toBeDefined();
        expect(forecast.severity).toBeGreaterThan(0);
        expect(forecast.severity).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('formatWeatherForDisplay', () => {
    it('should format weather forecast for display', () => {
      const mockForecast: WeatherForecast = {
        id: '1',
        date: '2024-01-15',
        weather_type: 'sunny',
        severity: 75,
        temperature: 20.5,
        is_night: false,
        generated_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };

      const display = weatherService.formatWeatherForDisplay(mockForecast);

      expect(display.type).toBe('sunny');
      expect(display.severity).toBe(75);
      expect(display.emoji).toBe('☀️');
      expect(display.description).toBe('Sunny');
      expect(display.impact).toBe('Optimal racing conditions');
    });
  });

  describe('shouldUpdateForecast', () => {
    it('should return true at 20:00', () => {
      const mockDate = new Date('2024-01-15T20:00:00');
      vi.setSystemTime(mockDate);

      const shouldUpdate = weatherService.shouldUpdateForecast();
      expect(shouldUpdate).toBe(true);
    });

    it('should return false at other times', () => {
      const mockDate = new Date('2024-01-15T14:30:00');
      vi.setSystemTime(mockDate);

      const shouldUpdate = weatherService.shouldUpdateForecast();
      expect(shouldUpdate).toBe(false);
    });
  });

  describe('getWeatherImpactMultiplier', () => {
    it('should return correct multiplier for sunny weather', () => {
      const weather: WeatherDisplay = {
        type: 'sunny',
        severity: 50,
        temperature: 20,
        isNight: false,
        emoji: '☀️',
        description: 'Sunny',
        impact: 'Optimal racing conditions'
      };

      const multiplier = weatherService.getWeatherImpactMultiplier(weather);
      expect(multiplier).toBeGreaterThan(1.0);
    });

    it('should return correct multiplier for stormy weather', () => {
      const weather: WeatherDisplay = {
        type: 'stormy',
        severity: 85,
        temperature: 15,
        isNight: false,
        emoji: '⛈️',
        description: 'Stormy',
        impact: 'Most challenging conditions'
      };

      const multiplier = weatherService.getWeatherImpactMultiplier(weather);
      expect(multiplier).toBeLessThan(1.0);
    });

    it('should return base multiplier for unknown weather type', () => {
      const weather: WeatherDisplay = {
        type: 'unknown' as 'sunny', // Using a valid type for testing
        severity: 50,
        temperature: 20,
        isNight: false,
        emoji: '☀️',
        description: 'Unknown',
        impact: 'Unknown conditions'
      };

      const multiplier = weatherService.getWeatherImpactMultiplier(weather);
      expect(multiplier).toBe(1.0);
    });
  });

  describe('Database operations', () => {
    it('should save forecasts to database', async () => {
      const mockForecasts: WeatherForecast[] = [
        {
          id: '1',
          date: '2024-01-15',
          weather_type: 'sunny',
          severity: 75,
          temperature: 20.5,
          is_night: false,
          generated_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];

      await expect(weatherService.saveForecasts(mockForecasts)).resolves.not.toThrow();
    });

    it('should get forecast for specific date', async () => {
      const forecast = await weatherService.getForecastForDate('2024-01-15');
      expect(forecast).toBeNull(); // Mock returns null
    });

    it('should get weekly forecast', async () => {
      const forecasts = await weatherService.getWeeklyForecast();
      expect(Array.isArray(forecasts)).toBe(true);
    });

    it('should get current weather', async () => {
      const weather = await weatherService.getCurrentWeather();
      expect(weather).toBeNull(); // Mock returns null
    });
  });
}); 