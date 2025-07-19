import React from 'react';
import type { Division, DivisionType } from '../../types/competition';

interface DivisionSelectorProps {
  divisions: Division[];
  selectedDivision: DivisionType | 'all';
  loading: boolean;
  onDivisionChange: (division: DivisionType | 'all') => void;
}

/**
 * Division Selector Component
 * Displays and manages division selection
 */
export const DivisionSelector: React.FC<DivisionSelectorProps> = ({
  divisions,
  selectedDivision,
  loading,
  onDivisionChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Divisions</h2>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => onDivisionChange('all')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedDivision === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              All Divisions
            </button>
            {divisions.map((division) => (
              <button
                key={division.id}
                onClick={() => onDivisionChange(division.division_code)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedDivision === division.division_code
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{division.name}</div>
                <div className="text-sm text-gray-500">
                  {division.max_players} players max
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 