import React from 'react';
import type { CompetitionRace, RaceCategory } from '../../types/competition';

interface UpcomingRacesProps {
  races: CompetitionRace[];
  loading: boolean;
  selectedRaceCategory: RaceCategory | 'all';
  onRaceCategoryChange: (category: RaceCategory | 'all') => void;
}

/**
 * Upcoming Races Component
 * Displays upcoming races with filtering
 */
export const UpcomingRaces: React.FC<UpcomingRacesProps> = ({
  races,
  loading,
  selectedRaceCategory,
  onRaceCategoryChange
}) => {
  // Filter races by category
  const filteredRaces = races.filter(race => 
    selectedRaceCategory === 'all' || race.category === selectedRaceCategory
  );

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

  // Get race category display name
  const getRaceCategoryName = (category: RaceCategory) => {
    switch (category) {
      case 'global': return 'International';
      case 'regional': return 'Regional';
      case 'youth_global': return 'Youth International';
      case 'youth_regional': return 'Youth Regional';
      default: return category;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Races</h2>
          <div className="flex space-x-2">
            <select
              value={selectedRaceCategory}
              onChange={(e) => onRaceCategoryChange(e.target.value as RaceCategory | 'all')}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="all">All Categories</option>
              <option value="global">International</option>
              <option value="regional">Regional</option>
              <option value="youth_global">Youth International</option>
              <option value="youth_regional">Youth Regional</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRaces.map((race) => (
              <div key={race.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{race.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    race.category.includes('youth') ? 'bg-purple-100 text-purple-800' :
                    race.category === 'global' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {getRaceCategoryName(race.category)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Distance: {race.distance} km</div>
                  <div>Start: {formatDate(race.start_time)}</div>
                  <div>Entry Fee: ${race.entry_fee}</div>
                  <div>Prize Pool: ${race.prize_pool.toLocaleString()}</div>
                </div>
                <div className="mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    race.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    race.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {race.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No upcoming races</p>
        )}
      </div>
    </div>
  );
}; 