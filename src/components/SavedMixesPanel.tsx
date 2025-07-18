import React, { useState } from 'react';
import type { Food, FoodMix } from '../types/pigeon';

export interface SavedMixesPanelProps {
  mixes: FoodMix[];
  foods: Food[];
  onApply: (mix: FoodMix) => void;
  onDelete: (mixId: string) => void;
  onAssign: (mix: FoodMix) => void;
  deletingId: string | null;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (mixId: string | null) => void;
}

const SavedMixesPanel: React.FC<SavedMixesPanelProps> = ({
  mixes,
  foods,
  onApply,
  onDelete,
  onAssign,
  deletingId,
  confirmDeleteId,
  setConfirmDeleteId,
}) => {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<'az' | 'za'>('az');

  const filteredMixes = mixes
    .filter(mix => mix.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => sort === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Saved Mixes</h2>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
          style={{ minWidth: 120 }}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'az' | 'za')}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="az">Sort: Name A-Z</option>
          <option value="za">Sort: Name Z-A</option>
        </select>
      </div>
      {filteredMixes.length === 0 ? (
        <div className="text-gray-400">No saved mixes found.</div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filteredMixes.map((mix) => (
            <div
              key={mix.id}
              className="border rounded min-w-[200px] max-w-xs p-2 flex-shrink-0 bg-white shadow-sm"
              style={{ fontSize: '0.95rem' }}
            >
              <div className="font-semibold mb-1 truncate" title={mix.name}>{mix.name}</div>
              <ul className="list-disc pl-4 text-xs mb-2">
                {Object.entries(mix.mix_json).map(([foodId, percent]) => {
                  const food = foods.find(f => f.id === foodId);
                  if (!food) return null;
                  return (
                    <li key={foodId}>{food.name}: {percent}%</li>
                  );
                })}
              </ul>
              <div className="flex gap-1 flex-wrap">
                <button className="btn-primary btn-xs" onClick={() => onApply(mix)}>
                  Apply
                </button>
                <button
                  className="btn-danger btn-xs"
                  onClick={() => setConfirmDeleteId(mix.id)}
                  disabled={deletingId === mix.id}
                >
                  {deletingId === mix.id ? 'Deleting...' : 'Delete'}
                </button>
                <button className="btn-secondary btn-xs" onClick={() => onAssign(mix)}>
                  Assign
                </button>
                {confirmDeleteId === mix.id && (
                  <span className="ml-1">
                    Confirm?{' '}
                    <button onClick={() => onDelete(mix.id)} disabled={deletingId === mix.id}>Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)} disabled={deletingId === mix.id}>No</button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMixesPanel; 