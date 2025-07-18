import React, { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import { useAuth } from '../contexts/useAuth';
import LoadingSpinner from './LoadingSpinner';
import type { Food, UserFoodInventory, User as GameUser } from '../types/pigeon';

const FoodShopMain: React.FC<{ gameUser: GameUser; refreshUser: () => Promise<void> }> = ({ gameUser, refreshUser }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [inventory, setInventory] = useState<UserFoodInventory[]>([]); // Assuming UserFoodInventory is not directly imported here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    foodService.listFoods()
      .then(setFoods)
      .catch((err) => setError(err.message || 'Failed to load foods'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!gameUser) return;
    setInventoryLoading(true);
    foodService.getUserInventory(gameUser.id)
      .then(setInventory)
      .catch((err) => setInventoryError(err.message || 'Failed to load inventory'))
      .finally(() => setInventoryLoading(false));
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
      await refreshUser(); // Refresh user profile to update balance
      const updated = await foodService.getUserInventory(gameUser.id);
      setInventory(updated);
    } catch (e) {
      console.error('Buy error:', e); // Log error for debugging
      setBuyError((e as Error).message || 'Failed to buy food');
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Food Shop</h1>
        <p className="text-green-100">Buy food for your pigeons and manage your inventory!</p>
        {gameUser && (
          <div className="mt-4 text-lg font-semibold">
            Balance: <span className="text-yellow-200">${gameUser.balance.toLocaleString()}</span>
          </div>
        )}
        {inventoryLoading ? (
          <div className="mt-2 text-sm text-yellow-100">Loading inventory...</div>
        ) : inventoryError ? (
          <div className="mt-2 text-sm text-red-200">{inventoryError}</div>
        ) : null}
        {buyError && (
          <div className="mt-2 text-sm text-red-200">{buyError}</div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No foods available. Please check back later or contact support.
          </div>
        ) : (
          foods.map(food => {
            const inv = inventory.find(i => i.food_id === food.id);
            return (
              <div key={food.id} className="card p-4">
                <h2 className="text-xl font-semibold mb-1">{food.name}</h2>
                <div className="text-green-700 font-bold mb-2">${food.price}</div>
                {food.best_for && <div className="text-sm text-gray-500 mb-1">Best for: {food.best_for}</div>}
                <div className="text-gray-700 mb-2">{food.description}</div>
                <div className="text-sm text-blue-700 mb-2">Inventory: {inv ? inv.quantity : 0}</div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min={1}
                    value={quantities[food.id] || 1}
                    onChange={e => handleQuantityChange(food.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded"
                    aria-label={`Quantity for ${food.name}`}
                    disabled={buying === food.id}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => handleBuy(food)}
                    disabled={buying === food.id || inventoryLoading || !gameUser}
                  >
                    {buying === food.id ? 'Buying...' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FoodShop: React.FC = () => {
  const { gameUser, loading, refreshUser } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  return <FoodShopMain gameUser={gameUser} refreshUser={refreshUser} />;
};

export default FoodShop; 