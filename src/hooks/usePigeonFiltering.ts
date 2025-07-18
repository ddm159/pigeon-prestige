import { useState, useEffect } from 'react';
import type { Pigeon, PigeonFilters, PigeonGroup } from '../types/pigeon';

const VISIBLE_STATS = [
  { key: 'speed', label: 'Speed' },
  { key: 'endurance', label: 'Endurance' },
  { key: 'sky_iq', label: 'Sky IQ' },
  { key: 'aerodynamics', label: 'Aerodynamics' },
  { key: 'vision', label: 'Vision' },
  { key: 'wing_power', label: 'Wing Power' },
  { key: 'flapacity', label: 'Flapacity' },
  { key: 'vanity', label: 'Vanity' },
  { key: 'strength', label: 'Strength' },
  { key: 'aggression', label: 'Aggression' },
  { key: 'landing', label: 'Landing' },
  { key: 'loyalty', label: 'Loyalty' },
  { key: 'health', label: 'Health' },
  { key: 'happiness', label: 'Happiness' },
  { key: 'fertility', label: 'Fertility' },
  { key: 'disease_resistance', label: 'Disease Resistance' },
];

export function usePigeonFiltering(
  pigeons: Pigeon[],
  selectedGroup: PigeonGroup | null,
  groupPigeons: string[]
) {
  const [filteredPigeons, setFilteredPigeons] = useState<Pigeon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PigeonFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...pigeons];
    
    // Filter by selected group
    if (selectedGroup && groupPigeons.length > 0) {
      filtered = filtered.filter(pigeon => groupPigeons.includes(pigeon.id));
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(pigeon =>
        pigeon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(pigeon => pigeon.gender === filters.gender);
    }
    
    // Filter by age range
    if (filters.ageRange) {
      filtered = filtered.filter(pigeon => {
        const totalMonths = pigeon.age_years * 12 + pigeon.age_months;
        const minMonths = (filters.ageRange?.minYears ?? 0) * 12 + (filters.ageRange?.minMonths ?? 0);
        const maxMonths = (filters.ageRange?.maxYears ?? 100) * 12 + (filters.ageRange?.maxMonths ?? 11);
        return totalMonths >= minMonths && totalMonths <= maxMonths;
      });
    }
    
    // Filter by status
    if (filters.isAlive !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.status === 'active');
    }
    
    if (filters.canBreed !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.fertility > 50 && pigeon.age_years >= 1);
    }
    
    if (filters.isInjured !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.status === 'injured');
    }
    
    // Filter by stat ranges
    if (filters.statFilters) {
      Object.entries(filters.statFilters).forEach(([stat, range]) => {
        if (
          range &&
          VISIBLE_STATS.some(s => s.key === stat) &&
          (typeof range.min === 'number' || typeof range.max === 'number')
        ) {
          filtered = filtered.filter(pigeon => {
            const value = pigeon[stat as keyof Pigeon] as number;
            if (typeof range.min === 'number' && value < range.min) return false;
            if (typeof range.max === 'number' && value > range.max) return false;
            return true;
          });
        }
      });
    }
    
    setFilteredPigeons(filtered);
  }, [pigeons, searchTerm, filters, selectedGroup, groupPigeons]);

  return {
    filteredPigeons,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  };
} 