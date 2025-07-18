import { vi } from 'vitest';
import { supabase } from '../supabase';

export type QueryResult = { data: unknown; error: unknown };

export class MockQueryBuilder {
  private result: QueryResult;
  constructor(result: QueryResult) {
    this.result = result;
  }
  select() { return this; }
  eq() { return this; }
  order() { return this; }
  limit() { return this; }
  single() { return Promise.resolve(this.result); }
  insert() { return this; }
  update() { return this; }
  then(cb: (result: QueryResult) => unknown) { return cb(this.result); }
}

export class SpyQueryBuilder extends MockQueryBuilder {
  private spy: ReturnType<typeof vi.fn>;
  
  constructor(result: QueryResult, spy: ReturnType<typeof vi.fn>) {
    super(result);
    this.spy = spy;
  }
  
  update(...args: unknown[]) {
    this.spy(...args);
    return this;
  }
  
  insert(...args: unknown[]) {
    this.spy(...args);
    return this;
  }
}

export interface TestData {
  pigeons: Array<{ id: string; owner_id: string; health: number; status: string; food_shortage_streak: number; current_food_mix_id?: string }>;
  foodMix: { mix_json: Record<string, number> };
  inventory: Array<{ food_id: string; quantity: number }>;
  groupFeedings: Array<{ group_id: string; food_mix_id: string; applied_at: string }>;
  groupMembers: Array<{ pigeon_id: string }>;
  pigeonGroups: Array<{ id: string; current_food_mix_id: string }>;
}

export const defaultTestData: TestData = {
  pigeons: [
    { id: 'p1', owner_id: 'u1', health: 100, status: 'active', food_shortage_streak: 0, current_food_mix_id: 'mix1' },
  ],
  foodMix: { mix_json: { 'f1': 50, 'f2': 50 } },
  inventory: [
    { food_id: 'f1', quantity: 100 },
    { food_id: 'f2', quantity: 100 },
  ],
  groupFeedings: [
    { group_id: 'g1', food_mix_id: 'mix1', applied_at: '2024-01-01T00:00:00Z' },
  ],
  groupMembers: [
    { pigeon_id: 'p1' },
    { pigeon_id: 'p2' },
  ],
  pigeonGroups: [
    { id: 'g1', current_food_mix_id: 'mix1' },
  ],
};

export function createMockSupabase(testData: TestData = defaultTestData) {
  // @ts-expect-error: Mock implementation for testing
  return vi.spyOn(supabase, 'from').mockImplementation((table: unknown) => {
    const t = table as string;
    
    switch (t) {
      case 'pigeons':
        return new MockQueryBuilder({ data: testData.pigeons, error: null });
      case 'food_mix':
        return new MockQueryBuilder({ data: testData.foodMix, error: null });
      case 'user_food_inventory':
        return new MockQueryBuilder({ data: testData.inventory, error: null });
      case 'group_feedings':
        return new MockQueryBuilder({ data: testData.groupFeedings, error: null });
      case 'pigeon_group_members':
        return new MockQueryBuilder({ data: testData.groupMembers, error: null });
      case 'pigeon_groups':
        return new MockQueryBuilder({ data: testData.pigeonGroups, error: null });
      case 'pigeon_feed_history':
        return new MockQueryBuilder({ data: null, error: null });
      default:
        return new MockQueryBuilder({ data: null, error: null });
    }
  });
}

export function createSpyMockSupabase(
  testData: TestData = defaultTestData,
  spies: { update?: ReturnType<typeof vi.fn>; insert?: ReturnType<typeof vi.fn> } = {}
) {
  // @ts-expect-error: Mock implementation for testing
  return vi.spyOn(supabase, 'from').mockImplementation((table: unknown) => {
    const t = table as string;
    
    switch (t) {
      case 'pigeons':
        return new MockQueryBuilder({ data: testData.pigeons, error: null });
      case 'food_mix':
        return new MockQueryBuilder({ data: testData.foodMix, error: null });
      case 'user_food_inventory':
        return spies.update 
          ? new SpyQueryBuilder({ data: testData.inventory, error: null }, spies.update)
          : new MockQueryBuilder({ data: testData.inventory, error: null });
      case 'pigeon_feed_history':
        return spies.insert
          ? new SpyQueryBuilder({ data: null, error: null }, spies.insert)
          : new MockQueryBuilder({ data: null, error: null });
      case 'group_feedings':
        return new MockQueryBuilder({ data: testData.groupFeedings, error: null });
      case 'pigeon_group_members':
        return new MockQueryBuilder({ data: testData.groupMembers, error: null });
      case 'pigeon_groups':
        return new MockQueryBuilder({ data: testData.pigeonGroups, error: null });
      default:
        return new MockQueryBuilder({ data: null, error: null });
    }
  });
} 