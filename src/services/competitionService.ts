import { supabase } from './supabase';
import {
  leagueSchema,
  leagueAssignmentSchema,
  standingSchema,
  aiNameSchema,
  type League,
  type LeagueAssignment,
  type Standing,
  type AIName,
} from '../types/competitionSchema';
import { pigeonService } from './pigeonService';

/**
 * Service for managing competitions, leagues, assignments, standings, and AI players.
 * All methods are async, strictly typed, and use zod validation.
 */
export const competitionService = {
  /**
   * Get all leagues.
   */
  async getLeagues(): Promise<League[]> {
    const { data, error } = await supabase.from('leagues').select('*');
    if (error) throw error;
    return leagueSchema.array().parse(data);
  },

  /**
   * Get all league assignments for a season.
   */
  async getLeagueAssignments(seasonId: string): Promise<LeagueAssignment[]> {
    const { data, error } = await supabase
      .from('league_assignments')
      .select('*')
      .eq('season_id', seasonId);
    if (error) throw error;
    return leagueAssignmentSchema.array().parse(data);
  },

  /**
   * Helper: Get the least-filled 2nd division league for a season.
   */
  async getLeastFilledSecondDivision(seasonId: string): Promise<League | null> {
    const { data: leagues, error } = await supabase
      .from('leagues')
      .select('*')
      .in('type', ['2a', '2b'])
      .eq('is_active', true);
    if (error) throw error;
    if (!leagues) return null;
    let minCount = Infinity;
    let targetLeague: League | null = null;
    for (const league of leagues) {
      const { count } = await supabase
        .from('league_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id)
        .eq('season_id', seasonId);
      if ((count ?? 0) < minCount) {
        minCount = count ?? 0;
        targetLeague = leagueSchema.parse(league);
      }
    }
    return targetLeague;
  },

  /**
   * Assign a user (human or AI) to a league for a season.
   * Handles league balancing and AI filling.
   * Ensures no league exceeds 20 players.
   */
  async assignUserToLeague(userId: string, seasonId: string, isAI: boolean): Promise<LeagueAssignment> {
    // Find the least-filled 2nd division league
    const league = await this.getLeastFilledSecondDivision(seasonId);
    if (!league) throw new Error('No available 2nd division league');
    // Check if league is full
    const { count } = await supabase
      .from('league_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('league_id', league.id)
      .eq('season_id', seasonId);
    if ((count ?? 0) >= 20) throw new Error('All 2nd division leagues are full');
    // Assign user to league
    const { data, error } = await supabase
      .from('league_assignments')
      .insert({
        user_id: userId,
        league_id: league.id,
        season_id: seasonId,
        is_ai: isAI,
        last_active: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return leagueAssignmentSchema.parse(data);
  },

  /**
   * Helper: Fill empty slots in all leagues with AI players for a season.
   * TODO: Implement AI creation and assignment logic.
   */
  async fillLeaguesWithAI(): Promise<void> {
    // For each 2nd division league, fill up to 20 with AI
    const { data: leagues } = await supabase
      .from('leagues')
      .select('*')
      .in('type', ['2a', '2b']);
    if (!leagues) return;
    for (const league of leagues) {
      const { count } = await supabase
        .from('league_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id)
        // TODO: Add seasonId filter if needed
      const aiToAdd = 20 - (count ?? 0);
      for (let i = 0; i < aiToAdd; i++) {
        // TODO: Create AI user, get unique AI name, and assign to league
        // await this.assignUserToLeague(aiUserId, seasonId, true);
      }
    }
  },

  /**
   * Get standings for a league and season.
   */
  async getStandings(leagueId: string, seasonId: string): Promise<Standing[]> {
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('league_id', leagueId)
      .eq('season_id', seasonId)
      .order('rank', { ascending: true });
    if (error) throw error;
    return standingSchema.array().parse(data);
  },

  /**
   * Update standings for a league and season with new results.
   * TODO: Implement points calculation and update logic.
   */
  async updateStandings(leagueId: string, seasonId: string, results: Array<{ user_id: string; points: number; tiebreaker_points?: number }>): Promise<void> {
    // TODO: Implement batch update of standings based on results
    // For now, stub out logic
    for (const result of results) {
      await supabase
        .from('standings')
        .upsert({
          user_id: result.user_id,
          league_id: leagueId,
          season_id: seasonId,
          points: result.points,
          tiebreaker_points: result.tiebreaker_points ?? 0,
          updated_at: new Date().toISOString(),
        });
    }
  },

  /**
   * Handle season transition: promotion/relegation, AI replacement, league balancing.
   * Implements automatic movement of players between leagues at season end.
   */
  async handleSeasonTransition(): Promise<void> {
    // Helper: Retire pigeons for replaced users
    const retirePigeonsForUsers = async (userIds: string[]) => {
      for (const userId of userIds) {
        // Delete all pigeons owned by this user
        const { error } = await supabase
          .from('pigeons')
          .delete()
          .eq('owner_id', userId);
        if (error) {
          console.error(`Failed to retire pigeons for user ${userId}:`, error);
        } else {
          console.log(`Retired all pigeons for user ${userId}`);
        }
        // TODO: Notify user of retirement if needed
      }
    };
    // 1. Get all leagues
    const leagues = await this.getLeagues();
    const pro = leagues.find(l => l.type === 'pro');
    const twoA = leagues.find(l => l.type === '2a');
    const twoB = leagues.find(l => l.type === '2b');
    if (!pro || !twoA || !twoB) throw new Error('Required leagues not found');

    // 2. Get current season (TODO: fetch actual current season)
    const currentSeasonId = 'CURRENT_SEASON_ID'; // Placeholder

    // 3. Get standings for each league (regional all pigeons only)
    const proStandings = await this.getStandings(pro.id, currentSeasonId);
    const twoAStandings = await this.getStandings(twoA.id, currentSeasonId);
    const twoBStandings = await this.getStandings(twoB.id, currentSeasonId);

    // 4. Sort standings by points, then tiebreaker (international race)
    const sortFn = (a: Standing, b: Standing) =>
      b.points - a.points || b.tiebreaker_points - a.tiebreaker_points;
    proStandings.sort(sortFn);
    twoAStandings.sort(sortFn);
    twoBStandings.sort(sortFn);

    // 5. Identify relegated and promoted players
    const relegated = proStandings.slice(-4); // bottom 4
    const promotedA = twoAStandings.slice(0, 2); // top 2
    const promotedB = twoBStandings.slice(0, 2); // top 2

    // 6. Create new season (placeholder logic)
    const newSeasonName = `Season ${Date.now()}`;
    const newSeason = await supabase
      .from('seasons')
      .insert({
        name: newSeasonName,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // +30 days
        is_active: true,
      })
      .select()
      .single();
    const newSeasonId = newSeason.data?.id || 'NEW_SEASON_ID';

    // 7. Assign promoted and relegated users to new leagues for new season
    // - Move relegated: 2 to 2A, 2 to 2B
    // - Move promoted: 2 from 2A and 2 from 2B to Pro
    const assignments = [];
    // Pro: keep top 16, add 2 from 2A, 2 from 2B
    const proKeep = proStandings.slice(0, 16);
    const proNext = [...proKeep, ...promotedA, ...promotedB];
    for (const user of proNext) {
      assignments.push({
        user_id: user.user_id,
        league_id: pro.id,
        season_id: newSeasonId,
        is_ai: false, // TODO: check if user is AI
        last_active: new Date().toISOString(),
      });
    }
    // 2A: top 18 (not promoted), 2 relegated from Pro
    const twoANext = [
      ...twoAStandings.slice(2, 20),
      ...relegated.slice(0, 2),
    ];
    for (const user of twoANext) {
      assignments.push({
        user_id: user.user_id,
        league_id: twoA.id,
        season_id: newSeasonId,
        is_ai: false,
        last_active: new Date().toISOString(),
      });
    }
    // 2B: top 18 (not promoted), 2 relegated from Pro
    const twoBNext = [
      ...twoBStandings.slice(2, 20),
      ...relegated.slice(2, 4),
    ];
    for (const user of twoBNext) {
      assignments.push({
        user_id: user.user_id,
        league_id: twoB.id,
        season_id: newSeasonId,
        is_ai: false,
        last_active: new Date().toISOString(),
      });
    }
    // 8. Fill empty slots with AI
    const fillWithAI = async (leagueId: string, needed: number) => {
      if (needed <= 0) return;
      const aiNames = await this.getAvailableAINames();
      for (let i = 0; i < needed; i++) {
        const aiName = aiNames[i % aiNames.length]?.name || `AI Player ${Date.now()}_${i}`;
        // Create AI user in users table
        const { data: aiUser, error } = await supabase
          .from('users')
          .insert({
            username: aiName,
            email: `ai_${Date.now()}_${i}@ai.pigeon`,
            player_type: 'ai',
            balance: 1000,
            total_pigeons: 0,
            pigeon_cap: 50,
            level: 1,
            experience: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error || !aiUser) {
          console.error('Failed to create AI user:', error);
          continue;
        }
        // Assign AI user to league
        assignments.push({
          user_id: aiUser.id,
          league_id: leagueId,
          season_id: newSeasonId,
          is_ai: true,
          last_active: new Date().toISOString(),
        });
        // Create starting pigeons for AI user
        for (let j = 0; j < 10; j++) {
          const gender = Math.random() < 0.5 ? 'male' : 'female';
          const years = Math.floor(Math.random() * 3) + 1; // 1-3 years
          const months = Math.floor(Math.random() * 12);
          const days = Math.floor(Math.random() * 30);
          const pigeon = pigeonService.generateRandomPigeon(
            aiUser.id,
            gender,
            years,
            months,
            days
          );
          await supabase.from('pigeons').insert(pigeon);
        }
      }
    };
    // Pro
    await fillWithAI(pro.id, 20 - proNext.length);
    // 2A
    await fillWithAI(twoA.id, 20 - twoANext.length);
    // 2B
    await fillWithAI(twoB.id, 20 - twoBNext.length);
    // 9. Retire pigeons for replaced users (integrated)
    // Identify inactive humans (last_active > 2 months ago and is_ai: false)
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { data: inactiveAssignments } = await supabase
      .from('league_assignments')
      .select('user_id')
      .eq('season_id', currentSeasonId)
      .eq('is_ai', false)
      .lt('last_active', twoMonthsAgo);
    const inactiveUserIds = (inactiveAssignments ?? []).map((a: { user_id: string }) => a.user_id);
    if (inactiveUserIds.length > 0) {
      await retirePigeonsForUsers(inactiveUserIds);
      // Remove inactive users from assignments for new season
      for (const league of [pro, twoA, twoB]) {
        // Remove assignments for inactive users in this league
        for (let i = assignments.length - 1; i >= 0; i--) {
          if (assignments[i].league_id === league.id && inactiveUserIds.includes(assignments[i].user_id)) {
            assignments.splice(i, 1);
          }
        }
      }
      // Fill their slots with AI
      for (const league of [pro, twoA, twoB]) {
        const count = assignments.filter(a => a.league_id === league.id).length;
        await fillWithAI(league.id, 20 - count);
      }
      console.log('Replaced inactive users with AI:', inactiveUserIds);
    }
    // 10. Upsert new league assignments
    for (const assignment of assignments) {
      await supabase
        .from('league_assignments')
        .upsert(assignment);
    }
    // 11. Notify users (optional, stub)
    // TODO: Implement notification logic
    console.log('Season transition complete. New assignments:', assignments.length);
  },

  /**
   * Get a list of available AI names.
   */
  async getAvailableAINames(): Promise<AIName[]> {
    const { data, error } = await supabase.from('ai_names').select('*');
    if (error) throw error;
    return aiNameSchema.array().parse(data);
  },
}; 