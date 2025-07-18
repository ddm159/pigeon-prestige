import React, { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import { useAuth } from '../contexts/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Food, User as GameUser, FoodMix } from '../types/pigeon';

const FeedingCenterMain: React.FC<{ gameUser: GameUser }> = ({ gameUser }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [mix, setMix] = useState<Record<string, number>>({}); // foodId -> percentage
  const [mixName, setMixName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [savedMixes, setSavedMixes] = useState<FoodMix[]>([]);
  const [loadingMixes, setLoadingMixes] = useState(false);
  const [mixesError, setMixesError] = useState<string | null>(null);

  useEffect(() => {
    foodService.listFoods()
      .then(setFoods)
      .catch((err) => setError(err.message || 'Failed to load foods'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!gameUser) return;
    setLoadingMixes(true);
    foodService.listFoodMixes(gameUser.id)
      .then(setSavedMixes)
      .catch((err) => setMixesError(err.message || 'Failed to load saved mixes'))
      .finally(() => setLoadingMixes(false));
  }, [gameUser]);

  const handleAddFood = (foodId: string) => {
    setMix((prev) => ({ ...prev, [foodId]: prev[foodId] || 1 }));
  };

  const handleRemoveFood = (foodId: string) => {
    setMix((prev) => {
      const copy = { ...prev };
      delete copy[foodId];
      return copy;
    });
  };

  const handlePercentChange = (foodId: string, value: number) => {
    setMix((prev) => ({ ...prev, [foodId]: Math.max(0, Math.min(100, value)) }));
  };

  const totalPercent = Object.values(mix).reduce((a, b) => a + b, 0);
  const canSave = mixName.trim().length > 0 && Object.keys(mix).length > 0 && totalPercent === 100;

  const handleSaveMix = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    if (!canSave || !gameUser) return;
    try {
      await foodService.createFoodMix(gameUser.id, mixName.trim(), mix);
      setSaveSuccess('Mix saved!');
      setMix({});
      setMixName('');
      // Refresh saved mixes
      setLoadingMixes(true);
      const mixes = await foodService.listFoodMixes(gameUser.id);
      setSavedMixes(mixes);
      setLoadingMixes(false);
    } catch (e) {
      setSaveError((e as Error).message || 'Failed to save mix');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">Feeding Center</h1>
      <p className="text-gray-600 mb-6 text-center">Mix, save, and apply custom food blends to your pigeons and groups.</p>
      {/* Mix creation UI (unchanged) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Available Foods</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {foods.map(food => (
            <div key={food.id} className="border rounded p-3 flex flex-col items-center">
              <div className="font-medium mb-1">{food.name}</div>
              <div className="text-xs text-gray-500 mb-2">{food.description}</div>
              {mix[food.id] ? (
                <button className="text-red-600 text-xs" onClick={() => handleRemoveFood(food.id)}>
                  Remove from Mix
                </button>
              ) : (
                <button className="btn-primary text-xs" onClick={() => handleAddFood(food.id)}>
                  Add to Mix
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Current Mix</h2>
        {Object.keys(mix).length === 0 ? (
          <div className="text-gray-400">No foods selected. Add foods to start your mix.</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(mix).map(([foodId, percent]) => {
              const food = foods.find(f => f.id === foodId);
              if (!food) return null;
              return (
                <div key={foodId} className="flex items-center gap-3">
                  <div className="w-32 font-medium">{food.name}</div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={percent}
                    onChange={e => handlePercentChange(foodId, Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    aria-label={`Percent for ${food.name}`}
                  />
                  <span className="text-xs text-gray-500">%</span>
                  <button className="text-red-500 text-xs" onClick={() => handleRemoveFood(foodId)}>
                    Remove
                  </button>
                </div>
              );
            })}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold">Total:</span>
              <span className={totalPercent === 100 ? 'text-green-600' : 'text-red-600'}>{totalPercent}%</span>
              {totalPercent !== 100 && <span className="text-xs text-red-500">(Must total 100%)</span>}
            </div>
          </div>
        )}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Mix Name</h2>
        <input
          type="text"
          value={mixName}
          onChange={e => setMixName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Enter a name for your mix"
          maxLength={32}
        />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
        {Object.keys(mix).length === 0 ? (
          <div className="text-gray-400">No mix to preview.</div>
        ) : (
          <ul className="list-disc pl-6">
            {Object.entries(mix).map(([foodId, percent]) => {
              const food = foods.find(f => f.id === foodId);
              if (!food) return null;
              return (
                <li key={foodId}>
                  {food.name}: {percent}%
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="text-center mb-12">
        <button
          className={`btn-primary ${canSave ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!canSave}
          onClick={handleSaveMix}
        >
          Save Mix
        </button>
        {saveError && <div className="text-red-600 mt-2">{saveError}</div>}
        {saveSuccess && <div className="text-green-600 mt-2">{saveSuccess}</div>}
      </div>
      {/* Saved Mixes Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Saved Mixes</h2>
        {loadingMixes ? (
          <div className="text-gray-400">Loading saved mixes...</div>
        ) : mixesError ? (
          <div className="text-red-600">{mixesError}</div>
        ) : savedMixes.length === 0 ? (
          <div className="text-gray-400">No saved mixes yet.</div>
        ) : (
          <ul className="space-y-4">
            {savedMixes.map((mix) => (
              <li key={mix.id} className="border rounded p-4">
                <div className="font-semibold mb-1">{mix.name}</div>
                <ul className="list-disc pl-6 text-sm">
                  {Object.entries(mix.mix_json).map(([foodId, percent]) => {
                    const food = foods.find(f => f.id === foodId);
                    if (!food) return null;
                    return (
                      <li key={foodId}>{food.name}: {percent}%</li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const FeedingCenterPage: React.FC = () => {
  const { gameUser, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  return <FeedingCenterMain gameUser={gameUser} />;
};

export default FeedingCenterPage; 