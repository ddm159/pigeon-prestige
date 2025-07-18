import React from 'react';
import type { Food, UserFoodInventory } from '../types/pigeon';

export interface FoodCardProps {
  food: Food;
  inventory: UserFoodInventory | undefined;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onBuy: () => void;
  buying: boolean;
  disabled: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  inventory,
  quantity,
  onQuantityChange,
  onBuy,
  buying,
  disabled,
}) => (
  <div className="card p-4">
    <h2 className="text-xl font-semibold mb-1">{food.name}</h2>
    <div className="text-green-700 font-bold mb-2">${food.price}</div>
    {food.best_for && <div className="text-sm text-gray-500 mb-1">Best for: {food.best_for}</div>}
    <div className="text-gray-700 mb-2">{food.description}</div>
    <div className="text-sm text-blue-700 mb-2">Inventory: {inventory ? inventory.quantity : 0}</div>
    <div className="flex items-center gap-2 mb-2">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={e => onQuantityChange(Number(e.target.value))}
        className="w-16 px-2 py-1 border rounded"
        aria-label={`Quantity for ${food.name}`}
        disabled={buying || disabled}
      />
      <button
        className="btn-primary"
        onClick={onBuy}
        disabled={buying || disabled}
      >
        {buying ? 'Buying...' : 'Buy'}
      </button>
    </div>
  </div>
);

export default FoodCard; 