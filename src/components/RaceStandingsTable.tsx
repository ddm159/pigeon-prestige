import React, { useState, useMemo } from 'react';
import type { PigeonStanding } from '../types/flightSim';

/**
 * Props for RaceStandingsTable.
 */
export interface RaceStandingsTableProps {
  standings: PigeonStanding[];
}

type SortColumn = 'pigeonName' | 'ownerName' | 'velocity' | 'distanceLeft' | 'speed' | 'state';
type SortDirection = 'asc' | 'desc';

/**
 * Displays a live leaderboard of pigeon race standings with sortable columns.
 *
 * @param standings - Array of PigeonStanding objects to display
 */
export const RaceStandingsTable: React.FC<RaceStandingsTableProps> = ({ standings }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('velocity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStandings = useMemo(() => {
    const arr = [...standings];
    arr.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      if (sortColumn === 'state') {
        const stateOrder = ['finished', 'returned', 'dnf', 'injured', 'lost', 'dead'];
        aValue = stateOrder.indexOf(a.state);
        bValue = stateOrder.indexOf(b.state);
      } else if (sortColumn === 'pigeonName') {
        aValue = a.pigeonName;
        bValue = b.pigeonName;
      } else if (sortColumn === 'ownerName') {
        aValue = a.ownerName;
        bValue = b.ownerName;
      } else if (sortColumn === 'velocity') {
        aValue = a.velocity;
        bValue = b.velocity;
      } else if (sortColumn === 'distanceLeft') {
        aValue = a.distanceLeft;
        bValue = b.distanceLeft;
      } else if (sortColumn === 'speed') {
        aValue = a.speed;
        bValue = b.speed;
      } else {
        aValue = '';
        bValue = '';
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    return arr;
  }, [standings, sortColumn, sortDirection]);

  const renderSortArrow = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const getAriaSort = (column: SortColumn): 'ascending' | 'descending' | undefined => {
    if (sortColumn !== column) return undefined;
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="race-standings-table" aria-label="Race Standings">
        <thead>
          <tr>
            <th
              className="cursor-pointer"
              onClick={() => handleSort('pigeonName')}
              aria-sort={getAriaSort('pigeonName')}
            >
              Pigeon Name{renderSortArrow('pigeonName')}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort('ownerName')}
              aria-sort={getAriaSort('ownerName')}
            >
              Owner{renderSortArrow('ownerName')}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort('velocity')}
              aria-sort={getAriaSort('velocity')}
            >
              Velocity{renderSortArrow('velocity')}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort('distanceLeft')}
              aria-sort={getAriaSort('distanceLeft')}
            >
              Distance Left{renderSortArrow('distanceLeft')}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort('speed')}
              aria-sort={getAriaSort('speed')}
            >
              Speed{renderSortArrow('speed')}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort('state')}
              aria-sort={getAriaSort('state')}
            >
              State{renderSortArrow('state')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map((s) => (
            <tr key={s.pigeonId}>
              <td>{s.pigeonName}</td>
              <td>{s.ownerName}</td>
              <td>{s.velocity.toFixed(2)}</td>
              <td>{s.distanceLeft.toLocaleString()} m</td>
              <td>{s.speed.toFixed(2)}</td>
              <td>{s.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RaceStandingsTable; 