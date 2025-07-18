// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FoodMixer from '../FoodMixer';
import { foodService } from '../../services/foodService';
import type { FoodMix } from '../../types/pigeon';
import { act } from 'react';
import { AllTheProviders } from '../../test/providers';
import * as useAuthModule from '../../contexts/useAuth';
import { pigeonService } from '../../services/supabase';
import { groupService } from '../../services/gameServices';

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

const mockPigeons = [
  {
    id: 'p1',
    owner_id: 'me',
    name: 'Pigeon One',
    gender: 'male' as const,
    age_years: 1,
    age_months: 0,
    age_days: 0,
    status: 'active' as const,
    speed: 50, endurance: 50, sky_iq: 50, aerodynamics: 50, vision: 50, wing_power: 50, flapacity: 50, vanity: 50, strength: 50, aggression: 50, landing: 50, loyalty: 50, health: 100, happiness: 100, fertility: 100, disease_resistance: 100,
    peak_speed: 50, peak_endurance: 50, peak_sky_iq: 50, peak_aerodynamics: 50, peak_vision: 50, peak_wing_power: 50, peak_flapacity: 50, peak_vanity: 50, peak_strength: 50, peak_aggression: 50, peak_landing: 50, peak_loyalty: 50, peak_health: 100, peak_happiness: 100, peak_fertility: 100, peak_disease_resistance: 100,
    eggs: 0, offspring: 0, breeding_quality: 0, adaptability: 0, recovery_rate: 0, laser_focus: 0, morale: 0, food: 0,
    peak_eggs: 0, peak_offspring: 0, peak_breeding_quality: 0, peak_adaptability: 0, peak_recovery_rate: 0, peak_laser_focus: 0, peak_morale: 0, peak_food: 0,
    races_won: 0, races_lost: 0, total_races: 0, best_time: null, total_distance: 0,
    offspring_produced: 0, successful_breedings: 0,
    picture_number: 1,
    created_at: '',
    updated_at: '',
  },
];
const mockGroups = [
  {
    id: 'g1',
    owner_id: 'me',
    name: 'Group One',
    created_at: '',
    updated_at: '',
  },
];

