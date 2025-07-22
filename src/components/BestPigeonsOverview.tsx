import React from 'react';
import { useBestPigeons } from '../hooks/useBestPigeons';
import { useUsernames } from '../hooks/useUsernames';

/**
 * Props for BestPigeonsOverview
 */
interface BestPigeonsOverviewProps {
  competitionType: 'pro' | '2a' | '2b' | 'international';
  category: 'all' | 'u1';
  seasonId: string;
  currentUserId: string;
}

/**
 * BestPigeonsOverview displays the top pigeons by points for a given competition.
 * Highlights the current user's pigeons in a distinct color.
 * Follows professional guidelines for UI/logic separation, accessibility, and extensibility.
 */
export const BestPigeonsOverview: React.FC<BestPigeonsOverviewProps> = ({
  competitionType,
  category,
  seasonId,
  currentUserId,
}) => {
  const { pigeons, loading, error } = useBestPigeons(
    competitionType,
    category,
    seasonId
  );
  // Fetch usernames for all owner_ids in pigeons
  const ownerIds = pigeons.map((p) => p.owner_id);
  const { usernames, loading: usernamesLoading } = useUsernames(ownerIds);

  return (
    <div style={{ marginTop: 32 }}>
      <h2>Best Pigeons Overview</h2>
      {loading ? (
        <div>Loading best pigeons...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : (
        <table aria-label="Best pigeons">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Pigeon</th>
              <th>Owner</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {pigeons.map((pigeon, idx) => {
              const isCurrentUser = pigeon.owner_id === currentUserId;
              return (
                <tr
                  key={pigeon.id}
                  style={
                    isCurrentUser
                      ? { background: '#fff3e0', fontWeight: 'bold', color: '#e65100' }
                      : undefined
                  }
                >
                  <td>{idx + 1}</td>
                  {/* TODO: Replace with pigeon name lookup if needed */}
                  <td>{pigeon.name}</td>
                  <td>
                    {usernamesLoading
                      ? '...'
                      : usernames[pigeon.owner_id] || pigeon.owner_id}
                  </td>
                  <td>{pigeon.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BestPigeonsOverview; 