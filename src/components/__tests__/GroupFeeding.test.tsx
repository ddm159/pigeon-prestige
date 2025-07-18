// @vitest-environment jsdom
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { customRender } from '../../test/renderHelpers';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GroupFeeding from '../GroupFeeding';
import { foodService } from '../../services/foodService';
import { groupService } from '../../services/gameServices';
import type { GroupFeeding as GroupFeedingType } from '../../types/pigeon';

const mockGroups = [
  { id: 'g1', name: 'Racers', owner_id: 'me', created_at: '', updated_at: '' },
  { id: 'g2', name: 'Breeders', owner_id: 'me', created_at: '', updated_at: '' },
];
const mockMixes = [
  { id: 'mix-1', name: 'Speedy', mix_json: {}, user_id: 'me', created_at: '', updated_at: '' },
  { id: 'mix-2', name: 'Stamina', mix_json: {}, user_id: 'me', created_at: '', updated_at: '' },
];

describe('GroupFeeding', () => {
  beforeEach(() => {
    vi.spyOn(groupService, 'getGroupsForUser').mockResolvedValue(mockGroups);
    vi.spyOn(foodService, 'listFoodMixes').mockResolvedValue(mockMixes);
    vi.spyOn(foodService, 'applyFoodMixToGroup').mockResolvedValue({
      id: 'gf1',
      group_id: 'g1',
      food_mix_id: 'mix-1',
      applied_at: new Date().toISOString(),
    } as GroupFeedingType);
    vi.spyOn(foodService, 'assignMixToGroup').mockResolvedValue(true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders main UI', async () => {
    await act(async () => {
      customRender(<GroupFeeding />);
    });
    expect(screen.getByText(/group feeding/i)).toBeInTheDocument();
  });

  it('renders groups and mixes', async () => {
    await act(async () => {
      customRender(<GroupFeeding />);
    });
    await waitFor(() => {
      expect(screen.getByText('Racers')).toBeInTheDocument();
      expect(screen.getByText('Breeders')).toBeInTheDocument();
      expect(screen.getByText('Speedy')).toBeInTheDocument();
      expect(screen.getByText('Stamina')).toBeInTheDocument();
    });
  });

  it('applies a mix to a group', async () => {
    await act(async () => {
      customRender(<GroupFeeding />);
    });
    await waitFor(() => expect(screen.getByText('Apply Mix to Group')).toBeInTheDocument());
    const applyButton = screen.getByText('Apply Mix to Group');
    await act(async () => {
      fireEvent.click(applyButton);
    });
    await waitFor(() => expect(applyButton).not.toBeDisabled());
  });

  it('opens assign modal and assigns mix to group', async () => {
    await act(async () => {
      customRender(<GroupFeeding />);
    });
    await waitFor(() => expect(screen.getByTestId('assign-mix-g1')).toBeInTheDocument());
    const assignButton = screen.getByTestId('assign-mix-g1');
    await act(async () => {
      fireEvent.click(assignButton);
    });
    // Assert that the assign modal opens by checking for its content
    await waitFor(() => expect(screen.queryByText(/Assign Food Mix/)).toBeInTheDocument());
  });
}); 