import React from 'react';
import type { Food } from '../types/pigeon';

export interface FoodSelectionGridProps {
  foods: Food[];
  mix: Record<string, number>;
  onAdd: (foodId: string) => void;
  onRemove: (foodId: string) => void;
}

const FoodSelectionGrid: React.FC<FoodSelectionGridProps> = ({ foods, mix, onAdd, onRemove }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-2">Available Foods</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {foods.map(food => (
        <div key={food.id} className="border rounded p-3 flex flex-col items-center">
          <div className="font-medium mb-1">{food.name}</div>
          <div className="text-xs text-gray-500 mb-2">{food.description}</div>
          {mix[food.id] ? (
            <button className="text-red-600 text-xs" onClick={() => onRemove(food.id)}>
              Remove from Mix
            </button>
          ) : (
            <button className="btn-primary text-xs" onClick={() => onAdd(food.id)}>
              Add to Mix
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default FoodSelectionGrid; 