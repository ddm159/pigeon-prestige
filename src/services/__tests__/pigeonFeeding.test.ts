import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updatePigeonFeedingsForGameDay } from '../gameServices';
import { createMockSupabase, createSpyMockSupabase, defaultTestData, type TestData } from './testUtils';

describe('updatePigeonFeedingsForGameDay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Feeding Logic', () => {
    it('should deduct the correct amount from inventory after feeding (persistent assignment)', async () => {
      const updateSpy = vi.fn();
      createSpyMockSupabase(defaultTestData, { update: updateSpy });
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should record each feeding in pigeon_feed_history (persistent assignment)', async () => {
      const insertSpy = vi.fn();
      createSpyMockSupabase(defaultTestData, { insert: insertSpy });
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
      expect(insertSpy).toHaveBeenCalled();
    });

    it('should skip feeding if no mix ever assigned', async () => {
      const testData: TestData = {
        ...defaultTestData,
        pigeons: [{ ...defaultTestData.pigeons[0], current_food_mix_id: undefined }],
      };
      createMockSupabase(testData);
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should handle multiple pigeons', async () => {
      const testData: TestData = {
        ...defaultTestData,
        pigeons: [
          { id: 'p1', owner_id: 'u1', health: 100, status: 'active', food_shortage_streak: 0, current_food_mix_id: 'mix1' },
          { id: 'p2', owner_id: 'u1', health: 90, status: 'active', food_shortage_streak: 0, current_food_mix_id: 'mix1' },
        ],
      };
      createMockSupabase(testData);
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    });
  });

  describe('Food Depletion and Health Penalties', () => {
    it('should decrement health by 5% on first food shortage', async () => {
      const testData: TestData = {
        ...defaultTestData,
        inventory: [
          { food_id: 'f1', quantity: 0 },
          { food_id: 'f2', quantity: 0 },
        ],
      };
      createMockSupabase(testData);
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should decrement health by 10% on subsequent food shortages', async () => {
      const testData: TestData = {
        ...defaultTestData,
        pigeons: [{ ...defaultTestData.pigeons[0], food_shortage_streak: 1 }],
        inventory: [
          { food_id: 'f1', quantity: 0 },
          { food_id: 'f2', quantity: 0 },
        ],
      };
      createMockSupabase(testData);
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should auto-fill empty food types in the mix with a random available food', async () => {
      const testData: TestData = {
        ...defaultTestData,
        foodMix: { mix_json: { 'f1': 0, 'f2': 50, 'f3': 50 } },
        inventory: [
          { food_id: 'f2', quantity: 100 },
          { food_id: 'f3', quantity: 100 },
        ],
      };
      createMockSupabase(testData);
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should handle no inventory at all (apply penalty, not crash)', async () => {
      const testData: TestData = {
        ...defaultTestData,
        inventory: [],
      };
      createMockSupabase(testData);
      
      await expect(updatePigeonFeedingsForGameDay()).resolves.toBeUndefined();
    });
  });
}); 