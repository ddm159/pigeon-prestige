import { render, screen, fireEvent } from '@testing-library/react';
import { RaceStandingsTable } from '../RaceStandingsTable';
import type { PigeonStanding } from '../../types/flightSim';

/**
 * Unit tests for RaceStandingsTable component.
 */
describe('RaceStandingsTable', () => {
  const mockStandings: PigeonStanding[] = [
    {
      pigeonId: '1',
      pigeonName: 'Sky King',
      ownerName: 'Alice',
      velocity: 1200,
      distanceLeft: 5000,
      speed: 1300,
      state: 'finished',
    },
    {
      pigeonId: '2',
      pigeonName: 'Wind Dancer',
      ownerName: 'Bob',
      velocity: 1180,
      distanceLeft: 8000,
      speed: 1250,
      state: 'finished',
    },
    {
      pigeonId: '3',
      pigeonName: 'Cloud Surfer',
      ownerName: 'Charlie',
      velocity: 1250,
      distanceLeft: 12000,
      speed: 1400,
      state: 'lost',
    },
  ];

  const headerMatcher = (header: string) => (content: string) => content.startsWith(header);

  it('renders all columns and rows', () => {
    render(<RaceStandingsTable standings={mockStandings} />);
    expect(screen.getByText(headerMatcher('Pigeon Name'))).toBeInTheDocument();
    expect(screen.getByText(headerMatcher('Owner'))).toBeInTheDocument();
    expect(screen.getByText(headerMatcher('Velocity'))).toBeInTheDocument();
    expect(screen.getByText(headerMatcher('Distance Left'))).toBeInTheDocument();
    expect(screen.getByText(headerMatcher('Speed'))).toBeInTheDocument();
    expect(screen.getByText(headerMatcher('State'))).toBeInTheDocument();
    expect(screen.getByText('Sky King')).toBeInTheDocument();
    expect(screen.getByText('Wind Dancer')).toBeInTheDocument();
    expect(screen.getByText('Cloud Surfer')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders empty state gracefully', () => {
    render(<RaceStandingsTable standings={[]} />);
    expect(screen.getByText(headerMatcher('Pigeon Name'))).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows.length).toBe(1);
  });

  it('sorts by velocity descending and ascending', () => {
    render(<RaceStandingsTable standings={mockStandings} />);
    // Default sort is velocity desc, so Cloud Surfer (1250) should be first
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Cloud Surfer');
    // Click velocity header to sort ascending
    fireEvent.click(screen.getByText(headerMatcher('Velocity')));
    const rowsAsc = screen.getAllByRole('row');
    expect(rowsAsc[1]).toHaveTextContent('Wind Dancer');
  });

  it('sorts by pigeon name ascending and descending', () => {
    render(<RaceStandingsTable standings={mockStandings} />);
    // Click pigeon name header to sort ascending
    fireEvent.click(screen.getByText(headerMatcher('Pigeon Name')));
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Cloud Surfer');
    // Click again to sort descending
    fireEvent.click(screen.getByText(headerMatcher('Pigeon Name')));
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Wind Dancer');
  });

  it('sorts by state ascending and descending', () => {
    render(<RaceStandingsTable standings={mockStandings} />);
    // Click state header to sort ascending
    fireEvent.click(screen.getByText(headerMatcher('State')));
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Sky King'); // 'finished' < 'lost'
    // Click again to sort descending
    fireEvent.click(screen.getByText(headerMatcher('State')));
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Cloud Surfer');
  });
}); 