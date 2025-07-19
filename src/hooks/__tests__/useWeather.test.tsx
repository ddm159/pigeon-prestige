import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeather } from '../useWeather';
import { weatherService } from '../../services/weatherService';

// Mock the weather service
vi.mock('../../services/weatherService', () => ({
  weatherService: {
    getCurrentWeather: vi.fn(),
    getWeeklyForecast: vi.fn(),
    getDayNightCycle: vi.fn(),
    initializeWeatherSystem: vi.fn(),
    formatWeatherForDisplay: vi.fn(),
    shouldUpdateForecast: vi.fn(),
    getWeatherImpactMultiplier: vi.fn()
  }
}));

const mockWeatherService = vi.mocked(weatherService);

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockWeatherService.getCurrentWeather.mockResolvedValue(null);
    mockWeatherService.getWeeklyForecast.mockResolvedValue([]);
    mockWeatherService.getDayNightCycle.mockReturnValue({
      isNight: false,
      currentTime: '14:30',
      sunriseTime: '07:00',
      sunsetTime: '20:00'
    });
    mockWeatherService.initializeWeatherSystem.mockResolvedValue();
    mockWeatherService.shouldUpdateForecast.mockReturnValue(false);
    mockWeatherService.getWeatherImpactMultiplier.mockReturnValue(1.0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.loading).toBe(true);
    expect(result.current.currentWeather).toBe(null);
    expect(result.current.weeklyForecast).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should load weather data on mount', async () => {
    const mockForecast = {
      id: '1',
      date: '2024-01-15',
      weather_type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      is_night: false,
      generated_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    };

    const mockDisplay = {
      type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      isNight: false,
      emoji: '☀️',
      description: 'Sunny',
      impact: 'Optimal racing conditions'
    };

    mockWeatherService.getCurrentWeather.mockResolvedValue(mockForecast);
    mockWeatherService.getWeeklyForecast.mockResolvedValue([mockForecast]);
    mockWeatherService.formatWeatherForDisplay.mockReturnValue(mockDisplay);

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentWeather).toEqual(mockDisplay);
    expect(result.current.weeklyForecast).toEqual([mockDisplay]);
    expect(result.current.hasWeatherData).toBe(true);
    expect(result.current.hasForecastData).toBe(true);
  });

  it('should handle initialization errors', async () => {
    const errorMessage = 'Failed to initialize weather system';
    mockWeatherService.initializeWeatherSystem.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.currentWeather).toBe(null);
    expect(result.current.weeklyForecast).toEqual([]);
  });

  it('should refresh weather data', async () => {
    const mockForecast = {
      id: '1',
      date: '2024-01-15',
      weather_type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      is_night: false,
      generated_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    };

    const mockDisplay = {
      type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      isNight: false,
      emoji: '☀️',
      description: 'Sunny',
      impact: 'Optimal racing conditions'
    };

    mockWeatherService.getCurrentWeather.mockResolvedValue(mockForecast);
    mockWeatherService.getWeeklyForecast.mockResolvedValue([mockForecast]);
    mockWeatherService.formatWeatherForDisplay.mockReturnValue(mockDisplay);

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mocks to verify refresh calls
    vi.clearAllMocks();
    mockWeatherService.getCurrentWeather.mockResolvedValue(mockForecast);
    mockWeatherService.getWeeklyForecast.mockResolvedValue([mockForecast]);
    mockWeatherService.formatWeatherForDisplay.mockReturnValue(mockDisplay);

    await act(async () => {
      await result.current.refreshWeather();
    });

    expect(mockWeatherService.getCurrentWeather).toHaveBeenCalled();
    expect(mockWeatherService.getWeeklyForecast).toHaveBeenCalled();
    expect(mockWeatherService.getDayNightCycle).toHaveBeenCalled();
  });

  it('should return correct weather impact multiplier', async () => {
    const mockForecast = {
      id: '1',
      date: '2024-01-15',
      weather_type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      is_night: false,
      generated_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    };

    const mockDisplay = {
      type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      isNight: false,
      emoji: '☀️',
      description: 'Sunny',
      impact: 'Optimal racing conditions'
    };

    mockWeatherService.getCurrentWeather.mockResolvedValue(mockForecast);
    mockWeatherService.getWeeklyForecast.mockResolvedValue([mockForecast]);
    mockWeatherService.formatWeatherForDisplay.mockReturnValue(mockDisplay);

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const multiplier = result.current.getWeatherImpactMultiplier();
    expect(typeof multiplier).toBe('number');
    expect(multiplier).toBeGreaterThan(0);
  });

  it('should return default multiplier when no weather data', () => {
    const { result } = renderHook(() => useWeather());

    const multiplier = result.current.getWeatherImpactMultiplier();
    expect(multiplier).toBe(1.0);
  });

  it('should check if it is night time', async () => {
    mockWeatherService.getDayNightCycle.mockReturnValue({
      isNight: true,
      currentTime: '22:30',
      sunriseTime: '07:00',
      sunsetTime: '20:00'
    });

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isNightTime()).toBe(true);
  });

  it('should format dates correctly', () => {
    const { result } = renderHook(() => useWeather());

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 3);

    expect(result.current.getFormattedDate(today.toISOString().split('T')[0])).toBe('Today');
    expect(result.current.getFormattedDate(tomorrow.toISOString().split('T')[0])).toBe('Tomorrow');
    
    const formattedFuture = result.current.getFormattedDate(futureDate.toISOString().split('T')[0]);
    expect(formattedFuture).toMatch(/[A-Za-z]{3}, [A-Za-z]{3} \d+/);
  });

  it('should have periodic update functionality', () => {
    const { result } = renderHook(() => useWeather());
    
    // Test that the hook provides the expected functionality
    expect(typeof result.current.refreshWeather).toBe('function');
    expect(typeof result.current.getWeatherImpactMultiplier).toBe('function');
    expect(typeof result.current.isNightTime).toBe('function');
    expect(typeof result.current.getFormattedDate).toBe('function');
  });
}); 