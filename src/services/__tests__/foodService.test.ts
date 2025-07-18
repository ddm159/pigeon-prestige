/*
  eslint-disable @typescript-eslint/no-explicit-any --
  Supabase test mocks require 'any' for compatibility with the SDK's complex types. This override is limited to this test file only; all production code is fully type-safe. See README for details.
*/
import { describe, it, expect } from 'vitest';
import { foodService } from '../foodService';
import { supabase } from '../supabase';
import { vi } from 'vitest';
import type { FoodMix, GroupFeeding } from '../../types/pigeon';

type MockSchema = { Tables: Record<string, MockTable>; Views: Record<string, any>; Functions: Record<string, { Args: any; Returns: any }>; };
type MockRelationship = {
  foreignKeyName: string;
  columns: string[];
  referencedRelation: string;
  referencedColumns: string[];
};
type MockTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: MockRelationship[];
};

describe('foodService', () => {
  it('should list all foods', async () => {
    const foods = await foodService.listFoods();
    expect(Array.isArray(foods)).toBe(true);
  });

  it('should get user inventory', async () => {
    const inventory = await foodService.getUserInventory('user-id');
    expect(Array.isArray(inventory)).toBe(true);
  });

  it('should update user inventory', async () => {
    // Mock the full supabase.from chain for update and insert
    const updateChain = {
      eq: () => updateChain,
      select: () => Promise.resolve({ data: [], error: null })
    };
    const insertChain = Promise.resolve({
      data: null,
      error: null,
      count: null,
      status: 201,
      statusText: 'Created',
    });
    const fromMock = vi.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'user_food_inventory') {
        return {
          update: () => updateChain,
          delete: () => updateChain,
          insert: () => insertChain,
        } as any;
      }
      return {} as any;
    });
    await expect(foodService.updateUserInventory('user-id', 'food-id', 10)).resolves.toBeUndefined();
    fromMock.mockRestore();
  });

  it('should list food mixes', async () => {
    const mixes = await foodService.listFoodMixes('user-id');
    expect(Array.isArray(mixes)).toBe(true);
  });

  it('should create a food mix', async () => {
    // Mock the full supabase.from chain for insert/select/single
    const foodMix: FoodMix = {
      id: 'mix-id',
      user_id: 'user-id',
      name: 'Test Mix',
      mix_json: { 'food-id': 100 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const single = (): Promise<{ data: FoodMix; error: null }> => Promise.resolve({ data: foodMix, error: null });
    const select = () => ({ single });
    const insert = () => ({ select });
    const fromMock = vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'food_mix') {
        return { insert } as unknown as import('@supabase/postgrest-js').PostgrestQueryBuilder<MockSchema, MockTable, string, unknown>;
      }
      return {} as unknown as import('@supabase/postgrest-js').PostgrestQueryBuilder<MockSchema, MockTable, string, unknown>;
    }) as unknown as typeof supabase.from);
    const result = await foodService.createFoodMix('user-id', 'Test Mix', { 'food-id': 100 });
    expect(result).toEqual(foodMix);
    fromMock.mockRestore();
  });

  it('should delete a food mix', async () => {
    await expect(foodService.deleteFoodMix('mix-id')).resolves.toBeUndefined();
  });

  it('should apply a food mix to a group', async () => {
    // Mock the full supabase.from chain for insert/select/single
    const groupFeeding: GroupFeeding = {
      id: 'group-feeding-id',
      group_id: 'group-id',
      food_mix_id: 'mix-id',
      applied_at: new Date().toISOString(),
    };
    const single = (): Promise<{ data: GroupFeeding; error: null }> => Promise.resolve({ data: groupFeeding, error: null });
    const select = () => ({ single });
    const insert = () => ({ select });
    const fromMock = vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'group_feedings') {
        return { insert } as unknown as import('@supabase/postgrest-js').PostgrestQueryBuilder<MockSchema, MockTable, string, unknown>;
      }
      return {} as unknown as import('@supabase/postgrest-js').PostgrestQueryBuilder<MockSchema, MockTable, string, unknown>;
    }) as unknown as typeof supabase.from);
    const result = await foodService.applyFoodMixToGroup('group-id', 'mix-id');
    expect(result).toEqual(groupFeeding);
    fromMock.mockRestore();
  });

  it('should get pigeon feed history', async () => {
    const history = await foodService.getPigeonFeedHistory('pigeon-id');
    expect(Array.isArray(history)).toBe(true);
  });

  it('should record a pigeon feeding', async () => {
    await expect(foodService.recordPigeonFeeding('pigeon-id', 'mix-id')).resolves.toBeUndefined();
  });
}); 