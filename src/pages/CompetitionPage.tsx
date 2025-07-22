import React, { useState, useMemo } from 'react';
import { useCompetitionStandings } from '../hooks/useCompetitionStandings';
import { useUsernames } from '../hooks/useUsernames';
import { useCurrentSeason } from '../hooks/useCurrentSeason';
import { useAuth } from '../contexts/useAuth';
// Removed: import { BestPigeonsOverview } from '../components/BestPigeonsOverview';

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

const CompetitionPage: React.FC = () => {
  // All hooks at the top, always called in the same order
  const { user } = useAuth();
  const currentUserId = user?.id || '';

  const { season, loading: seasonLoading, error: seasonError } = useCurrentSeason();

  const [selectedLeague, setSelectedLeague] = useState('2a');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { standings, loading, error } = useCompetitionStandings(
    selectedLeague as 'pro' | '2a' | '2b' | 'international',
    selectedCategory as 'all' | 'u1',
    season?.id || ''
  );

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const userIds = useMemo(
    () => standings.map((row) => row.user_id).filter(id => uuidRegex.test(id)),
    [standings]
  );
  const { usernames, loading: usernamesLoading } = useUsernames(userIds);

  // Handle loading and error states in the render
  if (seasonLoading) return <div>Loading season...</div>;
  if (seasonError) return <div>Error: {seasonError}</div>;
  if (!season) return <div>No active season found.</div>;

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
                <tr key={row.user_id}
                  style={isCurrentUser ? { background: '#e0f7fa', fontWeight: 'bold', color: '#00796b' } : undefined}
                >
                  <td>{row.position ?? '-'}</td>
                  <td>{usernamesLoading ? '...' : usernames[row.user_id] || row.user_id}</td>
                  <td>{row.points}</td>
                  <td>{row.tiebreaker_points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* <BestPigeonsOverview
        competitionType={selectedLeague as 'pro' | '2a' | '2b' | 'international'}
        category={selectedCategory as 'all' | 'u1'}
        seasonId={currentSeasonId}
        currentUserId={currentUserId}
      /> */}
    </div>
  );
};

export default CompetitionPage; 