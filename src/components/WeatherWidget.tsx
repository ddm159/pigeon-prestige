import React from 'react';
import { useWeather } from '../hooks/useWeather';
import CurrentWeatherDisplay from './CurrentWeatherDisplay';
import WeeklyForecast from './WeeklyForecast';

/**
 * Main weather widget component that displays current weather and weekly forecast
 */
const WeatherWidget: React.FC = () => {
  const {
    currentWeather,
    weeklyForecast,
    dayNightCycle,
    loading,
    error,
    refreshWeather,
    forceRegenerateForecasts
  } = useWeather();

  const handleDateSelect = (dateId: string) => {
    console.log('Selected date:', dateId);
    // Future: Could show detailed weather for selected date
  };

  const handleRefresh = () => {
    refreshWeather();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Weather Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <CurrentWeatherDisplay
        weather={currentWeather}
        dayNightCycle={dayNightCycle}
        loading={loading}
      />

      {/* Weekly Forecast */}
      <WeeklyForecast
        forecast={weeklyForecast}
        loading={loading}
        onDateSelect={handleDateSelect}
      />

      {/* Weather Status and Actions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-green-500">✅</div>
            <span className="text-sm text-green-800">
              Weather system active
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Refresh
            </button>
            <button
              onClick={forceRegenerateForecasts}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={loading}
            >
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 