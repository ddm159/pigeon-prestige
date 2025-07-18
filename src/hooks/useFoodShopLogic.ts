import { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import type { Food, UserFoodInventory, User as GameUser } from '../types/pigeon';

export function useFoodShopLogic(gameUser: GameUser, refreshUser: () => Promise<void>) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [inventory, setInventory] = useState<UserFoodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
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
    setInventoryLoading(true);
    foodService.getUserInventory(gameUser.id)
      .then(data => {
        setInventory(data);
        setInventoryError(null);
        setInventoryLoading(false);
      })
      .catch((err) => {
        setInventoryError(err.message || 'Failed to load inventory');
        setInventoryLoading(false);
      });
  }, [gameUser]);

  const handleQuantityChange = (foodId: string, value: number) => {
    setQuantities((q) => ({ ...q, [foodId]: Math.max(1, value) }));
  };

  const handleBuy = async (food: Food) => {
    if (!gameUser) return;
    setBuying(food.id);
    setBuyError(null);
    const qty = quantities[food.id] || 1;
    try {
      await foodService.purchaseFood(gameUser.id, food, qty);
      await refreshUser();
      const updated = await foodService.getUserInventory(gameUser.id);
      setInventory(updated);
    } catch (e) {
      setBuyError((e as Error).message || 'Failed to buy food');
    } finally {
      setBuying(null);
    }
  };

  return {
    foods,
    inventory,
    loading,
    error,
    inventoryLoading,
    inventoryError,
    quantities,
    buying,
    buyError,
    handleQuantityChange,
    handleBuy,
  };
} 