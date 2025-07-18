import React from 'react';
import type { PigeonFilters, PigeonGroup } from '../types/pigeon';

interface PigeonFilterPanelProps {
  showAdvancedFilters: boolean;
  filters: PigeonFilters;
  setFilters: React.Dispatch<React.SetStateAction<PigeonFilters>>;
  selectedGroup: PigeonGroup | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<PigeonGroup | null>>;
}

const VISIBLE_STATS = [
  { key: 'speed', label: 'Speed' },
  { key: 'endurance', label: 'Endurance' },
  { key: 'sky_iq', label: 'Sky IQ' },
  { key: 'aerodynamics', label: 'Aerodynamics' },
  { key: 'vision', label: 'Vision' },
  { key: 'wing_power', label: 'Wing Power' },
  { key: 'flapacity', label: 'Flapacity' },
  { key: 'vanity', label: 'Vanity' },
  { key: 'strength', label: 'Strength' },
  { key: 'aggression', label: 'Aggression' },
  { key: 'landing', label: 'Landing' },
  { key: 'loyalty', label: 'Loyalty' },
  { key: 'health', label: 'Health' },
  { key: 'happiness', label: 'Happiness' },
  { key: 'fertility', label: 'Fertility' },
  { key: 'disease_resistance', label: 'Disease Resistance' },
];

const PigeonFilterPanel: React.FC<PigeonFilterPanelProps> = ({
  showAdvancedFilters,
  filters,
  setFilters,
  selectedGroup,
  setSelectedGroup,
}) => (
  <>
    {showAdvancedFilters && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Stat Filters */}
        {VISIBLE_STATS.map(({ key, label }) => (
          <div key={key} className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                min={0}
                max={200}
                placeholder="Min"
                value={filters.statFilters?.[key]?.min ?? ''}
                onChange={e => {
                  const min = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  setFilters(f => ({
                    ...f,
                    statFilters: {
                      ...f.statFilters,
                      [key]: {
                        min,
                        max: f.statFilters?.[key]?.max ?? undefined,
                      },
                    },
                  }));
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
              <input
                type="number"
                step="0.01"
                min={0}
                max={200}
                placeholder="Max"
                value={filters.statFilters?.[key]?.max ?? ''}
                onChange={e => {
                  const max = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  setFilters(f => ({
                    ...f,
                    statFilters: {
                      ...f.statFilters,
                      [key]: {
                        min: f.statFilters?.[key]?.min ?? undefined,
                        max,
                      },
                    },
                  }));
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          </div>
        ))}
        {/* Age Filter */}
        <div className="flex flex-col col-span-2">
          <label className="text-xs font-medium text-gray-700 mb-1">Age Range (Min/Max)</label>
          <div className="flex space-x-2 items-center">
            <span className="text-xs">Min</span>
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Years"
              value={filters.ageRange?.minYears ?? ''}
              onChange={e => setFilters(f => ({
                ...f,
                ageRange: {
                  ...f.ageRange,
                  minYears: e.target.value === '' ? undefined : parseInt(e.target.value),
                  minMonths: f.ageRange?.minMonths ?? 0,
                  minDays: f.ageRange?.minDays ?? 0,
                  maxYears: f.ageRange?.maxYears ?? 100,
                  maxMonths: f.ageRange?.maxMonths ?? 11,
                  maxDays: f.ageRange?.maxDays ?? 30,
                },
              }))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="number"
              min={0}
              max={11}
              placeholder="Months"
              value={filters.ageRange?.minMonths ?? ''}
              onChange={e => setFilters(f => ({
                ...f,
                ageRange: {
                  ...f.ageRange,
                  minMonths: e.target.value === '' ? undefined : parseInt(e.target.value),
                  minYears: f.ageRange?.minYears ?? 0,
                  minDays: f.ageRange?.minDays ?? 0,
                  maxYears: f.ageRange?.maxYears ?? 100,
                  maxMonths: f.ageRange?.maxMonths ?? 11,
                  maxDays: f.ageRange?.maxDays ?? 30,
                },
              }))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="number"
              min={0}
              max={30}
              placeholder="Days"
              value={filters.ageRange?.minDays ?? ''}
              onChange={e => setFilters(f => ({
                ...f,
                ageRange: {
                  ...f.ageRange,
                  minDays: e.target.value === '' ? undefined : parseInt(e.target.value),
                  minYears: f.ageRange?.minYears ?? 0,
                  minMonths: f.ageRange?.minMonths ?? 0,
                  maxYears: f.ageRange?.maxYears ?? 100,
                  maxMonths: f.ageRange?.maxMonths ?? 11,
                  maxDays: f.ageRange?.maxDays ?? 30,
                },
              }))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <span className="text-xs ml-4">Max</span>
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Years"
              value={filters.ageRange?.maxYears ?? ''}
              onChange={e => setFilters(f => ({
                ...f,
                ageRange: {
                  ...f.ageRange,
                  maxYears: e.target.value === '' ? undefined : parseInt(e.target.value),
                  minYears: f.ageRange?.minYears ?? 0,
                  minMonths: f.ageRange?.minMonths ?? 0,
                  minDays: f.ageRange?.minDays ?? 0,
                  maxMonths: f.ageRange?.maxMonths ?? 11,
                  maxDays: f.ageRange?.maxDays ?? 30,
                },
              }))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="number"
              min={0}
              max={11}
              placeholder="Months"
              value={filters.ageRange?.maxMonths ?? ''}
              onChange={e => setFilters(f => ({
                ...f,
                ageRange: {
                  ...f.ageRange,
                  maxMonths: e.target.value === '' ? undefined : parseInt(e.target.value),
                  minYears: f.ageRange?.minYears ?? 0,
                  minMonths: f.ageRange?.minMonths ?? 0,
                  minDays: f.ageRange?.minDays ?? 0,
                  maxYears: f.ageRange?.maxYears ?? 100,
                  maxDays: f.ageRange?.maxDays ?? 30,
                },
              }))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="number"
              min={0}
              max={30}
              placeholder="Days"
              value={filters.ageRange?.maxDays ?? ''}
              onChange={e => setFilters(f => ({
                ...f,
                ageRange: {
                  ...f.ageRange,
                  maxDays: e.target.value === '' ? undefined : parseInt(e.target.value),
                  minYears: f.ageRange?.minYears ?? 0,
                  minMonths: f.ageRange?.minMonths ?? 0,
                  minDays: f.ageRange?.minDays ?? 0,
                  maxYears: f.ageRange?.maxYears ?? 100,
                  maxMonths: f.ageRange?.maxMonths ?? 11,
                },
              }))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          onClick={() => {
            setFilters({});
            setSelectedGroup(null);
          }}
        >
          Clear All Filters
        </button>
      </div>
    )}
    <div className="mt-2 text-xs text-gray-600">
      <strong>Active Filters:</strong>
      {selectedGroup && <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">Group: {selectedGroup.name}</span>}
      {Object.keys(filters).length > 0 && <span className="ml-1 bg-gray-100 text-gray-800 px-2 py-1 rounded">Other filters applied</span>}
      {!selectedGroup && Object.keys(filters).length === 0 && <span className="ml-1">No filters</span>}
    </div>
  </>
);

export default PigeonFilterPanel; 