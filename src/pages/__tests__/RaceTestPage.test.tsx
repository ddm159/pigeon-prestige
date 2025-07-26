import { render, screen, fireEvent } from '@testing-library/react';
import RaceTestPage from '../RaceTestPage';

/**
 * Unit tests for the race/standings toggle logic in RaceTestPage.
 */
describe('RaceTestPage toggle logic', () => {
  it('shows race view by default and can switch to standings', () => {
    render(<RaceTestPage />);
    // Should show the Start Race button and the Show Standings toggle
    expect(screen.getByText('Start Race')).toBeInTheDocument();
    expect(screen.getByText('Show Standings')).toBeInTheDocument();
    // Should show the race view placeholder
    expect(screen.getByText(/Click "Start Race" to begin the simulation/i)).toBeInTheDocument();
    // Switch to standings
    fireEvent.click(screen.getByText('Show Standings'));
    expect(screen.getByText('Show Race')).toBeInTheDocument();
    // Should show the standings table header
    expect(screen.getByText('Pigeon Name')).toBeInTheDocument();
  });

  it('switches back to race view when toggled again', () => {
    render(<RaceTestPage />);
    fireEvent.click(screen.getByText('Show Standings'));
    fireEvent.click(screen.getByText('Show Race'));
    // Should show the race view placeholder again
    expect(screen.getByText(/Click "Start Race" to begin the simulation/i)).toBeInTheDocument();
  });
}); 