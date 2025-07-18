import React from 'react';
import type { FoodMix, Pigeon, PigeonGroup, Food } from '../types/pigeon';

export interface AssignMixModalProps {
  open: boolean;
  selectedMix: FoodMix | null;
  assignTargetType: 'pigeon' | 'group';
  setAssignTargetType: (type: 'pigeon' | 'group') => void;
  pigeons: Pigeon[];
  groups: PigeonGroup[];
  foods: Food[];
  selectedTargetId: string;
  setSelectedTargetId: (id: string) => void;
  onCancel: () => void;
  onAssign: () => void;
  assigning: boolean;
  assignError: string | null;
  assignSuccess: string | null;
}

const AssignMixModal: React.FC<AssignMixModalProps> = ({
  open,
  selectedMix,
  assignTargetType,
  setAssignTargetType,
  pigeons,
  groups,
  foods,
  selectedTargetId,
  setSelectedTargetId,
  onCancel,
  onAssign,
  assigning,
  assignError,
  assignSuccess,
}) => {
  if (!open || !selectedMix) return null;
  return (
    <div role="dialog" className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Assign Food Mix</h2>
        <div className="mb-2">Mix: <strong>{selectedMix.name}</strong></div>
        <div className="mb-4 text-sm text-gray-600">
          <ul className="list-disc pl-6">
            {Object.entries(selectedMix.mix_json).map(([fid, pct]) => {
              const food = foods.find(f => f.id === fid);
              if (!food) return null;
              return <li key={fid}>{food.name}: {pct}%</li>;
            })}
          </ul>
        </div>
        <div className="mb-4">
          <label>
            <input
              type="radio"
              checked={assignTargetType === 'pigeon'}
              onChange={() => setAssignTargetType('pigeon')}
            /> Assign to Pigeon
          </label>
          <label style={{ marginLeft: 16 }}>
            <input
              type="radio"
              checked={assignTargetType === 'group'}
              onChange={() => setAssignTargetType('group')}
            /> Assign to Group
          </label>
        </div>
        <div className="mb-4">
          {assignTargetType === 'pigeon' ? (
            <select
              aria-label="Select a pigeon"
              className="w-full px-2 py-1 border rounded"
              value={selectedTargetId}
              onChange={e => setSelectedTargetId(e.target.value)}
            >
              <option value="">Select a pigeon</option>
              {pigeons.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.gender}, {p.age_years}y)</option>
              ))}
            </select>
          ) : (
            <select
              aria-label="Select a group"
              className="w-full px-2 py-1 border rounded"
              value={selectedTargetId}
              onChange={e => setSelectedTargetId(e.target.value)}
            >
              <option value="">Select a group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.pigeon_count || (g.pigeons ? g.pigeons.length : 0)} pigeons)</option>
              ))}
            </select>
          )}
        </div>
        {assignError && <div className="text-red-600 mb-2">{assignError}</div>}
        {assignSuccess && <div className="text-green-600 mb-2">{assignSuccess}</div>}
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 border rounded" disabled={assigning}>Cancel</button>
          <button
            onClick={onAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={!selectedTargetId || assigning}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMixModal; 