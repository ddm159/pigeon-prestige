import { describe, it, expect, vi, beforeEach } from 'vitest';
import { realWeatherService } from '../realWeatherService';

// Mock fetch
global.fetch = vi.fn();

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

// Mock environment variable
vi.mock('vite', () => ({
  env: {
    VITE_OPENWEATHER_API_KEY: 'test-api-key'
  }
}));

describe('RealWeatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDayNightCycle', () => {
    it('should return correct day/night cycle for day time', () => {
      const mockDate = new Date('2024-01-15T14:30:00');
      vi.setSystemTime(mockDate);

      const cycle = realWeatherService.getDayNightCycle();

      expect(cycle.isNight).toBe(false);
      expect(cycle.currentTime).toBe('14:30');
      expect(cycle.sunriseTime).toBe('07:00');
      expect(cycle.sunsetTime).toBe('20:00');
    });

    it('should return correct day/night cycle for night time', () => {
      const mockDate = new Date('2024-01-15T22:30:00');
      vi.setSystemTime(mockDate);

      const cycle = realWeatherService.getDayNightCycle();

      expect(cycle.isNight).toBe(true);
      expect(cycle.currentTime).toBe('22:30');
    });
  });

  describe('shouldUpdateWeather', () => {
    it('should return true on Sunday at 20:00', () => {
      const mockDate = new Date('2024-01-14T20:00:00'); // Sunday
      vi.setSystemTime(mockDate);

      const shouldUpdate = realWeatherService.shouldUpdateWeather();
      expect(shouldUpdate).toBe(true);
    });

    it('should return false on other days', () => {
      const mockDate = new Date('2024-01-15T20:00:00'); // Monday
      vi.setSystemTime(mockDate);

      const shouldUpdate = realWeatherService.shouldUpdateWeather();
      expect(shouldUpdate).toBe(false);
    });

    it('should return false at other times', () => {
      const mockDate = new Date('2024-01-14T14:30:00'); // Sunday but not 20:00
      vi.setSystemTime(mockDate);

      const shouldUpdate = realWeatherService.shouldUpdateWeather();
      expect(shouldUpdate).toBe(false);
    });
  });

  describe('formatWeatherForDisplay', () => {
    it('should format weather forecast for display', () => {
      const mockForecast = {
        id: '1',
        date: '2024-01-15',
        weather_type: 'sunny' as const,
        severity: 25,
        temperature: 22.5,
        is_night: false,
        generated_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };

      const display = realWeatherService.formatWeatherForDisplay(mockForecast);

      expect(display.type).toBe('sunny');
      expect(display.severity).toBe(25);
      expect(display.temperature).toBe(22.5);
      expect(display.emoji).toBe('☀️');
      expect(display.description).toBe('Sunny');
      expect(display.impact).toBe('Optimal racing conditions');
    });
  });

  describe('Database operations', () => {
    it('should get forecast for specific date', async () => {
      const forecast = await realWeatherService.getForecastForDate('2024-01-15');
      expect(forecast).toBeNull(); // Mock returns null
    });

    it('should get weekly forecast', async () => {
      const forecasts = await realWeatherService.getWeeklyForecast();
      expect(Array.isArray(forecasts)).toBe(true);
    });

    it('should get current weather', async () => {
      const weather = await realWeatherService.getCurrentWeather();
      expect(weather).toBeNull(); // Mock returns null
    });
  });
}); 