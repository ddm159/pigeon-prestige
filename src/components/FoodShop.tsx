import React from 'react';
import { useAuth } from '../contexts/useAuth';
import LoadingSpinner from './LoadingSpinner';
import FoodCard from './FoodCard';
import { useFoodShopLogic } from '../hooks/useFoodShopLogic';
import type { User } from '../types/pigeon';

const FoodShopMain: React.FC<{ gameUser: User; refreshUser: () => Promise<void> }> = ({ gameUser, refreshUser }) => {
  const logic = useFoodShopLogic(gameUser, refreshUser);

  if (logic.loading) {
    return <LoadingSpinner />;
  }
  if (!gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  if (logic.error) {
    return <div className="text-center py-12 text-red-600">{logic.error}</div>;
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
        {logic.inventoryLoading ? (
          <div className="mt-2 text-sm text-yellow-100">Loading inventory...</div>
        ) : logic.inventoryError ? (
          <div className="mt-2 text-sm text-red-200">{logic.inventoryError}</div>
        ) : null}
        {logic.buyError && (
          <div className="mt-2 text-sm text-red-200">{logic.buyError}</div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logic.foods.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No foods available. Please check back later or contact support.
          </div>
        ) : (
          logic.foods.map(food => {
            const inv = logic.inventory.find(i => i.food_id === food.id);
            return (
              <FoodCard
                key={food.id}
                food={food}
                inventory={inv}
                quantity={logic.quantities[food.id] || 1}
                onQuantityChange={value => logic.handleQuantityChange(food.id, value)}
                onBuy={() => logic.handleBuy(food)}
                buying={logic.buying === food.id}
                disabled={logic.inventoryLoading || !gameUser}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

const FoodShop: React.FC = () => {
  const { user, gameUser, loading, refreshUser } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (user && !gameUser) {
    return <div className="text-center py-12 text-blue-600">Loading your profile...</div>;
  }
  if (!user || !gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  return <FoodShopMain gameUser={gameUser} refreshUser={refreshUser} />;
};

export default FoodShop; 