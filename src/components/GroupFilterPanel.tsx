import React from 'react';
import type { PigeonGroup } from '../types/pigeon';

export interface GroupFilters {
  name?: string;
  minSize?: number;
  maxSize?: number;
  tag?: string;
}

interface GroupFilterPanelProps {
  showAdvancedFilters: boolean;
  filters: GroupFilters;
  setFilters: React.Dispatch<React.SetStateAction<GroupFilters>>;
  selectedGroup: PigeonGroup | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<PigeonGroup | null>>;
}

/**
 * GroupFilterPanel provides advanced filtering for pigeon groups, similar to PigeonFilterPanel.
 * Allows filtering by group name, size, and custom tags.
 */
const GroupFilterPanel: React.FC<GroupFilterPanelProps> = ({
  showAdvancedFilters,
  filters,
  setFilters,
  selectedGroup,
  setSelectedGroup,
}) => {
  console.log('GroupFilterPanel filters:', filters);
  return (
    <>
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Group Name Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              placeholder="Search by name"
              value={filters.name ?? ''}
              onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          {/* Group Size Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Group Size (Min/Max)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min={1}
                placeholder="Min"
                value={filters.minSize ?? ''}
                onChange={e => setFilters(f => ({ ...f, minSize: e.target.value === '' ? undefined : parseInt(e.target.value) }))}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
              <input
                type="number"
                min={1}
                placeholder="Max"
                value={filters.maxSize ?? ''}
                onChange={e => setFilters(f => ({ ...f, maxSize: e.target.value === '' ? undefined : parseInt(e.target.value) }))}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          </div>
          {/* Tag Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              placeholder="Tag"
              value={filters.tag ?? ''}
              onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
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
};

export default GroupFilterPanel; 