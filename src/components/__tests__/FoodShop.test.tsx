// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FoodShop from '../FoodShop';
import { foodService } from '../../services/foodService';

const mockFoods = [
  { id: '1', name: 'Breeder Mix', price: 100, description: 'Boosts breeding', best_for: 'breeding', effect_type: 'stamina', created_at: '', updated_at: '' },
  { id: '2', name: 'Racing Mix', price: 120, description: 'Boosts speed', best_for: 'racing', effect_type: 'speed', created_at: '', updated_at: '' },
];
const mockInventory = [
  { user_id: 'me', food_id: '1', quantity: 10 },
  { user_id: 'me', food_id: '2', quantity: 5 },
];

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
    render(<FoodShop />);
    expect(screen.getByText(/loading food shop/i)).toBeInTheDocument();
  });

  it('renders foods and inventory', async () => {
    render(<FoodShop />);
    await waitFor(() => {
      expect(screen.getByText('Breeder Mix')).toBeInTheDocument();
      expect(screen.getByText('Racing Mix')).toBeInTheDocument();
      expect(screen.getByText(/Breeder Mix: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Racing Mix: 5/)).toBeInTheDocument();
    });
  });

  it('handles buy action', async () => {
    const updateMock = vi.spyOn(foodService, 'updateUserInventory').mockResolvedValue(undefined);
    render(<FoodShop />);
    await waitFor(() => expect(screen.getAllByText('Buy').length).toBeGreaterThan(0));
    const buyButton = screen.getAllByText('Buy')[0];
    fireEvent.click(buyButton);
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
  });

  it('shows error on buy failure', async () => {
    vi.spyOn(foodService, 'updateUserInventory').mockRejectedValue(new Error('fail'));
    render(<FoodShop />);
    await waitFor(() => expect(screen.getAllByText('Buy').length).toBeGreaterThan(0));
    const buyButton = screen.getAllByText('Buy')[0];
    fireEvent.click(buyButton);
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument());
  });
}); 