// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FoodMixer from '../FoodMixer';
import { foodService } from '../../services/foodService';
import type { FoodMix } from '../../types/pigeon';

const mockFoods = [
  { id: '1', name: 'Breeder Mix', price: 100, description: '', best_for: '', effect_type: '', created_at: '', updated_at: '' },
  { id: '2', name: 'Racing Mix', price: 120, description: '', best_for: '', effect_type: '', created_at: '', updated_at: '' },
];
const mockMixes: FoodMix[] = [
  { id: 'mix-1', name: 'Speedy', mix_json: { '1': 20, '2': 80 }, user_id: 'me', created_at: '', updated_at: '' },
];

const foodMix: FoodMix = {
  id: 'mix-id',
  user_id: 'user-id',
  name: 'Test Mix',
  mix_json: { 'food-id': 100 },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('FoodMixer', () => {
  beforeEach(() => {
    vi.spyOn(foodService, 'listFoods').mockResolvedValue(mockFoods);
    vi.spyOn(foodService, 'listFoodMixes').mockResolvedValue(mockMixes);
    vi.spyOn(foodService, 'createFoodMix').mockResolvedValue(foodMix);
    vi.spyOn(foodService, 'deleteFoodMix').mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    render(<FoodMixer />);
    expect(screen.getByText(/loading food mixer/i)).toBeInTheDocument();
  });

  it('renders foods and mixes', async () => {
    render(<FoodMixer />);
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('Breeder Mix')).length).toBeGreaterThan(0);
      expect(screen.getAllByText((content) => content.includes('Racing Mix')).length).toBeGreaterThan(0);
      // Match the <li> containing the saved mix name and percentages
      expect(screen.getByText((content, node) => node?.tagName === 'LI' && content.includes('Speedy'))).toBeInTheDocument();
    });
  });

  it('saves a mix', async () => {
    render(<FoodMixer />);
    await waitFor(() => expect(screen.getByText('Save Mix')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Mix name'), { target: { value: 'Test Mix' } });
    // Set total to 100%
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '60' } });
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '40' } });
    const saveButton = screen.getByText('Save Mix');
    await waitFor(() => !saveButton.hasAttribute('disabled'));
    fireEvent.click(saveButton);
    await waitFor(() => !saveButton.hasAttribute('disabled'));
  });

  it('deletes a mix', async () => {
    render(<FoodMixer />);
    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument());
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    await waitFor(() => expect(deleteButton).not.toBeDisabled());
  });

  it('applies a mix', async () => {
    render(<FoodMixer />);
    await waitFor(() => expect(screen.getByText('Apply')).toBeInTheDocument());
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    // After apply, the mix name input should be set to the mix name
    await waitFor(() => expect(screen.getByDisplayValue('Speedy')).toBeInTheDocument());
  });
}); 