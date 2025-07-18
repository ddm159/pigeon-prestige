import React from 'react';
import { foodService } from '../services/foodService';
import type { Food, FoodMix } from '../types/pigeon';
import { useAuth } from '../contexts/useAuth';
import { useAssignMixLogic } from '../hooks/useAssignMixLogic';
import AssignMixModal from './AssignMixModal';

const FoodMixer: React.FC = () => {
  const [foods, setFoods] = React.useState<Food[]>([]);
  const [mix, setMix] = React.useState<Record<string, number>>({});
  const [mixName, setMixName] = React.useState('');
  const [mixes, setMixes] = React.useState<FoodMix[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  // TODO: Replace with real user ID from auth context
  const userId = 'me';
  const { user } = useAuth();
  const assignLogic = useAssignMixLogic();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      foodService.listFoods(),
      foodService.listFoodMixes(userId),
    ])
      .then(([foods, mixes]) => {
        setFoods(foods);
        setMixes(mixes);
        setError(null);
        // Set default mix to all zeros
        const defaultMix: Record<string, number> = {};
        foods.forEach(f => { defaultMix[f.id] = 0; });
        setMix(defaultMix);
      })
      .catch((e: Error) => setError(e.message || 'Failed to load food mixer'))
      .finally(() => setLoading(false));
  }, [userId, user]);

  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  // Grit is now optional, not required for saving a mix
  // const gritFood = foods.find(f => f.name.toLowerCase() === 'grit');
  // const hasGrit = gritFood ? (mix[gritFood.id] ?? 0) > 0 : false;
  // const gritWarning = !hasGrit ? 'Warning: All mixes must include Grit for healthy digestion.' : null;

  const handleChange = (foodId: string, value: number) => {
    setMix(m => ({ ...m, [foodId]: Math.max(0, Math.min(100, value)) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await foodService.createFoodMix(userId, mixName, mix);
      const updated = await foodService.listFoodMixes(userId);
      setMixes(updated);
      setMixName('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save mix');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mixId: string) => {
    setDeleting(mixId);
    setError(null);
    try {
      await foodService.deleteFoodMix(mixId);
      const updated = await foodService.listFoodMixes(userId);
      setMixes(updated);
      setConfirmDeleteId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete mix');
    } finally {
      setDeleting(null);
    }
  };

  const handleApply = (mix: FoodMix) => {
    setMix({ ...mix.mix_json });
    setMixName(mix.name);
  };

  if (loading) return <div>Loading food mixer...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Food Mixer</h3>
      <div style={{ marginBottom: 16 }}>
        <strong>Create a Mix:</strong>
        <div>
          {foods.map(food => (
            <div key={food.id} style={{ marginBottom: 8 }}>
              <label>
                {food.name}: 
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={mix[food.id] || 0}
                  onChange={e => handleChange(food.id, Number(e.target.value))}
                  style={{ width: 60, marginLeft: 8 }}
                  disabled={saving}
                />%
              </label>
            </div>
          ))}
        </div>
        <div>Total: {total}%</div>
        {/* Grit is now optional; no warning needed */}
        <input
          type="text"
          placeholder="Mix name"
          value={mixName}
          onChange={e => setMixName(e.target.value)}
          style={{ marginTop: 8, marginBottom: 8 }}
          disabled={saving}
        />
        <button onClick={handleSave} disabled={total !== 100 || !mixName || saving}>
          {saving ? 'Saving...' : 'Save Mix'}
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Saved Mixes:</strong>
        <ul>
          {mixes.map(m => (
            <li key={m.id}>
              {m.name} ({Object.entries(m.mix_json).map(([fid, pct]) => `${foods.find(f => f.id === fid)?.name || fid}: ${pct}%`).join(', ')})
              <button style={{ marginLeft: 8 }} onClick={() => handleApply(m)} disabled={false}>Apply</button>
              <button
                style={{ marginLeft: 4 }}
                data-testid={`delete-mix-${m.id}`}
                onClick={() => setConfirmDeleteId(m.id)}
                disabled={deleting === m.id}
              >
                {deleting === m.id ? 'Deleting...' : 'Delete'}
              </button>
              <button style={{ marginLeft: 4 }} onClick={() => assignLogic.openAssignModal(m)} disabled={false}>
                Assign
              </button>
              {confirmDeleteId === m.id && (
                <span style={{ marginLeft: 8 }}>
                  Confirm?{' '}
                  <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id}>Yes</button>
                  <button onClick={() => setConfirmDeleteId(null)} disabled={deleting === m.id}>No</button>
                </span>
              )}
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
      {/* TODO: Add live preview (pie/bar), add tests for FoodMixer component */}
    </div>
  );
};

export default FoodMixer; 