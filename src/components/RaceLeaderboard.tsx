import React from 'react';
import type { PigeonRaceResult } from '../types/race';
import { getDistanceAtMinute } from '../utils/raceUtils';

interface RaceLeaderboardProps {
  pigeons: PigeonRaceResult[];
  currentTime: number;
  userPigeonIds?: string[];
  filter?: (pigeon: PigeonRaceResult) => boolean;
}

/**
 * Leaderboard component for the pigeon race.
 * Sorts pigeons by distance at currentTime. Highlights user's pigeons.
 */
const RaceLeaderboard: React.FC<RaceLeaderboardProps> = ({
  pigeons,
  currentTime,
  userPigeonIds = [],
  filter,
}) => {
  const sorted = React.useMemo(() => {
    return pigeons
      .filter(filter || (() => true))
      .sort((a, b) => getDistanceAtMinute(currentTime, b) - getDistanceAtMinute(currentTime, a));
  }, [pigeons, currentTime, filter]);

  return (
    <table aria-label="Race Leaderboard" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Pigeon</th>
          <th>Distance (km)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((p, i) => (
          <tr
            key={p.pigeonId}
            style={{
              background: userPigeonIds.includes(p.pigeonId) ? '#e6f7ff' : undefined,
              fontWeight: userPigeonIds.includes(p.pigeonId) ? 'bold' : undefined,
            }}
          >
            <td>{i + 1}</td>
            <td>{p.stats.name}</td>
            <td>{getDistanceAtMinute(currentTime, p).toFixed(2)}</td>
            <td>{p.didNotFinish ? 'DNF' : 'Racing'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RaceLeaderboard; 