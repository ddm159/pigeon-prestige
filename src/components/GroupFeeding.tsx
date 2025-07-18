import React from 'react';
import { foodService } from '../services/foodService';
import { groupService } from '../services/gameServices';
import type { FoodMix, PigeonGroup } from '../types/pigeon';

const GroupFeeding: React.FC = () => {
  const [groups, setGroups] = React.useState<PigeonGroup[]>([]);
  const [mixes, setMixes] = React.useState<FoodMix[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState<string>('');
  const [selectedMix, setSelectedMix] = React.useState<string>('');
  const [applying, setApplying] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // TODO: Replace with real user ID from auth context
  const userId = 'me';

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      groupService.getGroupsForUser(userId),
      foodService.listFoodMixes(userId),
    ])
      .then(([groups, mixes]) => {
        setGroups(groups);
        setMixes(mixes);
        setSelectedGroup(groups[0]?.id || '');
        setSelectedMix(mixes[0]?.id || '');
        setError(null);
      })
      .catch((e: Error) => setError(e.message || 'Failed to load group feeding'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      await foodService.applyFoodMixToGroup(selectedGroup, selectedMix);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to apply mix');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div>Loading group feeding...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Group Feeding</h3>
      <div style={{ marginBottom: 16 }}>
        <label>
          Group:
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 16 }}>
          Food Mix:
          <select value={selectedMix} onChange={e => setSelectedMix(e.target.value)}>
            {mixes.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>
        <button style={{ marginLeft: 16 }} onClick={handleApply} disabled={applying || !selectedGroup || !selectedMix}>
          {applying ? 'Applying...' : 'Apply Mix to Group'}
        </button>
      </div>
      {/* TODO: Add tests for GroupFeeding component */}
    </div>
  );
};

export default GroupFeeding; 