import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { pigeonService } from '../services/supabase';
import { breedingService } from '../services/gameServices';
import { groupService } from '../services/gameServices';
import { getPigeonPicture } from '../services/pigeonUtils';
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  Heart, 
  Trash2,
  Eye,
  Edit,
  Award,
  X
} from 'lucide-react';
import type { Pigeon, PigeonFilters, ViewMode, PigeonGroup } from '../types/pigeon';

// Utility to format age as 3y 2m 4d, hiding zero values
function formatAge(years: number, months: number, days: number) {
  const parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}m`);
  if (days) parts.push(`${days}d`);
  if (parts.length === 0) return '0d';
  return parts.join(' ');
}

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

const PigeonOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [filteredPigeons, setFilteredPigeons] = useState<Pigeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PigeonFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);
  const [breedingPartners, setBreedingPartners] = useState<Pigeon[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Pigeon | null>(null);
  const [breedingLoading, setBreedingLoading] = useState(false);
  const [selectedPigeonIds, setSelectedPigeonIds] = useState<string[]>([]);
  const [showSaveGroupModal, setShowSaveGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);
  const [userGroups, setUserGroups] = useState<PigeonGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PigeonGroup | null>(null);
  const [groupPigeons, setGroupPigeons] = useState<string[]>([]);

  // Load user groups on mount
  useEffect(() => {
    if (user) {
      groupService.getGroupsForUser(user.id).then(setUserGroups).catch(console.error);
    }
  }, [user]);

  // Load pigeons for selected group
  useEffect(() => {
    const loadGroupPigeons = async () => {
      if (selectedGroup && user) {
        try {
          const pigeonsInGroup = await groupService.getPigeonsInGroup(selectedGroup.id);
          setGroupPigeons(pigeonsInGroup.map(p => p.id));
        } catch (error) {
          console.error('Error loading group pigeons:', error);
          setGroupPigeons([]);
        }
      } else {
        setGroupPigeons([]);
      }
    };

    loadGroupPigeons();
  }, [selectedGroup, user]);

  useEffect(() => {
    const loadPigeons = async () => {
      if (user) {
        try {
          const userPigeons = await pigeonService.getUserPigeons(user.id);
          setPigeons(userPigeons);
          setFilteredPigeons(userPigeons);
        } catch (error) {
          console.error('Error loading pigeons:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPigeons();
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...pigeons];

    // Group filter
    if (selectedGroup && groupPigeons.length > 0) {
      filtered = filtered.filter(pigeon => groupPigeons.includes(pigeon.id));
    }

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(pigeon =>
        pigeon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(pigeon => pigeon.gender === filters.gender);
    }

    // Age filter
    if (filters.ageRange) {
      filtered = filtered.filter(pigeon => {
        const totalMonths = pigeon.age_years * 12 + pigeon.age_months;
        const minMonths = (filters.ageRange?.minYears ?? 0) * 12 + (filters.ageRange?.minMonths ?? 0);
        const maxMonths = (filters.ageRange?.maxYears ?? 100) * 12 + (filters.ageRange?.maxMonths ?? 11);
        return totalMonths >= minMonths && totalMonths <= maxMonths;
      });
    }

    // Status filters
    if (filters.isAlive !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.status === 'active');
    }

    if (filters.canBreed !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.fertility > 50 && pigeon.age_years >= 1);
    }

    if (filters.isInjured !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.status === 'injured');
    }

    // Stat filters
    if (filters.statFilters) {
      Object.entries(filters.statFilters).forEach(([stat, range]) => {
        // Only filter if stat is in VISIBLE_STATS and range is not an empty object
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

  const handleDeletePigeon = async (pigeonId: string) => {
    if (window.confirm('Are you sure you want to delete this pigeon? This action cannot be undone.')) {
      try {
        await pigeonService.deletePigeon(pigeonId);
        setPigeons(pigeons.filter(p => p.id !== pigeonId));
      } catch (error) {
        console.error('Error deleting pigeon:', error);
      }
    }
  };

  const handleBreedingClick = (pigeon: Pigeon) => {
    // Check if pigeon can breed
    if (pigeon.fertility < 50 || pigeon.age_years < 1) {
      alert('This pigeon cannot breed. Pigeons must be at least 1 year old and have fertility above 50.');
      return;
    }

    setSelectedPigeon(pigeon);
    
    // Find compatible breeding partners (opposite gender, can breed)
    const partners = pigeons.filter(p => 
      p.id !== pigeon.id && 
      p.gender !== pigeon.gender && 
      p.fertility >= 50 && 
      p.age_years >= 1 &&
      p.status === 'active'
    );
    
    setBreedingPartners(partners);
    setSelectedPartner(null);
    setShowBreedingModal(true);
  };

  const handleBreeding = async () => {
    if (!selectedPigeon || !selectedPartner) return;
    
    setBreedingLoading(true);
    try {
      // Create breeding pair
      const breedingPair = await breedingService.createBreedingPair(
        selectedPigeon.gender === 'male' ? selectedPigeon.id : selectedPartner.id,
        selectedPigeon.gender === 'female' ? selectedPigeon.id : selectedPartner.id,
        user!.id
      );
      
      // Simulate breeding
      const result = await breedingService.simulateBreeding(breedingPair.id);
      
      if (result.success && result.offspring) {
        alert(`Breeding successful! New pigeon "${result.offspring.name}" has been created.`);
        // Refresh pigeons list
        const userPigeons = await pigeonService.getUserPigeons(user!.id);
        setPigeons(userPigeons);
        setFilteredPigeons(userPigeons);
      } else {
        alert('Breeding was not successful this time. Try again later!');
      }
      
      setShowBreedingModal(false);
    } catch (error) {
      console.error('Error during breeding:', error);
      alert('Error during breeding: ' + (error as Error).message);
    } finally {
      setBreedingLoading(false);
    }
  };

  const handleSelectPigeon = (id: string, checked: boolean) => {
    setSelectedPigeonIds(ids => checked ? [...ids, id] : ids.filter(pid => pid !== id));
  };

  const handleSaveGroup = async () => {
    if (!user || !groupName.trim() || selectedPigeonIds.length === 0) return;
    setSavingGroup(true);
    try {
      console.log('Creating group with name:', groupName.trim(), 'description:', groupDescription.trim());
      const group = await groupService.createGroup(user.id, groupName.trim(), groupDescription.trim());
      console.log('Group created:', group);
      
      console.log('Adding pigeons to group:', selectedPigeonIds);
      await Promise.all(selectedPigeonIds.map(pid => groupService.addPigeonToGroup(group.id, pid)));
      
      setUserGroups(groups => [...groups, group]);
      setShowSaveGroupModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedPigeonIds([]);
      alert('Group saved!');
    } catch (e) {
      console.error('Error saving group:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert('Error saving group: ' + errorMessage);
    } finally {
      setSavingGroup(false);
    }
  };

  const StatBar: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
      </div>
      <div className="stat-bar">
        {/* Base stat (blue) */}
        <div 
          className="stat-fill-base" 
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
        {/* Evolution potential (green) */}
        <div 
          className="stat-fill-evolution" 
          style={{ width: `${((max - value) / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const PigeonCard: React.FC<{ pigeon: Pigeon }> = ({ pigeon }) => {
    return (
      <div className="card hover:shadow-md transition-shadow duration-200">
        {/* Pigeon Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Show pigeon image based on picture stat - bigger size */}
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {/* TODO: Implement actual images in /assets/pigeons/ */}
              <img src={getPigeonPicture(pigeon)} alt="Pigeon" className="w-16 h-16 object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {pigeon.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pigeon.gender === 'male' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-pink-100 text-pink-800'
                }`}>
                  {pigeon.gender === 'male' ? '♂' : '♀'}
                </span>
                <span>{formatAge(pigeon.age_years, pigeon.age_months, pigeon.age_days)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <input type="checkbox" checked={selectedPigeonIds.includes(pigeon.id)} onChange={e => handleSelectPigeon(pigeon.id, e.target.checked)} className="mr-2" />
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Edit className="h-4 w-4" />
            </button>
            <button 
              className="p-1 text-pink-400 hover:text-pink-600"
              onClick={() => handleBreedingClick(pigeon)}
              title="Breed"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={() => handleDeletePigeon(pigeon.id)}
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
  };

  const PigeonListItem: React.FC<{ pigeon: Pigeon }> = ({ pigeon }) => {
    return (
      <div className="card hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input type="checkbox" checked={selectedPigeonIds.includes(pigeon.id)} onChange={e => handleSelectPigeon(pigeon.id, e.target.checked)} className="mr-2" />
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <img src={getPigeonPicture(pigeon)} alt="Pigeon" className="w-16 h-16 object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {pigeon.name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mr-1 ${
                    pigeon.gender === 'male' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {pigeon.gender === 'male' ? '♂' : '♀'}
                  </span>
                  {formatAge(pigeon.age_years, pigeon.age_months, pigeon.age_days)}
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
              onClick={() => handleBreedingClick(pigeon)}
            >
              <Heart className="h-4 w-4 mr-1" />
              Breed
            </button>
            <button 
              onClick={() => handleDeletePigeon(pigeon.id)}
              className="btn-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pigeon Overview</h1>
          <p className="text-gray-600">Manage your {pigeons.length} pigeons</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pigeons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Group Selection */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const groupId = e.target.value;
                const group = userGroups.find(g => g.id === groupId);
                setSelectedGroup(group || null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Pigeons</option>
              {userGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.description ? group.description.substring(0, 20) + '...' : 'No description'})
                </option>
              ))}
            </select>
            {selectedGroup && (
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Clear group filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              className="mb-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
              onClick={() => setShowAdvancedFilters((v) => !v)}
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Stat Filters */}
                {VISIBLE_STATS.map(({ key, label }) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">{label}</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={200}
                        placeholder="Min"
                        value={filters.statFilters?.[key]?.min ?? ''}
                        onChange={e => {
                          const min = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          setFilters(f => ({
                            ...f,
                            statFilters: {
                              ...f.statFilters,
                              [key]: {
                                min,
                                max: f.statFilters?.[key]?.max ?? undefined,
                              },
                            },
                          }));
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={200}
                        placeholder="Max"
                        value={filters.statFilters?.[key]?.max ?? ''}
                        onChange={e => {
                          const max = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          setFilters(f => ({
                            ...f,
                            statFilters: {
                              ...f.statFilters,
                              [key]: {
                                min: f.statFilters?.[key]?.min ?? undefined,
                                max,
                              },
                            },
                          }));
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
                {/* Age Filter */}
                <div className="flex flex-col col-span-2">
                  <label className="text-xs font-medium text-gray-700 mb-1">Age Range (Min/Max)</label>
                  <div className="flex space-x-2 items-center">
                    <span className="text-xs">Min</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Years"
                      value={filters.ageRange?.minYears ?? ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        ageRange: {
                          ...f.ageRange,
                          minYears: e.target.value === '' ? undefined : parseInt(e.target.value),
                          minMonths: f.ageRange?.minMonths ?? 0,
                          minDays: f.ageRange?.minDays ?? 0,
                          maxYears: f.ageRange?.maxYears ?? 100,
                          maxMonths: f.ageRange?.maxMonths ?? 11,
                          maxDays: f.ageRange?.maxDays ?? 30,
                        },
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      min={0}
                      max={11}
                      placeholder="Months"
                      value={filters.ageRange?.minMonths ?? ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        ageRange: {
                          ...f.ageRange,
                          minMonths: e.target.value === '' ? undefined : parseInt(e.target.value),
                          minYears: f.ageRange?.minYears ?? 0,
                          minDays: f.ageRange?.minDays ?? 0,
                          maxYears: f.ageRange?.maxYears ?? 100,
                          maxMonths: f.ageRange?.maxMonths ?? 11,
                          maxDays: f.ageRange?.maxDays ?? 30,
                        },
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      min={0}
                      max={30}
                      placeholder="Days"
                      value={filters.ageRange?.minDays ?? ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        ageRange: {
                          ...f.ageRange,
                          minDays: e.target.value === '' ? undefined : parseInt(e.target.value),
                          minYears: f.ageRange?.minYears ?? 0,
                          minMonths: f.ageRange?.minMonths ?? 0,
                          maxYears: f.ageRange?.maxYears ?? 100,
                          maxMonths: f.ageRange?.maxMonths ?? 11,
                          maxDays: f.ageRange?.maxDays ?? 30,
                        },
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                    <span className="text-xs ml-4">Max</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Years"
                      value={filters.ageRange?.maxYears ?? ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        ageRange: {
                          ...f.ageRange,
                          maxYears: e.target.value === '' ? undefined : parseInt(e.target.value),
                          minYears: f.ageRange?.minYears ?? 0,
                          minMonths: f.ageRange?.minMonths ?? 0,
                          minDays: f.ageRange?.minDays ?? 0,
                          maxMonths: f.ageRange?.maxMonths ?? 11,
                          maxDays: f.ageRange?.maxDays ?? 30,
                        },
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      min={0}
                      max={11}
                      placeholder="Months"
                      value={filters.ageRange?.maxMonths ?? ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        ageRange: {
                          ...f.ageRange,
                          maxMonths: e.target.value === '' ? undefined : parseInt(e.target.value),
                          minYears: f.ageRange?.minYears ?? 0,
                          minMonths: f.ageRange?.minMonths ?? 0,
                          minDays: f.ageRange?.minDays ?? 0,
                          maxYears: f.ageRange?.maxYears ?? 100,
                          maxDays: f.ageRange?.maxDays ?? 30,
                        },
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      min={0}
                      max={30}
                      placeholder="Days"
                      value={filters.ageRange?.maxDays ?? ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        ageRange: {
                          ...f.ageRange,
                          maxDays: e.target.value === '' ? undefined : parseInt(e.target.value),
                          minYears: f.ageRange?.minYears ?? 0,
                          minMonths: f.ageRange?.minMonths ?? 0,
                          minDays: f.ageRange?.minDays ?? 0,
                          maxYears: f.ageRange?.maxYears ?? 100,
                          maxMonths: f.ageRange?.maxMonths ?? 11,
                        },
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Active Filter Summary */}
            <div className="mt-2 text-xs text-gray-600">
              <strong>Active Filters:</strong> 
              {selectedGroup && <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">Group: {selectedGroup.name}</span>}
              {Object.keys(filters).length > 0 && <span className="ml-1 bg-gray-100 text-gray-800 px-2 py-1 rounded">Other filters applied</span>}
              {!selectedGroup && Object.keys(filters).length === 0 && <span className="ml-1">No filters</span>}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              onClick={() => {
                setFilters({});
                setSelectedGroup(null);
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredPigeons.length} of {pigeons.length} pigeons
        </p>
      </div>

      {selectedPigeonIds.length > 0 && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          onClick={() => setShowSaveGroupModal(true)}
          disabled={userGroups.length >= 20}
        >
          Save as Group
        </button>
      )}

      {/* Pigeon Grid/List */}
      {filteredPigeons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pigeons found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredPigeons.map((pigeon) => (
            viewMode === 'grid' ? (
              <PigeonCard key={pigeon.id} pigeon={pigeon} />
            ) : (
              <PigeonListItem key={pigeon.id} pigeon={pigeon} />
            )
          ))}
        </div>
      )}

      {/* Breeding Modal */}
      {showBreedingModal && selectedPigeon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Breeding Center</h2>
              <button
                onClick={() => setShowBreedingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Selected Pigeon */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Pigeon</h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src={getPigeonPicture(selectedPigeon)} alt="Pigeon" className="w-16 h-16 object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedPigeon.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPigeon.gender === 'male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {selectedPigeon.gender === 'male' ? '♂' : '♀'}
                    </span>
                    <span>Age: {formatAge(selectedPigeon.age_years, selectedPigeon.age_months, selectedPigeon.age_days)}</span>
                    <span>Fertility: {selectedPigeon.fertility.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Breeding Partners */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Breeding Partner</h3>
              {breedingPartners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No compatible breeding partners found.</p>
                  <p className="text-sm">Partners must be opposite gender, at least 1 year old, and have fertility above 50.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {breedingPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPartner?.id === partner.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <img src={getPigeonPicture(partner)} alt="Pigeon" className="w-12 h-12 object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{partner.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              partner.gender === 'male' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-pink-100 text-pink-800'
                            }`}>
                              {partner.gender === 'male' ? '♂' : '♀'}
                            </span>
                            <span>Fertility: {partner.fertility.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Breeding Action */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBreedingModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBreeding}
                disabled={!selectedPartner || breedingLoading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {breedingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Breeding...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span>Start Breeding</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Save Group</h2>
            <label className="block mb-2 text-sm font-medium">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              maxLength={32}
            />
            <label className="block mb-2 text-sm font-medium">Description (optional)</label>
            <textarea
              value={groupDescription}
              onChange={e => setGroupDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              maxLength={128}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowSaveGroupModal(false)}
                disabled={savingGroup}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSaveGroup}
                disabled={savingGroup || !groupName.trim() || selectedPigeonIds.length === 0}
              >
                {savingGroup ? 'Saving...' : 'Save Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PigeonOverviewPage; 