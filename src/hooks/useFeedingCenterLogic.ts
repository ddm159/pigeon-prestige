import { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import type { Food, User as GameUser, FoodMix } from '../types/pigeon';

export function useFeedingCenterLogic(gameUser: GameUser) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [mix, setMix] = useState<Record<string, number>>({});
  const [mixName, setMixName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [savedMixes, setSavedMixes] = useState<FoodMix[]>([]);
  const [loadingMixes, setLoadingMixes] = useState(false);
  const [mixesError, setMixesError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    foodService.listFoods()
      .then(data => {
        setFoods(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load foods');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!gameUser) return;
    setLoadingMixes(true);
    foodService.listFoodMixes(gameUser.id)
      .then(data => {
        setSavedMixes(data);
        setMixesError(null);
        setLoadingMixes(false);
      })
      .catch((err) => {
        setMixesError(err.message || 'Failed to load saved mixes');
        setLoadingMixes(false);
      });
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
      setLoadingMixes(true);
      const mixes = await foodService.listFoodMixes(gameUser.id);
      setSavedMixes(mixes);
      setLoadingMixes(false);
    } catch (e) {
      setSaveError((e as Error).message || 'Failed to save mix');
    }
  };

  return {
    foods,
    mix,
    setMix,
    mixName,
    setMixName,
    loading,
    error,
    saveError,
    saveSuccess,
    savedMixes,
    loadingMixes,
    mixesError,
    handleAddFood,
    handleRemoveFood,
    handlePercentChange,
    totalPercent,
    canSave,
    handleSaveMix,
  };
} 