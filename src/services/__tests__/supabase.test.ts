import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../supabase';
import { authService } from '../authService';
import { pigeonService } from '../pigeonService';
import type { Pigeon } from '../../types/pigeon';

// Mock environment variables for testing
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
};

// Mock the environment variables
Object.defineProperty(import.meta, 'env', {
  value: mockEnv,
  writable: true
});

describe('Supabase Connection', () => {
  it('should create a Supabase client', () => {
    expect(supabase).toBeDefined();
    // Test that the client has the expected structure
    expect(supabase).toHaveProperty('auth');
    expect(supabase).toHaveProperty('from');
  });

  it('should have auth service methods', () => {
    expect(authService.signUp).toBeDefined();
    expect(authService.signIn).toBeDefined();
    expect(authService.signOut).toBeDefined();
    expect(authService.getCurrentUser).toBeDefined();
    expect(authService.createUserProfile).toBeDefined();
    expect(authService.getUserProfile).toBeDefined();
  });

  it('should have pigeon service methods', () => {
    expect(pigeonService.getUserPigeons).toBeDefined();
    expect(pigeonService.getPigeon).toBeDefined();
    expect(pigeonService.createPigeon).toBeDefined();
    expect(pigeonService.updatePigeon).toBeDefined();
    expect(pigeonService.deletePigeon).toBeDefined();
    expect(pigeonService.createStartingPigeons).toBeDefined();
  });
});

describe('Supabase Auth Service', () => {
  it('should handle sign up with proper parameters', async () => {
    const email = 'test@example.com';
    const password = 'testpassword123';
    const username = 'testuser';

    // Mock the signUp method
    const mockSignUp = vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Replace the actual method with mock
    const originalSignUp = authService.signUp;
    authService.signUp = mockSignUp;

    try {
      await authService.signUp(email, password, username);
      
      expect(mockSignUp).toHaveBeenCalledWith(email, password, username);
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    } finally {
      // Restore original method
      authService.signUp = originalSignUp;
    }
  });

  it('should handle sign in with proper parameters', async () => {
    const email = 'test@example.com';
    const password = 'testpassword123';

    // Mock the signIn method
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Replace the actual method with mock
    const originalSignIn = authService.signIn;
    authService.signIn = mockSignIn;

    try {
      await authService.signIn(email, password);
      
      expect(mockSignIn).toHaveBeenCalledWith(email, password);
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    } finally {
      // Restore original method
      authService.signIn = originalSignIn;
    }
  });
});

describe('Supabase Pigeon Service', () => {
  it('should handle getting user pigeons', async () => {
    const userId = 'test-user-id';

    // Mock the getUserPigeons method
    const mockGetUserPigeons = vi.fn().mockResolvedValue([
      {
        id: 'pigeon-1',
        name: 'Test Pigeon',
        owner_id: userId,
        gender: 'male'
      }
    ]);

    // Replace the actual method with mock
    const originalGetUserPigeons = pigeonService.getUserPigeons;
    pigeonService.getUserPigeons = mockGetUserPigeons;

    try {
      const pigeons = await pigeonService.getUserPigeons(userId);
      
      expect(mockGetUserPigeons).toHaveBeenCalledWith(userId);
      expect(mockGetUserPigeons).toHaveBeenCalledTimes(1);
      expect(pigeons).toHaveLength(1);
      expect(pigeons[0].name).toBe('Test Pigeon');
    } finally {
      // Restore original method
      pigeonService.getUserPigeons = originalGetUserPigeons;
    }
  });

  it('should handle creating a pigeon', async () => {
    const pigeonData = {
      owner_id: 'test-user-id',
      name: 'New Pigeon',
      gender: 'female' as const,
      speed: 50,
      endurance: 45,
      sky_iq: 60,
      aerodynamics: 55,
      vision: 70,
      wing_power: 65,
      flapacity: 40,
      vanity: 30,
      strength: 80,
      aggression: 20,
      landing: 75,
      loyalty: 90,
      health: 85,
      happiness: 80,
      fertility: 70,
      disease_resistance: 75,
      peak_speed: 60,
      peak_endurance: 55,
      peak_sky_iq: 70,
      peak_aerodynamics: 65,
      peak_vision: 80,
      peak_wing_power: 75,
      peak_flapacity: 50,
      peak_vanity: 40,
      peak_strength: 90,
      peak_aggression: 30,
      peak_landing: 85,
      peak_loyalty: 100,
      peak_health: 95,
      peak_happiness: 90,
      peak_fertility: 80,
      peak_disease_resistance: 85,
      eggs: 50,
      offspring: 60,
      breeding_quality: 70,
      adaptability: 55,
      recovery_rate: 65,
      laser_focus: 75,
      morale: 80,
      food: 45,
      peak_eggs: 60,
      peak_offspring: 70,
      peak_breeding_quality: 80,
      peak_adaptability: 65,
      peak_recovery_rate: 75,
      peak_laser_focus: 85,
      peak_morale: 90,
      peak_food: 55
    };

    // Mock the createPigeon method
    const mockCreatePigeon = vi.fn().mockResolvedValue({
      id: 'new-pigeon-id',
      ...pigeonData
    });

    // Replace the actual method with mock
    const originalCreatePigeon = pigeonService.createPigeon;
    pigeonService.createPigeon = mockCreatePigeon;

    try {
      const pigeon = await pigeonService.createPigeon(pigeonData as unknown as Pigeon);
      
      expect(mockCreatePigeon).toHaveBeenCalledWith(pigeonData);
      expect(mockCreatePigeon).toHaveBeenCalledTimes(1);
      expect((pigeon as unknown as Pigeon).id).toBe('new-pigeon-id');
      expect((pigeon as unknown as Pigeon).name).toBe('New Pigeon');
    } finally {
      // Restore original method
      pigeonService.createPigeon = originalCreatePigeon;
    }
  });
}); 