import { renderHook, act } from '@testing-library/react-hooks';
import { useRaceReplayData } from '../useRaceReplayData';
import { supabase } from '../../services/supabase';

jest.mock('../../services/supabase');

describe('useRaceReplayData', () => {
  const raceId = 'race-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    });
    const { result } = renderHook(() => useRaceReplayData(raceId, userId));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data when fetch succeeds', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        // race_results
        data: [
          { pigeonId: 'p1', duration: 100, events: [], stats: {}, startTime: '', distanceKm: 1000, baseSpeed: 60 },
          { pigeonId: 'p2', duration: 120, events: [], stats: {}, startTime: '', distanceKm: 1000, baseSpeed: 55 },
        ],
        error: null,
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        // user pigeons
        data: [{ id: 'p1' }],
        error: null,
      });
    const { result, waitForNextUpdate } = renderHook(() => useRaceReplayData(raceId, userId));
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.pigeons.length).toBe(2);
    expect(result.current.userPigeonIds).toEqual(['p1']);
    expect(result.current.raceDuration).toBe(120);
    expect(result.current.error).toBeNull();
  });

  it('returns error if race results fetch fails', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: null,
        error: { message: 'fail' },
      });
    const { result, waitForNextUpdate } = renderHook(() => useRaceReplayData(raceId, userId));
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toMatch(/fail/i);
  });

  it('returns error if user pigeons fetch fails', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [{ pigeonId: 'p1', duration: 100, events: [], stats: {}, startTime: '', distanceKm: 1000, baseSpeed: 60 }],
        error: null,
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: null,
        error: { message: 'fail' },
      });
    const { result, waitForNextUpdate } = renderHook(() => useRaceReplayData(raceId, userId));
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toMatch(/fail/i);
  });
}); 