import React from 'react';
import type { WeatherDisplay } from '../types/weather';

interface WeeklyForecastProps {
  forecast: WeatherDisplay[];
  loading?: boolean;
  onDateSelect?: (date: string) => void;
}

/**
 * Component to display 7-day weather forecast
 */
const WeeklyForecast: React.FC<WeeklyForecastProps> = ({
  forecast,
  loading = false,
  onDateSelect
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">7-Day Forecast</h3>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-full h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">7-Day Forecast</h3>
        <div className="text-center text-gray-500 py-8">
          <div className="text-3xl mb-2">🌤️</div>
          <p>Forecast data unavailable</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'bg-red-100 border-red-300';
    if (severity >= 60) return 'bg-orange-100 border-orange-300';
    if (severity >= 40) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getSeverityTextColor = (severity: number) => {
    if (severity >= 80) return 'text-red-700';
    if (severity >= 60) return 'text-orange-700';
    if (severity >= 40) return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">7-Day Forecast</h3>

      {/* Debug info - remove this later */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 p-2 bg-yellow-100 text-xs">
          Debug: {forecast.length} forecasts loaded
          {forecast.length > 0 && (
            <div>First forecast: {JSON.stringify(forecast[0])}</div>
          )}
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {forecast.map((day, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg border-2 ${getSeverityColor(day.severity)} cursor-pointer transition-all hover:scale-105`}
            onClick={() => onDateSelect?.(`day-${index}`)}
          >
            {/* Weather Icon */}
            <div className="text-center mb-1">
              <div className="text-xl">{day.emoji}</div>
            </div>

            {/* Temperature */}
            <div className="text-center mb-1">
              <div className="text-xs font-medium text-gray-700">
                {day.temperature !== undefined ? `${day.temperature}°C` : 'N/A'}
              </div>
            </div>

            {/* Severity */}
            <div className="text-center">
              <div className={`text-xs font-medium ${getSeverityTextColor(day.severity)}`}>
                {day.severity}%
              </div>
            </div>

            {/* Weather Type */}
            <div className="text-center mt-1">
              <div className="text-xs text-gray-600 font-medium">
                {day.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyForecast; 