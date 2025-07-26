import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { competitionService } from '../competitionService';

// Helper to create a chainable mock for Supabase queries
function createChainableSelectMock(data: unknown) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue({ data }),
  };
  return chain;
}

// Use explicit types
let aiUserInsertCount = 0;
let leagueAssignmentsUpsertCount = 0;
let pigeonsDeleteCount = 0;
let aiPigeonInsertCount = 0;

vi.mock('../supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'leagues') {
        return {
          select: vi.fn().mockReturnValue({ data: [
            { id: 'pro', name: 'Pro', type: 'pro', is_active: true, created_at: '' },
            { id: '2a', name: '2A', type: '2a', is_active: true, created_at: '' },
            { id: '2b', name: '2B', type: '2b', is_active: true, created_at: '' },
          ] }),
        };
      }
      if (table === 'standings') {
        return {
          select: vi.fn().mockReturnValue(createChainableSelectMock([
            // All possible standings for all leagues
            { user_id: 'p1', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 20, rank: 1, tiebreaker_points: 5, updated_at: '' },
            { user_id: 'p2', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 10, rank: 2, tiebreaker_points: 2, updated_at: '' },
            { user_id: 'p3', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 5, rank: 3, tiebreaker_points: 1, updated_at: '' },
            { user_id: 'p4', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 2, rank: 4, tiebreaker_points: 0, updated_at: '' },
            { user_id: 'a1', league_id: '2a', season_id: 'CURRENT_SEASON_ID', points: 15, rank: 1, tiebreaker_points: 3, updated_at: '' },
            { user_id: 'a2', league_id: '2a', season_id: 'CURRENT_SEASON_ID', points: 12, rank: 2, tiebreaker_points: 2, updated_at: '' },
            { user_id: 'a3', league_id: '2a', season_id: 'CURRENT_SEASON_ID', points: 8, rank: 3, tiebreaker_points: 1, updated_at: '' },
            { user_id: 'b1', league_id: '2b', season_id: 'CURRENT_SEASON_ID', points: 14, rank: 1, tiebreaker_points: 2, updated_at: '' },
            { user_id: 'b2', league_id: '2b', season_id: 'CURRENT_SEASON_ID', points: 11, rank: 2, tiebreaker_points: 1, updated_at: '' },
            { user_id: 'b3', league_id: '2b', season_id: 'CURRENT_SEASON_ID', points: 7, rank: 3, tiebreaker_points: 0, updated_at: '' },
          ])),
        };
      }
      if (table === 'ai_names') {
        return {
          select: vi.fn().mockReturnValue({ data: [] }),
        };
      }
      if (table === 'users') {
        const insertImpl = () => {
          aiUserInsertCount++;
          const chain = {
            select: () => chain,
            single: () => ({ data: { id: 'ai_user_id', username: 'AI Player', created_at: '', email: 'ai@example.com' }, error: null }),
          };
          return chain;
        };
        return {
          insert: insertImpl,
        };
      }
      if (table === 'league_assignments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            lt: vi.fn().mockReturnThis(),
            data: [{ user_id: 'inactive_user_id' }],
          }),
          insert: () => {
            const chain = {
              select: () => chain,
              single: () => ({ data: { id: 'assignment_id', error: null } }),
            };
            return chain;
          },
          upsert: () => {
            leagueAssignmentsUpsertCount++;
            return { data: {}, error: null };
          },
        };
      }
      if (table === 'pigeons') {
        return {
          delete: () => {
            pigeonsDeleteCount++;
            return {
              eq: () => ({ error: null }),
            };
          },
          insert: () => {
            aiPigeonInsertCount++;
            return { data: {}, error: null };
          },
        };
      }
      if (table === 'seasons') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnValue({ data: { id: 'CURRENT_SEASON_ID', name: 'Spring 2024', start_date: '2024-03-01', end_date: '2024-06-01', is_active: true, created_at: '' } }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnValue({ data: { id: 'NEW_SEASON_ID', name: 'Summer 2024', start_date: '2024-06-02', end_date: '2024-09-01', is_active: true, created_at: '' }, error: null }),
          }),
        };
        return chain;
      }
      // fallback for any other table
      const fallbackInsertSelectSpy = vi.fn();
      const fallbackInsertSingleSpy = vi.fn().mockReturnValue({ data: {}, error: null });
      const fallbackInsert = vi.fn().mockImplementation(() => {
        const chain = {
          select: fallbackInsertSelectSpy,
          single: fallbackInsertSingleSpy,
        };
        fallbackInsertSelectSpy.mockReturnValue(chain);
        return chain;
      });
      return {
        select: vi.fn().mockReturnValue({ data: [] }),
        insert: fallbackInsert,
        upsert: vi.fn(),
        delete: vi.fn(),
      };
    },
  },
}));

describe('competitionService.handleSeasonTransition (integration)', () => {
  beforeEach(() => {
    aiUserInsertCount = 0;
    leagueAssignmentsUpsertCount = 0;
    pigeonsDeleteCount = 0;
    aiPigeonInsertCount = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('promotes, relegates, fills with AI, and retires pigeons', async () => {
    // Act
    await competitionService.handleSeasonTransition();

    // Assert: check that AI user was created and DB ops were called
    expect(aiUserInsertCount).toBeGreaterThan(0); // AI user creation
    expect(leagueAssignmentsUpsertCount).toBeGreaterThan(0); // League assignments upsert
    expect(pigeonsDeleteCount).toBeGreaterThan(0); // Pigeon retirement
    expect(aiPigeonInsertCount).toBeGreaterThan(0); // AI pigeons created
    // Add more specific assertions as needed
  });
}); 