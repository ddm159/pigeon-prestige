import React from 'react';
import { foodService } from '../services/foodService';
import type { Food, FoodMix } from '../types/pigeon';

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
  }, [userId]);

  const total = Object.values(mix).reduce((a, b) => a + b, 0);

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
              <button style={{ marginLeft: 4 }} onClick={() => handleDelete(m.id)} disabled={deleting === m.id}>
                {deleting === m.id ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* TODO: Add live preview (pie/bar), add tests for FoodMixer component */}
    </div>
  );
};

export default FoodMixer; 