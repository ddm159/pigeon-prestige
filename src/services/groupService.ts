import { supabase } from './supabase';
import type { PigeonGroup, Pigeon } from '../types/pigeon';

/**
 * Group Services
 */
export const groupService = {
  // Create a new group
  async createGroup(ownerId: string, name: string, description?: string): Promise<PigeonGroup> {
    const { data, error } = await supabase
      .from('pigeon_groups')
      .insert({ owner_id: ownerId, name, description })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update group name/description
  async updateGroup(groupId: string, name: string, description?: string): Promise<PigeonGroup> {
    const { data, error } = await supabase
      .from('pigeon_groups')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete a group
  async deleteGroup(groupId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeon_groups')
      .delete()
      .eq('id', groupId);
    if (error) throw error;
  },

  // Get all groups for a user
  async getGroupsForUser(ownerId: string): Promise<PigeonGroup[]> {
    const { data: groups, error } = await supabase
      .from('pigeon_groups')
      .select('*, pigeon_group_members(count)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    // Add size property from pigeon_group_members count
    return (groups || []).map((g: { pigeon_group_members?: Array<{ count: number }> } & PigeonGroup) => ({
      ...g,
      size: g.pigeon_group_members?.length ? g.pigeon_group_members[0].count : 0,
    }));
  },

  // Add a pigeon to a group
  async addPigeonToGroup(groupId: string, pigeonId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeon_group_members')
      .insert({ group_id: groupId, pigeon_id: pigeonId });
    if (error) throw error;
  },

  // Remove a pigeon from a group
  async removePigeonFromGroup(groupId: string, pigeonId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeon_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('pigeon_id', pigeonId);
    if (error) throw error;
  },

  // Get all pigeons in a group (with pigeon data)
  async getPigeonsInGroup(groupId: string): Promise<Pigeon[]> {
    const { data, error } = await supabase
      .from('pigeon_group_members')
      .select('pigeon_id, pigeons(*)')
      .eq('group_id', groupId);
    if (error) throw error;
    // data is array of { pigeon_id, pigeons: { ...pigeon fields } }
    return (data || []).flatMap((row: { pigeons: Pigeon[] }) => row.pigeons);
  },
}; 