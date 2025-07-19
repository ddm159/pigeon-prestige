import React from 'react';
import type { Season } from '../../types/competition';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: string;
  loading: boolean;
  onSeasonChange: (seasonId: string) => void;
}

/**
 * Season Selector Component
 * Displays and manages season selection
 */
export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  selectedSeason,
  loading,
  onSeasonChange
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Seasons</h2>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => onSeasonChange(season.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedSeason === season.id
                    ? 'bg-green-100 text-green-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{season.name}</div>
                <div className="text-sm text-gray-500">
                  {formatDate(season.start_date)} - {formatDate(season.end_date)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                  season.status === 'active' ? 'bg-green-100 text-green-800' :
                  season.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {season.status}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 