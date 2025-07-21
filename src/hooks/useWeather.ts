import { useState, useEffect, useCallback } from 'react';
import { weatherService } from '../services/weatherService';
import type { WeatherDisplay, DayNightCycle } from '../types/weather';

/**
 * Custom hook for managing weather state and data
 */
export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherDisplay | null>(null);
  const [weeklyForecast, setWeeklyForecast] = useState<WeatherDisplay[]>([]);
  const [dayNightCycle, setDayNightCycle] = useState<DayNightCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load current weather data
   */
  const loadCurrentWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const forecast = await weatherService.getCurrentWeather();
      if (forecast) {
        const display = weatherService.formatWeatherForDisplay(forecast);
        setCurrentWeather(display);
      }
    } catch (err) {
      console.error('Error loading current weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load weekly weather forecast
   */
  const loadWeeklyForecast = useCallback(async () => {
    try {
      setError(null);
      
      const forecasts = await weatherService.getWeeklyForecast();
      const displays = forecasts.map(forecast => 
        weatherService.formatWeatherForDisplay(forecast)
      );
      setWeeklyForecast(displays);
    } catch (err) {
      console.error('Error loading weekly forecast:', err);
      setError(err instanceof Error ? err.message : 'Failed to load forecast data');
    }
  }, []);

  /**
   * Update day/night cycle
   */
  const updateDayNightCycle = useCallback(() => {
    const cycle = weatherService.getDayNightCycle();
    setDayNightCycle(cycle);
  }, []);

  /**
   * Initialize weather system
   */
  const initializeWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await weatherService.initializeWeatherSystem();
      await loadCurrentWeather();
      await loadWeeklyForecast();
      updateDayNightCycle();
    } catch (err) {
      console.error('Error initializing weather system:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize weather system');
    } finally {
      setLoading(false);
    }
  }, [loadCurrentWeather, loadWeeklyForecast, updateDayNightCycle]);

  /**
   * Refresh weather data
   */
  const refreshWeather = useCallback(async () => {
    await loadCurrentWeather();
    await loadWeeklyForecast();
    updateDayNightCycle();
  }, [loadCurrentWeather, loadWeeklyForecast, updateDayNightCycle]);

  /**
   * Force regenerate weather forecasts with new distribution
   */
  const forceRegenerateForecasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await weatherService.forceRegenerateForecasts();
      await loadCurrentWeather();
      await loadWeeklyForecast();
      updateDayNightCycle();
    } catch (err) {
      console.error('Error regenerating weather forecasts:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate weather forecasts');
    } finally {
      setLoading(false);
    }
  }, [loadCurrentWeather, loadWeeklyForecast, updateDayNightCycle]);

  /**
   * Get weather impact multiplier for racing calculations
   */
  const getWeatherImpactMultiplier = useCallback(() => {
    if (!currentWeather) return 1.0;
    return weatherService.getWeatherImpactMultiplier(currentWeather);
  }, [currentWeather]);

  /**
   * Check if it's currently night time
   */
  const isNightTime = useCallback(() => {
    return dayNightCycle?.isNight ?? false;
  }, [dayNightCycle]);

  /**
   * Get formatted date for a forecast day
   */
  const getFormattedDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }, []);

  // Initialize weather system on mount
  useEffect(() => {
    initializeWeather();
  }, [initializeWeather]);

  // Update day/night cycle every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateDayNightCycle();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [updateDayNightCycle]);

  // Check for weather updates at 20:00
  useEffect(() => {
    const checkForUpdates = () => {
      if (weatherService.shouldUpdateForecast()) {
        refreshWeather();
      }
    };

    const interval = setInterval(checkForUpdates, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [refreshWeather]);

  return {
    // State
    currentWeather,
    weeklyForecast,
    dayNightCycle,
    loading,
    error,
    
    // Actions
    refreshWeather,
    forceRegenerateForecasts,
    getWeatherImpactMultiplier,
    isNightTime,
    getFormattedDate,
    
    // Computed values
    hasWeatherData: currentWeather !== null,
    hasForecastData: weeklyForecast.length > 0
  };
}; 