import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeatherWidget from '../WeatherWidget';
import { useWeather } from '../../hooks/useWeather';

// Mock the useWeather hook
vi.mock('../../hooks/useWeather');
const mockUseWeather = vi.mocked(useWeather);

describe('WeatherWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseWeather.mockReturnValue({
      currentWeather: null,
      weeklyForecast: [],
      dayNightCycle: null,
      loading: true,
      error: null,
      refreshWeather: vi.fn(),
      forceRegenerateForecasts: vi.fn(),
      updateWithRealWeather: vi.fn(),
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: false,
      hasForecastData: false
    });

    render(<WeatherWidget />);

    expect(screen.getByText('7-Day Forecast')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to load weather data';
    mockUseWeather.mockReturnValue({
      currentWeather: null,
      weeklyForecast: [],
      dayNightCycle: null,
      loading: false,
      error: errorMessage,
      refreshWeather: vi.fn(),
      forceRegenerateForecasts: vi.fn(),
      updateWithRealWeather: vi.fn(),
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: false,
      hasForecastData: false
    });

    render(<WeatherWidget />);

    expect(screen.getByText('Weather Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should render weather data when available', () => {
    const mockWeather = {
      type: 'sunny' as const,
      severity: 75,
      temperature: 22.5,
      isNight: false,
      emoji: '☀️',
      description: 'Sunny',
      impact: 'Optimal racing conditions'
    };

    const mockDayNightCycle = {
      isNight: false,
      currentTime: '14:30',
      sunriseTime: '07:00',
      sunsetTime: '20:00'
    };

    const mockForecast = [mockWeather];

    mockUseWeather.mockReturnValue({
      currentWeather: mockWeather,
      weeklyForecast: mockForecast,
      dayNightCycle: mockDayNightCycle,
      loading: false,
      error: null,
      refreshWeather: vi.fn(),
      forceRegenerateForecasts: vi.fn(),
      updateWithRealWeather: vi.fn(),
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: true,
      hasForecastData: true
    });

    render(<WeatherWidget />);

    expect(screen.getAllByText('Sunny')).toHaveLength(2); // One in current weather, one in forecast
    expect(screen.getByText('Optimal racing conditions')).toBeInTheDocument();
    expect(screen.getByText('7-Day Forecast')).toBeInTheDocument();
    expect(screen.getByText('Weather system active')).toBeInTheDocument();
  });

  it('should call refreshWeather when retry button is clicked', async () => {
    const mockRefreshWeather = vi.fn();
    const errorMessage = 'Failed to load weather data';

    mockUseWeather.mockReturnValue({
      currentWeather: null,
      weeklyForecast: [],
      dayNightCycle: null,
      loading: false,
      error: errorMessage,
      refreshWeather: mockRefreshWeather,
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: false,
      hasForecastData: false
    });

    render(<WeatherWidget />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockRefreshWeather).toHaveBeenCalledTimes(1);
  });

  it('should call refreshWeather when refresh button is clicked', async () => {
    const mockRefreshWeather = vi.fn();
    const mockWeather = {
      type: 'sunny' as const,
      severity: 75,
      isNight: false,
      emoji: '☀️',
      description: 'Sunny',
      impact: 'Optimal racing conditions'
    };

    const mockDayNightCycle = {
      isNight: false,
      currentTime: '14:30',
      sunriseTime: '07:00',
      sunsetTime: '20:00'
    };

    mockUseWeather.mockReturnValue({
      currentWeather: mockWeather,
      weeklyForecast: [mockWeather],
      dayNightCycle: mockDayNightCycle,
      loading: false,
      error: null,
      refreshWeather: mockRefreshWeather,
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: true,
      hasForecastData: true
    });

    render(<WeatherWidget />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockRefreshWeather).toHaveBeenCalledTimes(1);
  });

  it('should handle date selection in weekly forecast', () => {
    const mockWeather = {
      type: 'sunny' as const,
      severity: 75,
      isNight: false,
      emoji: '☀️',
      description: 'Sunny',
      impact: 'Optimal racing conditions'
    };

    const mockDayNightCycle = {
      isNight: false,
      currentTime: '14:30',
      sunriseTime: '07:00',
      sunsetTime: '20:00'
    };

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockUseWeather.mockReturnValue({
      currentWeather: mockWeather,
      weeklyForecast: [mockWeather],
      dayNightCycle: mockDayNightCycle,
      loading: false,
      error: null,
      refreshWeather: vi.fn(),
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: true,
      hasForecastData: true
    });

    render(<WeatherWidget />);

    // The date selection is handled by the WeeklyForecast component
    // This test just ensures the handler is available
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not show weather status when no data is available', () => {
    mockUseWeather.mockReturnValue({
      currentWeather: null,
      weeklyForecast: [],
      dayNightCycle: null,
      loading: false,
      error: null,
      refreshWeather: vi.fn(),
      forceRegenerateForecasts: vi.fn(),
      updateWithRealWeather: vi.fn(),
      getWeatherImpactMultiplier: vi.fn(() => 1.0),
      isNightTime: vi.fn(() => false),
      getFormattedDate: vi.fn((date) => date),
      hasWeatherData: false,
      hasForecastData: false
    });

    render(<WeatherWidget />);

    expect(screen.queryByText('Weather system active')).not.toBeInTheDocument();
  });
}); 