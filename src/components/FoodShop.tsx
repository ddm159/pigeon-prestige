import React, { useEffect, useState } from 'react';
import { foodService } from '../services/foodService';
import { useAuth } from '../contexts/useAuth';
import type { UserFoodInventory } from '../types/pigeon';

interface Food {
  id: string;
  name: string;
  price: number;
  best_for?: string;
  description?: string;
}

const FoodShop: React.FC = () => {
  const { gameUser } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [inventory, setInventory] = useState<UserFoodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="text-center py-12">Loading foods...</div>;
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map(food => {
          const inv = inventory.find(i => i.food_id === food.id);
          return (
            <div key={food.id} className="card p-4">
              <h2 className="text-xl font-semibold mb-1">{food.name}</h2>
              <div className="text-green-700 font-bold mb-2">${food.price}</div>
              {food.best_for && <div className="text-sm text-gray-500 mb-1">Best for: {food.best_for}</div>}
              <div className="text-gray-700 mb-2">{food.description}</div>
              <div className="text-sm text-blue-700 mb-2">Inventory: {inv ? inv.quantity : 0}</div>
              {/* Buy button and inventory will be implemented next */}
              <div className="text-gray-400 text-xs">Buy functionality coming soon</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FoodShop; 