import React from 'react';
import { customRender } from '../../test/renderHelpers';
import { screen, waitFor, act } from '@testing-library/react';
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
  Clock: vi.fn(() => React.createElement('div', { 'data-testid': 'clock-icon' })),
  Calendar: vi.fn(() => React.createElement('div', { 'data-testid': 'calendar-icon' })),
  Play: vi.fn(() => React.createElement('div', { 'data-testid': 'play-icon' })),
  Pause: vi.fn(() => React.createElement('div', { 'data-testid': 'pause-icon' })),
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

// Mock gameTimeService
vi.mock('../../services/gameTimeService', () => ({
  gameTimeService: {
    getCurrentGameDate: vi.fn(),
    getGameTimeState: vi.fn(),
    getGameTimeLog: vi.fn(),
    advanceGameTime: vi.fn(),
    toggleGameTimePause: vi.fn(),
    formatGameDate: vi.fn(),
    getTimeUntilNextUpdate: vi.fn(),
    isGameTimePaused: vi.fn(),
    setGameTimePaused: vi.fn(),
  },
}));

describe('AdminPage', () => {
  beforeEach(async () => {
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
    
    // Default game time service mocks
    const { gameTimeService } = await import('../../services/gameTimeService');
    (gameTimeService.getCurrentGameDate as ReturnType<typeof vi.fn>).mockResolvedValue('1900-01-01');
    (gameTimeService.getGameTimeState as ReturnType<typeof vi.fn>).mockResolvedValue({
      current_game_date: '1900-01-01',
      update_count: 0,
      is_paused: false,
    });
    (gameTimeService.getGameTimeLog as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (gameTimeService.formatGameDate as ReturnType<typeof vi.fn>).mockReturnValue('Monday, January 1, 1900');
    (gameTimeService.getTimeUntilNextUpdate as ReturnType<typeof vi.fn>).mockResolvedValue('2u 30m');
    (gameTimeService.isGameTimePaused as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it('renders admin panel title', async () => {
    customRender(<AdminPage />);
    // Check for the Game Time Management section which is now first
    await waitFor(() => {
      expect(screen.getByText('Game Time Management')).toBeInTheDocument();
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

  it('shows access denied for non-admins', async () => {
    // Mock non-admin user for this test
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 'user-1', email: 'user@test.com' },
      gameUser: { id: 'user-1', username: 'user', email: 'user@test.com' },
      signOut: vi.fn(),
    });
    await act(async () => {
      customRender(<AdminPage />);
    });
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