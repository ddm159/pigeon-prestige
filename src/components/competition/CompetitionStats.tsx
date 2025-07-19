import React from 'react';
import type { CompetitionStats as CompetitionStatsType } from '../../types/competition';

interface CompetitionStatsProps {
  stats: CompetitionStatsType | null;
}

/**
 * Competition Stats Component
 * Displays competition statistics
 */
export const CompetitionStats: React.FC<CompetitionStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total Races</div>
            <div className="font-semibold">{stats.totalRaces}</div>
          </div>
          <div>
            <div className="text-gray-500">Participants</div>
            <div className="font-semibold">{stats.totalParticipants}</div>
          </div>
          <div>
            <div className="text-gray-500">Avg Velocity</div>
            <div className="font-semibold">{stats.averageVelocity.toFixed(2)} m/s</div>
          </div>
          <div>
            <div className="text-gray-500">Best Velocity</div>
            <div className="font-semibold">{stats.bestVelocity.toFixed(2)} m/s</div>
          </div>
          <div>
            <div className="text-gray-500">Total Distance</div>
            <div className="font-semibold">{stats.totalDistance.toFixed(0)} km</div>
          </div>
          <div>
            <div className="text-gray-500">Prize Money</div>
            <div className="font-semibold">${stats.totalPrizeMoney.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 