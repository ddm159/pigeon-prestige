import React from 'react';
import { customRender } from '../../test/renderHelpers';
import { screen, waitFor } from '@testing-library/react';
import AdminPage from '../AdminPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../contexts/useAuth';
import { gameSettingsService } from '../../services/gameSettings';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Settings: vi.fn(() => React.createElement('div', { 'data-testid': 'settings-icon' })),
  Users: vi.fn(() => React.createElement('div', { 'data-testid': 'users-icon' })),
  AlertTriangle: vi.fn(() => React.createElement('div', { 'data-testid': 'alert-triangle-icon' })),
  Save: vi.fn(() => React.createElement('div', { 'data-testid': 'save-icon' })),
  RefreshCw: vi.fn(() => React.createElement('div', { 'data-testid': 'refresh-cw-icon' })),
  Shield: vi.fn(() => React.createElement('div', { 'data-testid': 'shield-icon' })),
  Database: vi.fn(() => React.createElement('div', { 'data-testid': 'database-icon' })),
}));

// Mock useAuth to return an admin user
vi.mock('../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock gameSettingsService
vi.mock('../../services/gameSettings', () => ({
  gameSettingsService: {
    getGameSettings: vi.fn(),
    updateGameSetting: vi.fn(),
    applyPigeonCapPenaltiesForAllUsers: vi.fn(),
  },
}));

describe('AdminPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Default admin user mock
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 'admin-user', email: 'admin@test.com' },
      gameUser: { id: 'admin-user', username: 'admin', email: 'admin@test.com' },
      signOut: vi.fn(),
    });
    
    // Default game settings mock
    (gameSettingsService.getGameSettings as ReturnType<typeof vi.fn>).mockResolvedValue([
      { setting_key: 'default_pigeon_cap', setting_value: '50', description: 'Default pigeon cap' },
      { setting_key: 'health_penalty_amount', setting_value: '5', description: 'Health penalty amount' },
    ]);
    
    (gameSettingsService.updateGameSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (gameSettingsService.applyPigeonCapPenaltiesForAllUsers as ReturnType<typeof vi.fn>).mockResolvedValue(10);
  });

  it('renders admin panel title', async () => {
    customRender(<AdminPage />);
    // The new UI does not have 'Admin Panel 🛠️', so just check for the main section
    await waitFor(() => {
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
    });
  });

  it('renders game settings section', async () => {
    customRender(<AdminPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
    });
  });

  it('renders pigeon cap management section', async () => {
    customRender(<AdminPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Pigeon Cap Management')).toBeInTheDocument();
    });
  });

  it('shows access denied for non-admins', () => {
    // Mock non-admin user for this test
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 'user-1', email: 'user@test.com' },
      gameUser: { id: 'user-1', username: 'user', email: 'user@test.com' },
      signOut: vi.fn(),
    });
    
    customRender(<AdminPage />);
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
  });

  it('loads and displays game settings', async () => {
    customRender(<AdminPage />);
    await waitFor(() => {
      expect(gameSettingsService.getGameSettings).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Default pigeon cap')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
  });
}); 