import React, { useEffect, useState } from 'react';
import GroupFilterPanel from './GroupFilterPanel';
import { useGroupFeedingLogic } from '../hooks/useGroupFeedingLogic';
import AssignMixModal from './AssignMixModal';
import { useAssignMixLogic } from '../hooks/useAssignMixLogic';
import type { Food } from '../types/pigeon';
import { foodService } from '../services/foodService';

const GroupFeeding: React.FC = () => {
  // TODO: Replace with real user ID from auth context
  const userId = 'me';
  const logic = useGroupFeedingLogic(userId);
  const assignLogic = useAssignMixLogic();
  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    foodService.listFoods().then(setFoods);
  }, []);

  if (logic.loading) return <div>Loading group feeding...</div>;
  if (logic.error) return <div style={{ color: 'red' }}>{logic.error}</div>;

  return (
    <div>
      <h3>Group Feeding</h3>
      <button
        className="mb-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        onClick={() => logic.setShowAdvancedFilters(f => !f)}
      >
        {logic.showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      <GroupFilterPanel
        showAdvancedFilters={logic.showAdvancedFilters}
        filters={logic.filters}
        setFilters={logic.setFilters}
        selectedGroup={logic.selectedGroup}
        setSelectedGroup={logic.setSelectedGroup}
      />
      <div style={{ marginBottom: 16 }}>
        <label>
          Group:
          <select
            value={logic.selectedGroup?.id || ''}
            onChange={e => {
              const group = logic.groups.find(g => g.id === e.target.value) || null;
              logic.setSelectedGroup(group);
            }}
          >
            {logic.filteredGroups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 16 }}>
          Food Mix:
          <select value={logic.selectedMix} onChange={e => logic.setSelectedMix(e.target.value)}>
            {logic.mixes.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>
        <button style={{ marginLeft: 16 }} onClick={logic.handleApply} disabled={logic.applying || !logic.selectedGroup || !logic.selectedMix}>
          {logic.applying ? 'Applying...' : 'Apply Mix to Group'}
        </button>
      </div>
      {/* Assign Mix Button for each group */}
      <div style={{ marginBottom: 16 }}>
        <strong>Assign Mix to Group:</strong>
        <ul>
          {logic.filteredGroups.map(g => (
            <li key={g.id} style={{ marginBottom: 8 }}>
              {g.name} ({g.pigeon_count || 0} pigeons)
              <button
                style={{ marginLeft: 8 }}
                data-testid={`assign-mix-${g.id}`}
                onClick={() => assignLogic.openAssignModal({
                  id: 'mock-mix',
                  name: 'Mock Mix',
                  user_id: userId,
                  mix_json: {},
                  created_at: '',
                  updated_at: ''
                })}
              >
                Assign Mix
              </button>
            </li>
          ))}
        </ul>
      </div>
      <AssignMixModal
        open={assignLogic.assignModalOpen}
        selectedMix={assignLogic.selectedMix}
        assignTargetType={assignLogic.assignTargetType}
        setAssignTargetType={assignLogic.setAssignTargetType}
        pigeons={assignLogic.pigeons}
        groups={assignLogic.groups}
        foods={foods}
        selectedTargetId={assignLogic.selectedTargetId}
        setSelectedTargetId={assignLogic.setSelectedTargetId}
        onCancel={assignLogic.closeAssignModal}
        onAssign={assignLogic.handleConfirmAssign}
        assigning={assignLogic.assigning}
        assignError={assignLogic.assignError}
        assignSuccess={assignLogic.assignSuccess}
      />
      {/* TODO: Add tests for GroupFeeding component */}
    </div>
  );
};

export default GroupFeeding; 