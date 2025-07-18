import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import type { PigeonGroup } from '../types/pigeon';

export interface PigeonSearchAndFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  userGroups: PigeonGroup[];
  selectedGroup: PigeonGroup | null;
  onGroupChange: (group: PigeonGroup | null) => void;
  onToggleFilters: () => void;
}

const PigeonSearchAndFilterBar: React.FC<PigeonSearchAndFilterBarProps> = ({ searchTerm, onSearchTermChange, userGroups, selectedGroup, onGroupChange, onToggleFilters }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
    {/* Search */}
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search pigeons..."
        value={searchTerm}
        onChange={e => onSearchTermChange(e.target.value)}
        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
    {/* Group Selection */}
    <div className="flex items-center space-x-2">
      <select
        value={selectedGroup?.id || ''}
        onChange={e => {
          const groupId = e.target.value;
          const group = userGroups.find(g => g.id === groupId) || null;
          onGroupChange(group);
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="">All Pigeons</option>
        {userGroups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name} ({group.description ? group.description.substring(0, 20) + '...' : 'No description'})
          </option>
        ))}
      </select>
      {selectedGroup && (
        <button
          onClick={() => onGroupChange(null)}
          className="p-2 text-gray-400 hover:text-gray-600"
          title="Clear group filter"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    {/* Filter Toggle */}
    <button
      onClick={onToggleFilters}
      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      <Filter className="h-4 w-4" />
      <span>Filters</span>
    </button>
  </div>
);

export default PigeonSearchAndFilterBar; 