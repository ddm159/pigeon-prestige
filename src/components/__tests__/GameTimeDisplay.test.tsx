
import { customRender } from '../../test/renderHelpers';
import { screen, waitFor } from '@testing-library/react';
import GameTimeDisplay from '../GameTimeDisplay';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameTimeService } from '../../services/gameTimeService';

// Mock gameTimeService
vi.mock('../../services/gameTimeService', () => ({
  gameTimeService: {
    getCurrentGameDate: vi.fn(),
    getTimeUntilNextUpdate: vi.fn(),
    isGameTimePaused: vi.fn(),
    formatGameDate: vi.fn(),
  },
}));

describe('GameTimeDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    (gameTimeService.getCurrentGameDate as ReturnType<typeof vi.fn>).mockResolvedValue('1900-01-01');
    (gameTimeService.getTimeUntilNextUpdate as ReturnType<typeof vi.fn>).mockResolvedValue('2u 30m');
    (gameTimeService.isGameTimePaused as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (gameTimeService.formatGameDate as ReturnType<typeof vi.fn>).mockReturnValue('Monday, January 1, 1900');
  });

  it('renders loading state initially', () => {
    customRender(<GameTimeDisplay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game date and time until next update', async () => {
    customRender(<GameTimeDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Monday, January 1, 1900')).toBeInTheDocument();
      expect(screen.getByText('Next: 2u 30m')).toBeInTheDocument();
    });
  });

  it('shows paused status when game time is paused', async () => {
    (gameTimeService.isGameTimePaused as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    
    customRender(<GameTimeDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('PAUSED')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    (gameTimeService.getCurrentGameDate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    
    customRender(<GameTimeDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Monday, January 1, 1900')).toBeInTheDocument(); // Fallback date
      expect(screen.getByText('Next: Unknown')).toBeInTheDocument();
    });
  });
}); 