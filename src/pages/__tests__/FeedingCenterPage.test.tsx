import { render, screen } from '@testing-library/react';
import FeedingCenterPage from '../FeedingCenterPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { vi } from 'vitest';
import { describe, it, expect } from 'vitest';

// Mock useAuth to always return a valid user
vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@test.com' },
    gameUser: { id: 'test-user', username: 'testuser', email: 'test@test.com', balance: 1000 },
    signOut: vi.fn(),
  }),
}));

// Mock foodService and any other services used by FeedingCenterPage
vi.mock('../../services/foodService', () => ({
  foodService: {
    listFoods: vi.fn().mockResolvedValue([
      { id: '1', name: 'Breeder Mix', price: 100, description: 'Boosts breeding', best_for: 'breeding', effect_type: 'stamina', created_at: '', updated_at: '' },
      { id: '2', name: 'Racing Mix', price: 120, description: 'Boosts speed', best_for: 'racing', effect_type: 'speed', created_at: '', updated_at: '' },
    ]),
    getUserInventory: vi.fn().mockResolvedValue([
      { user_id: 'test-user', food_id: '1', quantity: 10 },
      { user_id: 'test-user', food_id: '2', quantity: 5 },
    ]),
    updateUserInventory: vi.fn().mockResolvedValue(undefined),
    listFoodMixes: vi.fn().mockResolvedValue([]), // Add this mock
  },
}));

describe('FeedingCenterPage', () => {
  it('renders the Feeding Center UI', async () => {
    render(
      <AuthProvider>
        <FeedingCenterPage />
      </AuthProvider>
    );
    // Wait for the Feeding Center header to appear
    expect(await screen.findByText(/Feeding Center/i)).toBeInTheDocument();
    // Wait for the async UI to load
    expect(await screen.findByText(/Available Foods/i)).toBeInTheDocument();
    expect(await screen.findByText(/Current Mix/i)).toBeInTheDocument();
    expect(await screen.findByText(/Live Preview/i)).toBeInTheDocument();
  });
}); 