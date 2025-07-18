// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FeedingHistory from '../FeedingHistory';
import { foodService } from '../../services/foodService';
import { groupService } from '../../services/gameServices';

const mockGroups = [
  { id: 'g1', name: 'Racers', owner_id: 'me', created_at: '', updated_at: '' },
  { id: 'g2', name: 'Breeders', owner_id: 'me', created_at: '', updated_at: '' },
];
const mockMixes = [
  { id: 'mix-1', name: 'Speedy', mix_json: {}, user_id: 'me', created_at: '', updated_at: '' },
  { id: 'mix-2', name: 'Stamina', mix_json: {}, user_id: 'me', created_at: '', updated_at: '' },
];
const mockHistory = [
  { id: 'h1', pigeon_id: 'p1', food_mix_id: 'mix-1', applied_at: '2024-05-01T12:00:00Z', group_id: 'g1' },
  { id: 'h2', pigeon_id: 'p1', food_mix_id: 'mix-2', applied_at: '2024-05-02T12:00:00Z', group_id: 'g1' },
];

describe('FeedingHistory', () => {
  beforeEach(() => {
    vi.spyOn(groupService, 'getGroupsForUser').mockResolvedValue(mockGroups);
    vi.spyOn(foodService, 'listFoodMixes').mockResolvedValue(mockMixes);
    vi.spyOn(foodService, 'getPigeonFeedHistory').mockResolvedValue(mockHistory);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    render(<FeedingHistory />);
    expect(screen.getByText(/loading feeding history/i)).toBeInTheDocument();
  });

  it('renders groups, pigeons, and history', async () => {
    render(<FeedingHistory />);
    await waitFor(() => {
      expect(screen.getAllByText('Racers').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Breeders').length).toBeGreaterThan(0);
      expect(screen.getByText('Sky King')).toBeInTheDocument();
      expect(screen.getByText('Feather Queen')).toBeInTheDocument();
      expect(screen.getByText('Speedy')).toBeInTheDocument();
      expect(screen.getByText('Stamina')).toBeInTheDocument();
    });
  });

  it('filters history by pigeon', async () => {
    render(<FeedingHistory />);
    await waitFor(() => expect(screen.getByText('Sky King')).toBeInTheDocument());
    // Change pigeon
    fireEvent.change(screen.getByLabelText('Pigeon:'), { target: { value: 'p2' } });
    // No history for p2
    await waitFor(() => {
      expect(screen.queryByText('Speedy')).not.toBeInTheDocument();
      expect(screen.queryByText('Stamina')).not.toBeInTheDocument();
    });
  });
}); 