import React from 'react';
import { Heart } from 'lucide-react';

interface FoodShortageIndicatorProps {
  foodShortageStreak: number;
  currentHealth: number;
  className?: string;
}

const FoodShortageIndicator: React.FC<FoodShortageIndicatorProps> = ({ 
  foodShortageStreak, 
  currentHealth, 
  className = '' 
}) => {
  if (foodShortageStreak === 0) {
    return null; // Don't show anything if no shortage
  }

  const getSeverity = (streak: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (streak === 1) return 'low';
    if (streak <= 3) return 'medium';
    if (streak <= 7) return 'high';
    return 'critical';
  };

  const getSeverityConfig = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low':
        return {
          icon: '⚠️',
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          textColor: 'text-warning-700',
          iconColor: 'text-warning-600'
        };
      case 'medium':
        return {
          icon: '⚠️',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          iconColor: 'text-orange-600'
        };
      case 'high':
        return {
          icon: '🚨',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          iconColor: 'text-red-600'
        };
      case 'critical':
        return {
          icon: '💀',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          iconColor: 'text-red-700'
        };
    }
  };

  const severity = getSeverity(foodShortageStreak);
  const config = getSeverityConfig(severity);

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.borderColor} ${config.textColor} ${className}`}>
      <span className="text-xs">{config.icon}</span>
      <span>{foodShortageStreak}d</span>
      <Heart className={`h-3 w-3 ${config.iconColor}`} />
      <span>{currentHealth}</span>
    </div>
  );
};

export default FoodShortageIndicator; 