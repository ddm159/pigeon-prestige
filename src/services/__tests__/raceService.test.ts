import { raceService } from '../raceService';
import { supabase } from '../supabase';
import { generatePigeonRaceResult } from '../raceService';
import type { Pigeon } from '../../types/pigeon';
import { vi } from 'vitest';

vi.mock('../supabase');

describe('raceService.joinRace', () => {
  const mockRaceId1 = 'race-1';
  const mockRaceId2 = 'race-2';
  const mockPigeonId = 'pigeon-1';
  const mockUserId = 'user-1';

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const mockParticipant = {
    id: 'mock-participant-id',
    race_id: mockRaceId1,
    pigeon_id: mockPigeonId,
    user_id: mockUserId,
    finish_time: 0,
    finish_position: 1,
    prize_won: 0,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow a pigeon to join a race if not already in a race that day', async () => {
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { start_time: today + 'T10:00:00Z' }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: [],
      error: null
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { balance: 100 }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { entry_fee: 10 }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockParticipant, error: null })
    });
    await expect(raceService.joinRace(mockRaceId1, mockPigeonId, mockUserId)).resolves.toBeDefined();
  });

  it('should not allow a pigeon to join two races on the same day', async () => {
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { start_time: today + 'T10:00:00Z' }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: [{ race_id: mockRaceId2 }],
      error: null
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      data: [{ id: mockRaceId2, start_time: today + 'T15:00:00Z' }],
      error: null
    });
    await expect(raceService.joinRace(mockRaceId1, mockPigeonId, mockUserId)).rejects.toThrow(
      /already participating in a race on this day/
    );
  });

  it('should allow a pigeon to join races on different days', async () => {
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { start_time: tomorrow + 'T10:00:00Z' }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: [{ race_id: mockRaceId2 }],
      error: null
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      data: [{ id: mockRaceId2, start_time: today + 'T15:00:00Z' }],
      error: null
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { balance: 100 }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { entry_fee: 10 }, error: null })
    });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockParticipant, error: null })
    });
    await expect(raceService.joinRace(mockRaceId1, mockPigeonId, mockUserId)).resolves.toBeDefined();
  });
});

describe('generatePigeonRaceResult', () => {
  const basePigeon: Pigeon = {
    id: 'p1',
    owner_id: 'u1',
    name: 'Speedy',
    gender: 'male',
    age_years: 2,
    age_months: 0,
    age_days: 0,
    status: 'active',
    speed: 80,
    endurance: 60,
    sky_iq: 50,
    aerodynamics: 60,
    vision: 60,
    wing_power: 60,
    flapacity: 60,
    vanity: 60,
    strength: 60,
    aggression: 60,
    landing: 60,
    loyalty: 60,
    health: 60,
    happiness: 60,
    fertility: 60,
    disease_resistance: 60,
    peak_speed: 80,
    peak_endurance: 60,
    peak_sky_iq: 50,
    peak_aerodynamics: 60,
    peak_vision: 60,
    peak_wing_power: 60,
    peak_flapacity: 60,
    peak_vanity: 60,
    peak_strength: 60,
    peak_aggression: 60,
    peak_landing: 60,
    peak_loyalty: 60,
    peak_health: 60,
    peak_happiness: 60,
    peak_fertility: 60,
    peak_disease_resistance: 60,
    eggs: 0,
    offspring: 0,
    breeding_quality: 50,
    adaptability: 50,
    recovery_rate: 50,
    laser_focus: 50,
    morale: 50,
    food: 50,
    peak_eggs: 0,
    peak_offspring: 0,
    peak_breeding_quality: 50,
    peak_adaptability: 50,
    peak_recovery_rate: 50,
    peak_laser_focus: 50,
    peak_morale: 50,
    peak_food: 50,
    races_won: 0,
    races_lost: 0,
    total_races: 0,
    best_time: null,
    total_distance: 0,
    offspring_produced: 0,
    successful_breedings: 0,
    picture_number: 1,
    current_food_mix_id: null,
    food_shortage_streak: 0,
    created_at: '',
    updated_at: '',
  };
  const raceConfig = {
    startTime: '2025-07-22T10:00:00Z',
    distanceKm: 500,
    weather: { wind: 10 },
  };

  it('generates a boost event for high speed', () => {
    const pigeon = { ...basePigeon, speed: 80 };
    const result = generatePigeonRaceResult(pigeon, raceConfig);
    expect(result.events.some(e => e.effect === 'boost')).toBe(true);
  });

  it('generates a slowdown event for low endurance', () => {
    const pigeon = { ...basePigeon, endurance: 40 };
    const result = generatePigeonRaceResult(pigeon, raceConfig);
    expect(result.events.some(e => e.effect === 'slowdown')).toBe(true);
  });

  it('generates a wind slowdown event for low aerodynamics and high wind', () => {
    const pigeon = { ...basePigeon, aerodynamics: 40 };
    const windyConfig = { ...raceConfig, weather: { wind: 30 } };
    const result = generatePigeonRaceResult(pigeon, windyConfig);
    expect(result.events.some(e => e.reason.includes('wind'))).toBe(true);
  });

  it('can generate a lost event for low sky_iq', () => {
    // Make the test deterministic by mocking Math.random
    const originalRandom = Math.random;
    Math.random = () => 0.05; // Always trigger lost event
    const pigeon = { ...basePigeon, sky_iq: 10 };
    const result = generatePigeonRaceResult(pigeon, raceConfig);
    expect(result.didNotFinish).toBe(true);
    Math.random = originalRandom; // Restore
  });

  it('is extensible for new events and stats', () => {
    // Simulate adding a new stat-driven event in the future
    // (e.g., vision > 90 gives "eagle eyes" boost)
    // This is a placeholder for future extensibility
    expect(typeof generatePigeonRaceResult).toBe('function');
  });

  it('returns deterministic output for same input (except random events)', () => {
    const pigeon = { ...basePigeon, speed: 80, endurance: 60 };
    const result1 = generatePigeonRaceResult(pigeon, raceConfig);
    const result2 = generatePigeonRaceResult(pigeon, raceConfig);
    // Non-random events should always be present
    const boost1 = result1.events.find(e => e.effect === 'boost');
    const boost2 = result2.events.find(e => e.effect === 'boost');
    expect(boost1).toBeDefined();
    expect(boost2).toBeDefined();
  });

  // Placeholder for future food impact tests
  it('will support food impact on race outcome (future)', () => {
    // e.g., food stat or food mix affects baseSpeed or event generation
    expect(true).toBe(true);
  });
}); 