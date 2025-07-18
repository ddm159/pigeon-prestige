import React from 'react';
import type { Food } from '../types/pigeon';

export interface MixEditorProps {
  foods: Food[];
  mix: Record<string, number>;
  onPercentChange: (foodId: string, value: number) => void;
  onRemove: (foodId: string) => void;
  totalPercent: number;
  gritWarning: string | null;
}

const MixEditor: React.FC<MixEditorProps> = ({ foods, mix, onPercentChange, onRemove, totalPercent, gritWarning }) => (
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
                onChange={e => onPercentChange(foodId, Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
                aria-label={`Percent for ${food.name}`}
              />
              <span className="text-xs text-gray-500">%</span>
              <button className="text-red-500 text-xs" onClick={() => onRemove(foodId)}>
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
        {gritWarning && (
          <div style={{ color: 'orange', marginTop: 4 }}>{gritWarning}</div>
        )}
      </div>
    )}
  </div>
);

export default MixEditor; 