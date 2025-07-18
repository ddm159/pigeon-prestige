import React from 'react';
import type { Pigeon } from '../types/pigeon';
import { getPigeonPicture } from '../services/pigeonUtils';
import { Heart, Trash2, Award } from 'lucide-react';
import StatBar from './StatBar';

interface PigeonListItemProps {
  pigeon: Pigeon;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onBreed: (pigeon: Pigeon) => void;
  onDelete: (id: string) => void;
}

const PigeonListItem: React.FC<PigeonListItemProps> = ({ pigeon, selected, onSelect, onBreed, onDelete }) => (
  <div className="card hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <input type="checkbox" checked={selected} onChange={e => onSelect(pigeon.id, e.target.checked)} className="mr-2" />
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <img src={getPigeonPicture(pigeon)} alt="Pigeon" className="w-16 h-16 object-cover" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{pigeon.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium mr-1 ${
                pigeon.gender === 'male' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {pigeon.gender === 'male' ? '♂' : '♀'}
              </span>
              {pigeon.age_years}y {pigeon.age_months}m {pigeon.age_days}d
            </span>
            <span>Speed: {pigeon.speed.toFixed(2)}</span>
            <span>Health: {pigeon.health.toFixed(2)}</span>
            <span>Endurance: {pigeon.endurance.toFixed(2)}</span>
            <span>Sky IQ: {pigeon.sky_iq.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="btn-secondary">
          <Award className="h-4 w-4 mr-1" />
          Race
        </button>
        <button 
          className="btn-secondary text-pink-600 hover:text-pink-700"
          onClick={() => onBreed(pigeon)}
        >
          <Heart className="h-4 w-4 mr-1" />
          Breed
        </button>
        <button 
          onClick={() => onDelete(pigeon.id)}
          className="btn-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    {/* Example: show a few stat bars in list view */}
    <div className="mt-2 space-y-1">
      <StatBar value={pigeon.speed} max={pigeon.peak_speed} label="Speed" />
      <StatBar value={pigeon.health} max={pigeon.peak_health} label="Health" />
      <StatBar value={pigeon.endurance} max={pigeon.peak_endurance} label="Endurance" />
      <StatBar value={pigeon.sky_iq} max={pigeon.peak_sky_iq} label="Sky IQ" />
    </div>
  </div>
);

export default PigeonListItem; 