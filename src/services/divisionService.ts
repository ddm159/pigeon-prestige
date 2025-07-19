import { supabase } from './supabase';
import type { Division, DivisionType, DivisionStats } from '../types/competition';

/**
 * Division Service
 * Handles division-related database operations
 */
export const divisionService = {
  /**
   * Get all divisions
   */
  async getDivisions(): Promise<Division[]> {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('division_code', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get division by code
   */
  async getDivisionByCode(divisionCode: DivisionType): Promise<Division | null> {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .eq('division_code', divisionCode)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get division statistics
   */
  async getDivisionStats(divisionId: string): Promise<DivisionStats | null> {
    const { data, error } = await supabase
      .from('season_standings')
      .select(`
        *,
        divisions!inner(division_code),
        users!inner(username, player_type)
      `)
      .eq('division_id', divisionId);
    
    if (error) throw error;
    if (!data || data.length === 0) return null;

    const playerCount = data.filter(s => s.users.player_type === 'human').length;
    const aiPlayerCount = data.filter(s => s.users.player_type === 'ai').length;
    const averagePoints = data.reduce((sum, s) => sum + s.total_points, 0) / data.length;

    // Get promotion/relegation zones based on division
    const division = data[0].divisions;
    let promotionZone: string[] = [];
    let relegationZone: string[] = [];

    if (division.division_code === '1') {
      // Division 1: bottom 4 get relegated
      relegationZone = data
        .sort((a, b) => a.total_points - b.total_points)
        .slice(0, 4)
        .map(s => s.users.username);
    } else if (division.division_code === '2A' || division.division_code === '2B') {
      // Division 2A/2B: top 2 get promoted
      promotionZone = data
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 2)
        .map(s => s.users.username);
    }

    return {
      divisionId,
      divisionCode: division.division_code,
      playerCount,
      aiPlayerCount,
      averagePoints,
      promotionZone,
      relegationZone
    };
  }
}; 