import React from 'react';
import type { Pigeon } from '../types/pigeon';
import { getPigeonPicture } from '../services/pigeonUtils';
import { Heart, Trash2, Eye, Edit } from 'lucide-react';
import StatBar from '../components/StatBar';
import FoodShortageIndicator from './FoodShortageIndicator';

interface PigeonCardProps {
  pigeon: Pigeon;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onBreed: (pigeon: Pigeon) => void;
  onDelete: (id: string) => void;
}

const PigeonCard: React.FC<PigeonCardProps> = ({ pigeon, selected, onSelect, onBreed, onDelete }) => (
  <div className="card hover:shadow-md transition-shadow duration-200">
    {/* Pigeon Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        {/* Show pigeon image based on picture stat - bigger size */}
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          <img src={getPigeonPicture(pigeon)} alt="Pigeon" className="w-16 h-16 object-cover" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{pigeon.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              pigeon.gender === 'male' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-pink-100 text-pink-800'
            }`}>
              {pigeon.gender === 'male' ? '♂' : '♀'}
            </span>
            <span>{pigeon.age_years}y {pigeon.age_months}m {pigeon.age_days}d</span>
          </div>
          {/* Food Shortage Indicator */}
          <FoodShortageIndicator 
            foodShortageStreak={pigeon.food_shortage_streak || 0}
            currentHealth={pigeon.health}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex space-x-1">
        <input type="checkbox" checked={selected} onChange={e => onSelect(pigeon.id, e.target.checked)} className="mr-2" />
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Eye className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Edit className="h-4 w-4" />
        </button>
        <button 
          className="p-1 text-pink-400 hover:text-pink-600"
          onClick={() => onBreed(pigeon)}
          title="Breed"
        >
          <Heart className="h-4 w-4" />
        </button>
        <button 
          className="p-1 text-gray-400 hover:text-gray-600"
          onClick={() => onDelete(pigeon.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    {/* All Visible Stats */}
    <div className="mb-2 space-y-1">
      <StatBar value={pigeon.speed} max={pigeon.peak_speed} label="Speed" />
      <StatBar value={pigeon.endurance} max={pigeon.peak_endurance} label="Endurance" />
      <StatBar value={pigeon.sky_iq} max={pigeon.peak_sky_iq} label="Sky IQ" />
      <StatBar value={pigeon.aerodynamics} max={pigeon.peak_aerodynamics} label="Aerodynamics" />
      <StatBar value={pigeon.vision} max={pigeon.peak_vision} label="Vision" />
      <StatBar value={pigeon.wing_power} max={pigeon.peak_wing_power} label="Wing Power" />
      <StatBar value={pigeon.flapacity} max={pigeon.peak_flapacity} label="Flapacity" />
      <StatBar value={pigeon.vanity} max={100} label="Vanity" />
      <StatBar value={pigeon.strength} max={100} label="Strength" />
      <StatBar value={pigeon.aggression} max={100} label="Aggression" />
      <StatBar value={pigeon.landing} max={100} label="Landing" />
      <StatBar value={pigeon.loyalty} max={100} label="Loyalty" />
      <StatBar value={pigeon.health} max={pigeon.peak_health} label="Health" />
      <StatBar value={pigeon.happiness} max={pigeon.peak_happiness} label="Happiness" />
      <StatBar value={pigeon.fertility} max={pigeon.peak_fertility} label="Fertility" />
      <StatBar value={pigeon.disease_resistance} max={pigeon.peak_disease_resistance} label="Disease Resistance" />
    </div>
  </div>
);

export default PigeonCard; 