import React from 'react';
import type { WeatherDisplay, DayNightCycle } from '../types/weather';

interface CurrentWeatherDisplayProps {
  weather: WeatherDisplay | null;
  dayNightCycle: DayNightCycle | null;
  loading?: boolean;
}

/**
 * Component to display current weather conditions
 */
const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({
  weather,
  dayNightCycle,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather || !dayNightCycle) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🌤️</div>
          <p>Weather data unavailable</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'bg-red-500';
    if (severity >= 60) return 'bg-orange-500';
    if (severity >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 80) return 'Severe';
    if (severity >= 60) return 'Moderate';
    if (severity >= 40) return 'Light';
    return 'Mild';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        {/* Weather Info */}
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{weather.emoji}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {weather.description}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{weather.impact}</span>
              <span className="text-sm font-medium text-gray-700">
                {weather.temperature}°C
              </span>
            </div>
          </div>
        </div>

        {/* Day/Night Indicator */}
        <div className="text-right">
          <div className="text-2xl mb-1">
            {dayNightCycle.isNight ? '🌙' : '☀️'}
          </div>
          <div className="text-xs text-gray-500">
            {dayNightCycle.currentTime}
          </div>
        </div>
      </div>

      {/* Severity Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            Severity: {getSeverityLabel(weather.severity)}
          </span>
          <span className="text-sm text-gray-500">
            {weather.severity}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getSeverityColor(weather.severity)}`}
            style={{ width: `${weather.severity}%` }}
          ></div>
        </div>
      </div>

      {/* Racing Impact */}
      <div className="mt-3 p-2 bg-blue-50 rounded-md">
        <div className="text-xs text-blue-800">
          <span className="font-medium">Racing Impact:</span> {
            weather.type === 'sunny' ? 'Optimal conditions' :
            weather.type === 'cloudy' ? 'Slight reduction' :
            weather.type === 'rainy' ? 'Speed reduced' :
            weather.type === 'windy' ? 'Stability affected' :
            weather.type === 'foggy' ? 'Navigation difficult' :
            'Extreme conditions'
          }
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherDisplay; 