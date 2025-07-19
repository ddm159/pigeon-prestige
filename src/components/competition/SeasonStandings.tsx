import React from 'react';
import type { SeasonStanding, DivisionType } from '../../types/competition';

interface SeasonStandingsProps {
  standings: SeasonStanding[];
  loading: boolean;
  selectedSeason: string;
  selectedDivision: DivisionType | 'all';
  seasonName: string;
  divisionName: string;
}

/**
 * Season Standings Component
 * Displays season standings in a table format
 */
export const SeasonStandings: React.FC<SeasonStandingsProps> = ({
  standings,
  loading,
  selectedSeason,
  selectedDivision,
  seasonName,
  divisionName
}) => {
  if (!selectedSeason) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Season Standings - {seasonName}
          {selectedDivision !== 'all' && ` - ${divisionName}`}
        </h2>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : standings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Races
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Velocity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wins
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((standing, index) => (
                  <tr key={standing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {standing.users?.username || `Player ${standing.user_id.slice(0, 8)}`}
                        </span>
                        {standing.users?.player_type === 'ai' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            AI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {standing.total_points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {standing.races_participated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {standing.best_velocity ? `${standing.best_velocity.toFixed(2)} m/s` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {standing.wins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No standings available</p>
        )}
      </div>
    </div>
  );
}; 