import { renderHook, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { useRaceReplayData } from '../useRaceReplayData';
import { supabase } from '../../services/supabase';
import type { PigeonRaceResult } from '../../types/race';

vi.mock('../../services/supabase');

type SupabaseQueryMock = {
  select: () => SupabaseQueryMock;
  eq: () => SupabaseQueryMock;
  data?: unknown;
  error?: unknown;
};

describe('useRaceReplayData', () => {
  const raceId = 'race-1';
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from = vi.fn() as Mock;
  });

  it('returns loading state initially', () => {
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    } as SupabaseQueryMock);
    const { result } = renderHook(() => useRaceReplayData(raceId, userId));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data when fetch succeeds', async () => {
    const mockResults: PigeonRaceResult[] = [
      { pigeonId: 'p1', duration: 100, events: [], stats: {} as PigeonRaceResult['stats'], startTime: '', distanceKm: 1000, baseSpeed: 60 },
      { pigeonId: 'p2', duration: 120, events: [], stats: {} as PigeonRaceResult['stats'], startTime: '', distanceKm: 1000, baseSpeed: 55 },
    ];
    (supabase.from as Mock)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        data: mockResults,
        error: null,
      } as SupabaseQueryMock)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        data: [{ id: 'p1' } as { id: string }],
        error: null,
      } as SupabaseQueryMock);
    const { result } = renderHook(() => useRaceReplayData(raceId, userId));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const pigeons = result.current.pigeons as PigeonRaceResult[];
    const userPigeonIds = result.current.userPigeonIds as string[];
    expect(pigeons.length).toBe(2);
    expect(userPigeonIds).toEqual(['p1']);
    expect(result.current.raceDuration).toBe(120);
    expect(result.current.error).toBeNull();
  });

  it('returns error if race results fetch fails', async () => {
    (supabase.from as Mock)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        data: null,
        error: { message: 'fail' },
      } as SupabaseQueryMock);
    const { result } = renderHook(() => useRaceReplayData(raceId, userId));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toMatch(/fail/i);
  });

  it('returns error if user pigeons fetch fails', async () => {
    const mockResults: PigeonRaceResult[] = [
      { pigeonId: 'p1', duration: 100, events: [], stats: {} as PigeonRaceResult['stats'], startTime: '', distanceKm: 1000, baseSpeed: 60 },
    ];
    (supabase.from as Mock)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        data: mockResults,
        error: null,
      } as SupabaseQueryMock)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        data: null,
        error: { message: 'fail' },
      } as SupabaseQueryMock);
    const { result } = renderHook(() => useRaceReplayData(raceId, userId));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toMatch(/fail/i);
  });
}); 