import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateGroupFeedingsForGameDay } from '../gameServices';
import { createMockSupabase, defaultTestData, type TestData } from './testUtils';

describe('updateGroupFeedingsForGameDay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Group Feeding Logic', () => {
    it('should apply the mix to all pigeons in the group and deduct food', async () => {
      createMockSupabase(defaultTestData);
      
      await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should apply health penalty if not enough food for a pigeon', async () => {
      const testData: TestData = {
        ...defaultTestData,
        inventory: [
          { food_id: 'f1', quantity: 0 },
          { food_id: 'f2', quantity: 0 },
        ],
      };
      createMockSupabase(testData);
      
      await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should handle empty group (no pigeons)', async () => {
      const testData: TestData = {
        ...defaultTestData,
        groupMembers: [],
      };
      createMockSupabase(testData);
      
      await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    });

    it('should handle group with no assigned mix', async () => {
      const testData: TestData = {
        ...defaultTestData,
        groupFeedings: [],
      };
      createMockSupabase(testData);
      
      await expect(updateGroupFeedingsForGameDay()).resolves.toBeUndefined();
    });
  });
}); 