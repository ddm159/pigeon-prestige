import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { competitionService } from '../competitionService';

// Helper to create a chainable mock for Supabase queries
function createChainableSelectMock(data: any) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue({ data }),
  };
  return chain;
}

// Mock supabase
const mockInsert = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();

// Define spies at module scope
let usersInsertSpy: any;
let aiUserInsertCount = 0;
let leagueAssignmentsInsertCount = 0;
let leagueAssignmentsUpsertCount = 0;
let pigeonsDeleteCount = 0;

const usersInsertSingleSpy = () => ({ data: { id: 'ai_user_id', username: 'AI Player', created_at: '', email: 'ai@example.com' }, error: null });
const usersInsertSelectSpy = vi.fn();

const leagueAssignmentsInsertSingleSpy = () => ({ data: { id: 'assignment_id', error: null } });
const leagueAssignmentsInsertSelectSpy = vi.fn();
const leagueAssignmentsInsertSpy = vi.fn().mockImplementation(() => {
  let chain: any;
  chain = {
    select: vi.fn(() => chain),
    single: leagueAssignmentsInsertSingleSpy,
  };
  return chain;
});
const leagueAssignmentsUpsertSpy = vi.fn().mockReturnValue({ data: {}, error: null });
const pigeonsDeleteSpy = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({ error: null }),
});

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
            { user_id: 'p1', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 20, position: 1, tiebreaker_points: 5, updated_at: '' },
            { user_id: 'p2', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 10, position: 2, tiebreaker_points: 2, updated_at: '' },
            { user_id: 'p3', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 5, position: 3, tiebreaker_points: 1, updated_at: '' },
            { user_id: 'p4', league_id: 'pro', season_id: 'CURRENT_SEASON_ID', points: 2, position: 4, tiebreaker_points: 0, updated_at: '' },
            { user_id: 'a1', league_id: '2a', season_id: 'CURRENT_SEASON_ID', points: 15, position: 1, tiebreaker_points: 3, updated_at: '' },
            { user_id: 'a2', league_id: '2a', season_id: 'CURRENT_SEASON_ID', points: 12, position: 2, tiebreaker_points: 2, updated_at: '' },
            { user_id: 'a3', league_id: '2a', season_id: 'CURRENT_SEASON_ID', points: 8, position: 3, tiebreaker_points: 1, updated_at: '' },
            { user_id: 'b1', league_id: '2b', season_id: 'CURRENT_SEASON_ID', points: 14, position: 1, tiebreaker_points: 2, updated_at: '' },
            { user_id: 'b2', league_id: '2b', season_id: 'CURRENT_SEASON_ID', points: 11, position: 2, tiebreaker_points: 1, updated_at: '' },
            { user_id: 'b3', league_id: '2b', season_id: 'CURRENT_SEASON_ID', points: 7, position: 3, tiebreaker_points: 0, updated_at: '' },
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
        usersInsertSpy = vi.fn(insertImpl);
        return {
          insert: usersInsertSpy,
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
          insert: (...args: any[]) => {
            leagueAssignmentsInsertCount++;
            const chain = {
              select: () => chain,
              single: () => ({ data: { id: 'assignment_id', error: null } }),
            };
            return chain;
          },
          upsert: (...args: any[]) => {
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

function resetSupabaseMocks() {
  if (usersInsertSpy && usersInsertSpy.mockReset) usersInsertSpy.mockReset();
  leagueAssignmentsInsertSpy.mockReset();
  leagueAssignmentsUpsertSpy.mockReset();
  pigeonsDeleteSpy.mockReset();
}

describe('competitionService.handleSeasonTransition (integration)', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    aiUserInsertCount = 0;
    leagueAssignmentsInsertCount = 0;
    leagueAssignmentsUpsertCount = 0;
    pigeonsDeleteCount = 0;
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
    // Add more specific assertions as needed
  });
}); 