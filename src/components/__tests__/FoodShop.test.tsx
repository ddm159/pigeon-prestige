// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FoodShop from '../FoodShop';
import { foodService } from '../../services/foodService';
import { AuthProvider } from '../../contexts/AuthContext';

const mockFoods = [
  { id: '1', name: 'Breeder Mix', price: 100, description: 'Boosts breeding', best_for: 'breeding', effect_type: 'stamina', created_at: '', updated_at: '' },
  { id: '2', name: 'Racing Mix', price: 120, description: 'Boosts speed', best_for: 'racing', effect_type: 'speed', created_at: '', updated_at: '' },
];
const mockInventory = [
  { user_id: 'me', food_id: '1', quantity: 10 },
  { user_id: 'me', food_id: '2', quantity: 5 },
];

function renderWithAuthProvider(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('FoodShop', () => {
  beforeEach(() => {
    vi.spyOn(foodService, 'listFoods').mockResolvedValue(mockFoods);
    vi.spyOn(foodService, 'getUserInventory').mockResolvedValue(mockInventory);
    vi.spyOn(foodService, 'updateUserInventory').mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    renderWithAuthProvider(<FoodShop />);
    expect(screen.getByText(/loading foods/i)).toBeInTheDocument();
  });

  it('renders foods', async () => {
    renderWithAuthProvider(<FoodShop />);
    await waitFor(() => {
      expect(screen.getByText('Breeder Mix')).toBeInTheDocument();
      expect(screen.getByText('Racing Mix')).toBeInTheDocument();
    });
  });

  it.skip('handles buy action', async () => {
    // Skipped: Buy functionality not yet implemented
  });

  it.skip('shows error on buy failure', async () => {
    // Skipped: Buy functionality not yet implemented
  });
}); 