describe('FoodMixer', () => {
  beforeEach(() => {
    vi.spyOn(foodService, 'listFoods').mockResolvedValue(mockFoods);
    vi.spyOn(foodService, 'listFoodMixes').mockResolvedValue(mockMixes);
    vi.spyOn(foodService, 'createFoodMix').mockResolvedValue(foodMix);
    vi.spyOn(foodService, 'deleteFoodMix').mockResolvedValue(undefined);
    vi.spyOn(foodService, 'assignMixToPigeon').mockResolvedValue(true);
    vi.spyOn(foodService, 'assignMixToGroup').mockResolvedValue(true);
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'me',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '',
        updated_at: '',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        last_sign_in_at: '',
        email_confirmed_at: '',
        phone: '',
        phone_confirmed_at: '',
        confirmed_at: '',
        is_anonymous: false,
      },
      gameUser: {
        id: 'me',
        email: 'test@example.com',
        username: 'testuser',
        player_type: 'human',
        balance: 1000,
        total_pigeons: 10,
        pigeon_cap: 50,
        level: 1,
        experience: 0,
        created_at: '',
        updated_at: '',
      },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshUser: vi.fn(),
    });
    vi.spyOn(foodService, 'listFoodMixes').mockResolvedValue(mockMixes);
    vi.spyOn(foodService, 'listFoods').mockResolvedValue(mockFoods);
    vi.spyOn(foodService, 'createFoodMix').mockResolvedValue(foodMix);
    vi.spyOn(foodService, 'deleteFoodMix').mockResolvedValue(undefined);
    vi.spyOn(foodService, 'assignMixToPigeon').mockResolvedValue(true);
    vi.spyOn(foodService, 'assignMixToGroup').mockResolvedValue(true);
    vi.spyOn(pigeonService, 'getUserPigeons').mockResolvedValue(mockPigeons);
    vi.spyOn(groupService, 'getGroupsForUser').mockResolvedValue(mockGroups);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders main UI', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    expect(screen.getByText(/food mixer/i)).toBeInTheDocument();
  });

  it('renders foods and mixes', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('Breeder Mix')).length).toBeGreaterThan(0);
      expect(screen.getAllByText((content) => content.includes('Racing Mix')).length).toBeGreaterThan(0);
      expect(screen.getByText((content, node) => node?.tagName === 'LI' && content.includes('Speedy'))).toBeInTheDocument();
    });
  });

  it('saves a mix', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => expect(screen.getByText('Save Mix')).toBeInTheDocument());
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Mix name'), { target: { value: 'Test Mix' } });
      fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '60' } });
      fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '40' } });
    });
    const saveButton = screen.getByText('Save Mix');
    await waitFor(() => !saveButton.hasAttribute('disabled'));
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => !saveButton.hasAttribute('disabled'));
  });

  it('allows saving if Grit is present in the mix', async () => {
    const foodsWithGrit = [
      ...mockFoods,
      { id: '3', name: 'Grit', price: 10, description: '', best_for: '', effect_type: '', created_at: '', updated_at: '' },
    ];
    vi.spyOn(foodService, 'listFoods').mockResolvedValue(foodsWithGrit);
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => {
      expect(screen.getAllByText((_, node) => !!node && !!node.textContent && node.textContent.includes('Grit')).length).toBeGreaterThan(0);
    });
    // Find the Grit input by label
    const gritInput = screen.getAllByRole('spinbutton').find((input) => {
      const label = input.closest('label');
      return label && label.textContent?.includes('Grit');
    });
    await act(async () => {
      fireEvent.change(gritInput!, { target: { value: '100' } });
    });
    const nameInput = screen.getByPlaceholderText('Mix name');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Gritty Mix' } });
    });
    const saveButton = screen.getByText('Save Mix');
    expect(saveButton).not.toBeDisabled();
  });

  it('deletes a mix with confirmation', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => expect(screen.getByTestId('delete-mix-mix-1')).toBeInTheDocument());
    const deleteButton = screen.getByTestId('delete-mix-mix-1');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() => expect(screen.getByText('Confirm?')).toBeInTheDocument());
    const yesButton = screen.getByText('Yes');
    await act(async () => {
      fireEvent.click(yesButton);
    });
    await waitFor(() => expect(foodService.deleteFoodMix).toHaveBeenCalledWith('mix-1'));
  });

  it('applies a mix', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => expect(screen.getByText('Apply')).toBeInTheDocument());
    const applyButton = screen.getByText('Apply');
    await act(async () => {
      fireEvent.click(applyButton);
    });
    await waitFor(() => expect(screen.getByDisplayValue('Speedy')).toBeInTheDocument());
  });

  it('opens assign modal and assigns mix to pigeon', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => expect(screen.getByText('Assign')).toBeInTheDocument());
    const assignButton = screen.getByText('Assign');
    await act(async () => {
      fireEvent.click(assignButton);
    });
    await waitFor(() => expect(screen.getByText('Assign Food Mix')).toBeInTheDocument());
    // Select pigeon (mocked list, so just select the first option after the placeholder)
    const select = screen.getByLabelText(/select a pigeon/i) || screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'p1' } });
    });
    const assignButtons = screen.getAllByRole('button', { name: /assign/i });
    const confirmButton = assignButtons[assignButtons.length - 1];
    await act(async () => {
      fireEvent.click(confirmButton);
    });
    await waitFor(() => expect(screen.getByText('Mix assigned!')).toBeInTheDocument());
  });
  it('opens assign modal and assigns mix to group', async () => {
    await act(async () => {
      render(<FoodMixer />, { wrapper: AllTheProviders });
    });
    await waitFor(() => expect(screen.getByText('Assign')).toBeInTheDocument());
    const assignButton = screen.getByText('Assign');
    await act(async () => {
      fireEvent.click(assignButton);
    });
    await waitFor(() => expect(screen.getByText('Assign Food Mix')).toBeInTheDocument());
    // Switch to group
    const groupRadio = screen.getByLabelText(/assign to group/i) || screen.getByText(/assign to group/i).closest('input');
    await act(async () => {
      fireEvent.click(groupRadio!);
    });
    // Select group (mocked list, so just select the first option after the placeholder)
    const select = screen.getByLabelText(/select a group/i) || screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'g1' } });
    });
    const assignButtons = screen.getAllByRole('button', { name: /assign/i });
    const confirmButton = assignButtons[assignButtons.length - 1];
    await act(async () => {
      fireEvent.click(confirmButton);
    });
    await waitFor(() => expect(screen.getByText('Mix assigned!')).toBeInTheDocument());
  });
}); 