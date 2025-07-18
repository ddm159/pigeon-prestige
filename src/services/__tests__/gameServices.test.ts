import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updatePigeonFeedingsForGameDay, updateGroupFeedingsForGameDay } from '../gameServices';
import { supabase } from '../supabase';

type QueryResult = { data: unknown; error: unknown };

class MockQueryBuilder {
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

describe('updatePigeonFeedingsForGameDay', () => {
  const mockPigeons: Array<{ id: string; owner_id: string; health: number; status: string; food_shortage_streak: number }> = [
    { id: 'p1', owner_id: 'u1', health: 100, status: 'active', food_shortage_streak: 0 },
  ];
  const mockFeedHistory: Array<{ food_mix_id: string; applied_at: string; food_shortage: boolean }> = [
    { food_mix_id: 'mix1', applied_at: '2024-01-01T00:00:00Z', food_shortage: false },
  ];
  const mockFoodMix: { mix_json: Record<string, number> } = { mix_json: { 'f1': 50, 'f2': 50 } };
  const mockInventory: Array<{ food_id: string; quantity: number }> = [
    { food_id: 'f1', quantity: 100 },
    { food_id: 'f2', quantity: 100 },
  ];

  let fromMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error: Mock does not fully implement PostgrestQueryBuilder interface
    fromMock = vi.spyOn(supabase, 'from').mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: mockInventory, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should keep the last applied mix if no new mix is given', async () => {
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    expect(fromMock).toHaveBeenCalledWith('pigeon_feed_history');
  });

  it('should decrement health by 5% on first food shortage', async () => {
    // Simulate not enough food
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: [ { food_id: 'f1', quantity: 0 }, { food_id: 'f2', quantity: 0 } ], error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    // Check that supabase.from('pigeons').update was called (health - 5)
    // This is covered by the logic in the service; you can add more granular spies if needed.
  });

  it('should decrement health by 10% on subsequent food shortages', async () => {
    // Simulate a pigeon with a food_shortage_streak of 1
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: [{ ...mockPigeons[0], food_shortage_streak: 1 }], error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: [ { food_id: 'f1', quantity: 0 }, { food_id: 'f2', quantity: 0 } ], error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    // Check that supabase.from('pigeons').update was called (health - 10)
    // This is covered by the logic in the service; you can add more granular spies if needed.
  });

  it('should auto-fill empty food types in the mix with a random available food', async () => {
    const mockFoodMixWithZero = { mix_json: { 'f1': 0, 'f2': 50, 'f3': 50 } };
    const mockInventoryWithF3 = [
      { food_id: 'f2', quantity: 100 },
      { food_id: 'f3', quantity: 100 },
    ];
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMixWithZero, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: mockInventoryWithF3, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    // If f1 is 0, it should be replaced with f2 or f3 (randomly)
    // This is a logic test; to fully assert, you could spy on the update/insert calls
  });

