import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AliasEditModal from '../AliasEditModal';
import type { Pigeon } from '../../types/pigeon';

// Mock the alias utils
vi.mock('../../utils/aliasUtils', () => ({
  processAlias: vi.fn((alias: string) => {
    if (alias.includes('messi')) return 'CR7';
    return alias;
  }),
  containsForbiddenWords: vi.fn((alias: string) => alias.includes('messi')),
}));

const mockPigeon: Pigeon = {
  id: '1',
  owner_id: 'user1',
  name: 'Original Name',
  gender: 'male',
  age_years: 1,
  age_months: 0,
  age_days: 0,
  status: 'active',
  speed: 50,
  endurance: 50,
  sky_iq: 50,
  aerodynamics: 50,
  vision: 50,
  wing_power: 50,
  flapacity: 50,
  vanity: 50,
  strength: 50,
  aggression: 50,
  landing: 50,
  loyalty: 50,
  health: 50,
  happiness: 50,
  fertility: 50,
  disease_resistance: 50,
  peak_speed: 60,
  peak_endurance: 60,
  peak_sky_iq: 60,
  peak_aerodynamics: 60,
  peak_vision: 60,
  peak_wing_power: 60,
  peak_flapacity: 60,
  peak_vanity: 60,
  peak_strength: 60,
  peak_aggression: 60,
  peak_landing: 60,
  peak_loyalty: 60,
  peak_health: 60,
  peak_happiness: 60,
  peak_fertility: 60,
  peak_disease_resistance: 60,
  eggs: 50,
  offspring: 50,
  breeding_quality: 50,
  adaptability: 50,
  recovery_rate: 50,
  laser_focus: 50,
  morale: 50,
  food: 50,
  peak_eggs: 60,
  peak_offspring: 60,
  peak_breeding_quality: 60,
  peak_adaptability: 60,
  peak_recovery_rate: 60,
  peak_laser_focus: 60,
  peak_morale: 60,
  peak_food: 60,
  races_won: 0,
  races_lost: 0,
  total_races: 0,
  best_time: null,
  total_distance: 0,
  offspring_produced: 0,
  successful_breedings: 0,
  picture_number: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

describe('AliasEditModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when not open', () => {
    render(
      <AliasEditModal
        open={false}
        pigeon={mockPigeon}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText('Edit Pigeon Alias')).not.toBeInTheDocument();
  });

  it('should render when open with pigeon', () => {
    render(
      <AliasEditModal
        open={true}
        pigeon={mockPigeon}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Edit Pigeon Alias')).toBeInTheDocument();
    expect(screen.getByText('Original name:')).toBeInTheDocument();
    expect(screen.getByText('Original Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter custom name (optional)')).toBeInTheDocument();
  });

  it('should show current alias when pigeon has one', () => {
    const pigeonWithAlias = { ...mockPigeon, alias: 'Custom Name' };
    
    render(
      <AliasEditModal
        open={true}
        pigeon={pigeonWithAlias}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter custom name (optional)') as HTMLInputElement;
    expect(input.value).toBe('Custom Name');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <AliasEditModal
        open={true}
        pigeon={mockPigeon}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onSave with processed alias when save button is clicked', async () => {
    render(
      <AliasEditModal
        open={true}
        pigeon={mockPigeon}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter custom name (optional)');
    fireEvent.change(input, { target: { value: 'New Alias' } });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('1', 'New Alias');
    });
  });

  it('should call onSave with null when clear alias button is clicked', async () => {
    const pigeonWithAlias = { ...mockPigeon, alias: 'Custom Name' };
    
    render(
      <AliasEditModal
        open={true}
        pigeon={pigeonWithAlias}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Clear Alias'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('1', null);
    });
  });


}); 