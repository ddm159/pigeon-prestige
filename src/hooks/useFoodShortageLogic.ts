import { useState, useEffect, useCallback } from 'react';
import { foodService } from '../services/foodService';
import type { PigeonFeedHistory } from '../types/pigeon';

export interface FoodShortageInfo {
  pigeon_id: string;
  pigeon_name: string;
  food_shortage_streak: number;
  current_health: number;
  last_penalty_date?: string;
  assigned_food_mix?: string;
}

export interface FoodShortageSummary {
  total_pigeons_with_shortages: number;
  pigeons_experiencing_shortages: FoodShortageInfo[];
  total_health_penalties_today: number;
  average_shortage_streak: number;
}

export const useFoodShortageLogic = (userId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortageSummary, setShortageSummary] = useState<FoodShortageSummary | null>(null);
  const [recentShortages, setRecentShortages] = useState<PigeonFeedHistory[]>([]);

  const fetchFoodShortageData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get pigeons with food shortages
      const pigeonsWithShortages = await foodService.getPigeonsWithFoodShortages(userId);
      
      // Get recent food shortage events
      const recentEvents = await foodService.getRecentFoodShortageEvents(userId);
      
      // Calculate summary statistics
      const summary: FoodShortageSummary = {
        total_pigeons_with_shortages: pigeonsWithShortages.length,
        pigeons_experiencing_shortages: pigeonsWithShortages,
        total_health_penalties_today: recentEvents.filter((e: PigeonFeedHistory) => e.food_shortage).length,
        average_shortage_streak: pigeonsWithShortages.length > 0 
          ? pigeonsWithShortages.reduce((sum: number, p: FoodShortageInfo) => sum + p.food_shortage_streak, 0) / pigeonsWithShortages.length
          : 0
      };
      
      setShortageSummary(summary);
      setRecentShortages(recentEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch food shortage data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getShortageSeverity = (streak: number): 'none' | 'low' | 'medium' | 'high' | 'critical' => {
    if (streak === 0) return 'none';
    if (streak === 1) return 'low';
    if (streak <= 3) return 'medium';
    if (streak <= 7) return 'high';
    return 'critical';
  };

  const getShortageColor = (severity: 'none' | 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'none': return 'text-success-600';
      case 'low': return 'text-warning-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getShortageBgColor = (severity: 'none' | 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'none': return 'bg-success-50 border-success-200';
      case 'low': return 'bg-warning-50 border-warning-200';
      case 'medium': return 'bg-orange-50 border-orange-200';
      case 'high': return 'bg-red-50 border-red-200';
      case 'critical': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    fetchFoodShortageData();
  }, [fetchFoodShortageData]);

  return {
    loading,
    error,
    shortageSummary,
    recentShortages,
    getShortageSeverity,
    getShortageColor,
    getShortageBgColor,
    refreshData: fetchFoodShortageData
  };
}; 