import { useState, useEffect } from 'react';
import { pigeonService } from '../services/supabase';
import { breedingService, groupService } from '../services/gameServices';
import type { Pigeon, PigeonFilters, ViewMode, PigeonGroup, User } from '../types/pigeon';
import { getPigeonPicture } from '../services/pigeonUtils';

// Utility to format age as 3y 2m 4d, hiding zero values
export function formatAge(years: number, months: number, days: number) {
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

export function usePigeonOverviewLogic(user: User | null) {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [filteredPigeons, setFilteredPigeons] = useState<Pigeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PigeonFilters>({});
  const [showFilters, setShowFilters] = useState(false);
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
      console.log('usePigeonOverviewLogic: user', user);
      if (user) {
        try {
          const userPigeons = await pigeonService.getUserPigeons(user.id);
          setPigeons(userPigeons);
          setFilteredPigeons(userPigeons);
          console.log('usePigeonOverviewLogic: pigeons loaded', userPigeons);
        } catch (error) {
          console.error('Error loading pigeons:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // Always set loading to false if user is not present
      }
    };
    loadPigeons();
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...pigeons];
    if (selectedGroup && groupPigeons.length > 0) {
      filtered = filtered.filter(pigeon => groupPigeons.includes(pigeon.id));
    }
    if (searchTerm) {
      filtered = filtered.filter(pigeon =>
        pigeon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(pigeon => pigeon.gender === filters.gender);
    }
    if (filters.ageRange) {
      filtered = filtered.filter(pigeon => {
        const totalMonths = pigeon.age_years * 12 + pigeon.age_months;
        const minMonths = (filters.ageRange?.minYears ?? 0) * 12 + (filters.ageRange?.minMonths ?? 0);
        const maxMonths = (filters.ageRange?.maxYears ?? 100) * 12 + (filters.ageRange?.maxMonths ?? 11);
        return totalMonths >= minMonths && totalMonths <= maxMonths;
      });
    }
    if (filters.isAlive !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.status === 'active');
    }
    if (filters.canBreed !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.fertility > 50 && pigeon.age_years >= 1);
    }
    if (filters.isInjured !== undefined) {
      filtered = filtered.filter(pigeon => pigeon.status === 'injured');
    }
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
    if (pigeon.fertility < 50 || pigeon.age_years < 1) {
      alert('This pigeon cannot breed. Pigeons must be at least 1 year old and have fertility above 50.');
      return;
    }
    setSelectedPigeon(pigeon);
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
      const breedingPair = await breedingService.createBreedingPair(
        selectedPigeon.gender === 'male' ? selectedPigeon.id : selectedPartner.id,
        selectedPigeon.gender === 'female' ? selectedPigeon.id : selectedPartner.id,
        user!.id
      );
      const result = await breedingService.simulateBreeding(breedingPair.id);
      if (result.success && result.offspring) {
        alert(`Breeding successful! New pigeon "${result.offspring.name}" has been created.`);
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
      const group = await groupService.createGroup(user.id, groupName.trim(), groupDescription.trim());
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

  return {
    pigeons,
    filteredPigeons,
    loading,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    showBreedingModal,
    setShowBreedingModal,
    selectedPigeon,
    setSelectedPigeon,
    breedingPartners,
    selectedPartner,
    setSelectedPartner,
    breedingLoading,
    handleDeletePigeon,
    handleBreedingClick,
    handleBreeding,
    selectedPigeonIds,
    handleSelectPigeon,
    showSaveGroupModal,
    setShowSaveGroupModal,
    groupName,
    setGroupName,
    groupDescription,
    setGroupDescription,
    savingGroup,
    handleSaveGroup,
    userGroups,
    selectedGroup,
    setSelectedGroup,
    groupPigeons,
    VISIBLE_STATS,
    formatAge,
    getPigeonPicture,
  };
} 