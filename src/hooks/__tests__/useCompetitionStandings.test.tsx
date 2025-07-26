import { renderHook, waitFor } from '@testing-library/react';
import { useCompetitionStandings } from '../useCompetitionStandings';
import { competitionService } from '../../services/competitionService';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useCompetitionStandings', () => {
  const mockLeagues: Array<{ id: string; name: string; type: '2a' | 'pro'; is_active: boolean; created_at: string }> = [
    { id: 'l1', name: 'Regional 2A', type: '2a', is_active: true, created_at: '' },
    { id: 'l2', name: 'Pro', type: 'pro', is_active: true, created_at: '' },
  ];
  const mockStandings = [
    {
      user_id: 'user1',
      league_id: 'league1',
      season_id: 'season1',
      points: 10,
      rank: 1,
      position: 1,
      tiebreaker_points: 0,
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      user_id: 'user2',
      league_id: 'league1',
      season_id: 'season1',
      points: 8,
      rank: 2,
      position: 2,
      tiebreaker_points: 0,
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.spyOn(competitionService, 'getLeagues').mockResolvedValue(mockLeagues);
    vi.spyOn(competitionService, 'getStandings').mockResolvedValue(mockStandings);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns standings data after loading', async () => {
    const { result } = renderHook(() =>
      useCompetitionStandings('2a', 'all', 's1')
    );
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.standings).toEqual(mockStandings);
    expect(result.current.error).toBeNull();
  });

  it('handles error if league not found', async () => {
    vi.spyOn(competitionService, 'getLeagues').mockResolvedValue([]);
    const { result } = renderHook(() =>
      useCompetitionStandings('2a', 'all', 's1')
    );
    await waitFor(() => expect(result.current.error).toBe('League not found'));
    expect(result.current.standings).toEqual([]);
  });

  it('handles error if getStandings throws', async () => {
    vi.spyOn(competitionService, 'getStandings').mockRejectedValue(new Error('Failed to fetch'));
    const { result } = renderHook(() =>
      useCompetitionStandings('2a', 'all', 's1')
    );
    await waitFor(() => expect(result.current.error).toBe('Failed to fetch'));
    expect(result.current.standings).toEqual([]);
  });
}); 