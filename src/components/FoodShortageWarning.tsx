import React from 'react';
import { AlertTriangle, Heart, Clock } from 'lucide-react';
import { useFoodShortageLogic } from '../hooks/useFoodShortageLogic';

interface FoodShortageWarningProps {
  userId: string;
  className?: string;
}

const FoodShortageWarning: React.FC<FoodShortageWarningProps> = ({ userId, className = '' }) => {
  const {
    loading,
    error,
    shortageSummary,
    getShortageSeverity
  } = useFoodShortageLogic(userId);

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="text-red-600 text-sm">Error loading food shortage data: {error}</div>
      </div>
    );
  }

  if (!shortageSummary || shortageSummary.total_pigeons_with_shortages === 0) {
    return null; // Don't show anything if no shortages
  }

  const criticalShortages = shortageSummary.pigeons_experiencing_shortages.filter(
    p => getShortageSeverity(p.food_shortage_streak) === 'critical'
  );

  const highShortages = shortageSummary.pigeons_experiencing_shortages.filter(
    p => getShortageSeverity(p.food_shortage_streak) === 'high'
  );

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Food Shortage Alert</h3>
        <span className="badge-danger">{shortageSummary.total_pigeons_with_shortages}</span>
      </div>

      {/* Critical Shortages */}
      {criticalShortages.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">Critical Food Shortages</span>
          </div>
          <div className="space-y-2">
            {criticalShortages.map(pigeon => (
              <div key={pigeon.pigeon_id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{pigeon.pigeon_name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 font-medium">
                    {pigeon.food_shortage_streak} days
                  </span>
                  <Heart className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{pigeon.current_health}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Shortages */}
      {highShortages.length > 0 && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-800">High Food Shortages</span>
          </div>
          <div className="space-y-2">
            {highShortages.map(pigeon => (
              <div key={pigeon.pigeon_id} className="flex items-center justify-between text-sm">
                <span className="text-orange-700">{pigeon.pigeon_name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600 font-medium">
                    {pigeon.food_shortage_streak} days
                  </span>
                  <Heart className="h-3 w-3 text-orange-600" />
                  <span className="text-orange-600">{pigeon.current_health}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">
            {shortageSummary.total_health_penalties_today}
          </div>
          <div className="text-gray-600">Penalties Today</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">
            {Math.round(shortageSummary.average_shortage_streak * 10) / 10}
          </div>
          <div className="text-gray-600">Avg. Streak</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button 
          className="w-full btn-primary"
          onClick={() => window.location.href = '/maintenance'}
        >
          Manage Food Supply
        </button>
      </div>
    </div>
  );
};

export default FoodShortageWarning; 