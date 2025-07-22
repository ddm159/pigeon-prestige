import React, { useState } from 'react';
import { useCompetitionStandings } from '../hooks/useCompetitionStandings';
import { useUsernames } from '../hooks/useUsernames';
import { BestPigeonsOverview } from '../components/BestPigeonsOverview';

/**
 * CompetitionPage displays league standings and allows switching between leagues and race categories.
 * Follows professional guidelines for UI/logic separation, accessibility, and extensibility.
 */
const LEAGUE_OPTIONS = [
  { value: 'pro', label: 'Pro' },
  { value: '2a', label: 'Regional 2A' },
  { value: '2b', label: 'Regional 2B' },
  { value: 'international', label: 'International' },
];
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Pigeons' },
  { value: 'u1', label: 'Under 1 Year' },
];

export const CompetitionPage: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState('2a'); // Default to user's main league
  const [selectedCategory, setSelectedCategory] = useState('all');
  // TODO: Fetch current season from service or context
  const currentSeasonId = 'CURRENT_SEASON_ID'; // Placeholder
  // TODO: Get current user ID from auth context
  const currentUserId = 'CURRENT_USER_ID'; // Placeholder

  const { standings, loading, error } = useCompetitionStandings(
    selectedLeague as 'pro' | '2a' | '2b' | 'international',
    selectedCategory as 'all' | 'u1',
    currentSeasonId
  );

  // Fetch usernames for all user_ids in standings
  const userIds = standings.map((row) => row.user_id);
  const { usernames, loading: usernamesLoading } = useUsernames(userIds);

  return (
    <div>
      <h1>Competition Standings</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <label>
          League:
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            aria-label="Select league"
          >
            {LEAGUE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select race category"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <div>Loading standings...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : (
        <table aria-label="League standings">
          <thead>
            <tr>
              <th>Position</th>
              <th>Player</th>
              <th>Points</th>
              <th>Tiebreaker</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const isCurrentUser = row.user_id === currentUserId;
              return (
                <tr
                  key={row.user_id}
                  style={
                    isCurrentUser
                      ? { background: '#e0f7fa', fontWeight: 'bold', color: '#00796b' }
                      : undefined
                  }
                >
                  <td>{row.position ?? '-'}</td>
                  <td>
                    {usernamesLoading
                      ? '...'
                      : usernames[row.user_id] || row.user_id}
                  </td>
                  <td>{row.points}</td>
                  <td>{row.tiebreaker_points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <BestPigeonsOverview
        competitionType={selectedLeague as 'pro' | '2a' | '2b' | 'international'}
        category={selectedCategory as 'all' | 'u1'}
        seasonId={currentSeasonId}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default CompetitionPage; 