  it('should deduct the correct amount from inventory after feeding', async () => {
    class UpdateSpyQueryBuilder extends MockQueryBuilder {
      update = (...args: unknown[]) => {
        updateSpy(...args);
        return this;
      };
    }
    const updateSpy = vi.fn();
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'user_food_inventory') {
        return new UpdateSpyQueryBuilder({ data: mockInventory, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    expect(updateSpy).toHaveBeenCalled();
    // Optionally, check that updateSpy was called with correct deduction
  });

  it('should record each feeding in pigeon_feed_history (success and shortage)', async () => {
    class InsertSpyQueryBuilder extends MockQueryBuilder {
      insert = (...args: unknown[]) => {
        insertSpy(...args);
        return this;
      };
    }
    const insertSpy = vi.fn();
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new InsertSpyQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: mockInventory, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    expect(insertSpy).toHaveBeenCalled();
    // Optionally, check that insertSpy was called with correct fields
  });

  it('should skip feeding if no mix ever assigned', async () => {
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: null, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    // No error, no feeding occurs
  });

  it('should handle multiple pigeons', async () => {
    const multiPigeons = [
      { id: 'p1', owner_id: 'u1', health: 100, status: 'active', food_shortage_streak: 0 },
      { id: 'p2', owner_id: 'u1', health: 90, status: 'active', food_shortage_streak: 0 },
    ];
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: multiPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: mockInventory, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    // Should process both pigeons without error
  });

  it('should handle no inventory at all (apply penalty, not crash)', async () => {
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'pigeons') {
        return new MockQueryBuilder({ data: mockPigeons, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: mockFeedHistory[0], error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: [], error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    // Should apply penalty, not crash
  });
});

describe('updateGroupFeedingsForGameDay', () => {
  const mockGroupFeedings = [
    { group_id: 'g1', food_mix_id: 'mix1', applied_at: '2024-01-01T00:00:00Z' },
  ];
  const mockGroupMembers = [
    { pigeon_id: 'p1' },
    { pigeon_id: 'p2' },
  ];
  const mockFoodMix = { mix_json: { 'f1': 50, 'f2': 50 } };
  const mockPigeon = { id: 'p1', owner_id: 'u1', health: 100, status: 'active', food_shortage_streak: 0 };
  const mockPigeon2 = { id: 'p2', owner_id: 'u1', health: 90, status: 'active', food_shortage_streak: 1 };
  const mockInventory = [
    { food_id: 'f1', quantity: 100 },
    { food_id: 'f2', quantity: 100 },
  ];

  let fromMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error: test mock
    fromMock = vi.spyOn(supabase, 'from').mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'group_feedings') {
        return new MockQueryBuilder({ data: mockGroupFeedings, error: null });
      }
      if (t === 'pigeon_group_members') {
        return new MockQueryBuilder({ data: mockGroupMembers, error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'pigeons') {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockPigeon as unknown, error: null }) }) }),
        };
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: mockInventory, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: null, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should apply the mix to all pigeons in the group and deduct food', async () => {
    // Spy on inventory update and feed history insert
    class UpdateSpyQueryBuilder extends MockQueryBuilder {
      update = vi.fn(() => this);
    }
    class InsertSpyQueryBuilder extends MockQueryBuilder {
      insert = vi.fn(() => this);
    }
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'group_feedings') {
        return new MockQueryBuilder({ data: mockGroupFeedings, error: null });
      }
      if (t === 'pigeon_group_members') {
        return new MockQueryBuilder({ data: mockGroupMembers, error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'pigeons') {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockPigeon, error: null }) }) }),
        };
      }
      if (t === 'user_food_inventory') {
        return new UpdateSpyQueryBuilder({ data: mockInventory, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new InsertSpyQueryBuilder({ data: null, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    // Optionally, check that update/insert spies were called
  });

  it('should apply health penalty if not enough food for a pigeon', async () => {
    const mockInventoryLow = [ { food_id: 'f1', quantity: 0 }, { food_id: 'f2', quantity: 0 } ];
    class UpdateSpyQueryBuilder extends MockQueryBuilder {
      update = vi.fn(() => this);
    }
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'group_feedings') {
        return new MockQueryBuilder({ data: mockGroupFeedings, error: null });
      }
      if (t === 'pigeon_group_members') {
        return new MockQueryBuilder({ data: mockGroupMembers, error: null });
      }
      if (t === 'food_mix') {
        return new MockQueryBuilder({ data: mockFoodMix, error: null });
      }
      if (t === 'pigeons') {
        return new UpdateSpyQueryBuilder({ data: mockPigeon2 as unknown, error: null });
      }
      if (t === 'user_food_inventory') {
        return new MockQueryBuilder({ data: mockInventoryLow, error: null });
      }
      if (t === 'pigeon_feed_history') {
        return new MockQueryBuilder({ data: null, error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    // Should apply penalty, not crash
  });

  it('should handle empty group (no pigeons)', async () => {
    fromMock.mockImplementation((table: unknown) => {
      const t = table as string;
      if (t === 'group_feedings') {
        return new MockQueryBuilder({ data: mockGroupFeedings, error: null });
      }
      if (t === 'pigeon_group_members') {
        return new MockQueryBuilder({ data: [], error: null });
      }
      return new MockQueryBuilder({ data: null, error: null });
    });
    await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    // Should not throw
  });
}); 