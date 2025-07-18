import { useState, useEffect } from 'react';
import { pigeonService } from '../services/pigeonService';
import type { Pigeon, ViewMode, User } from '../types/pigeon';
import { getPigeonPicture } from '../services/pigeonUtils';
import { usePigeonFiltering } from './usePigeonFiltering';
import { useBreedingLogic } from './useBreedingLogic';
import { useGroupManagement } from './useGroupManagement';

// Utility to format age as 3y 2m 4d, hiding zero values
export function formatAge(years: number, months: number, days: number) {
  const parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}m`);
  if (days) parts.push(`${days}d`);
  if (parts.length === 0) return '0d';
  return parts.join(' ');
}

export function usePigeonOverviewLogic(user: User | null) {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Use focused hooks for different concerns
  const groupManagement = useGroupManagement(user);
  const filtering = usePigeonFiltering(pigeons, groupManagement.selectedGroup, groupManagement.groupPigeons);
  const breeding = useBreedingLogic(pigeons, user);

  // Load pigeons
  useEffect(() => {
    const loadPigeons = async () => {
      console.log('usePigeonOverviewLogic: user', user);
      if (user) {
        try {
          const userPigeons = await pigeonService.getUserPigeons(user.id);
          setPigeons(userPigeons);
          console.log('usePigeonOverviewLogic: pigeons loaded', userPigeons);
        } catch (error) {
          console.error('Error loading pigeons:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadPigeons();
  }, [user]);

  // Refresh pigeons after breeding
  const refreshPigeons = async () => {
    if (user) {
      const userPigeons = await pigeonService.getUserPigeons(user.id);
      setPigeons(userPigeons);
    }
  };

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

  // Enhanced breeding handler that refreshes pigeons on success
  const handleBreeding = async () => {
    const success = await breeding.handleBreeding();
    if (success) {
      await refreshPigeons();
    }
  };

  return {
    // Core state
    pigeons,
    loading,
    viewMode,
    setViewMode,
    
    // Filtering logic
    filteredPigeons: filtering.filteredPigeons,
    searchTerm: filtering.searchTerm,
    setSearchTerm: filtering.setSearchTerm,
    filters: filtering.filters,
    setFilters: filtering.setFilters,
    showFilters: filtering.showFilters,
    setShowFilters: filtering.setShowFilters,
    
    // Breeding logic
    showBreedingModal: breeding.showBreedingModal,
    setShowBreedingModal: breeding.setShowBreedingModal,
    selectedPigeon: breeding.selectedPigeon,
    breedingPartners: breeding.breedingPartners,
    selectedPartner: breeding.selectedPartner,
    setSelectedPartner: breeding.setSelectedPartner,
    breedingLoading: breeding.breedingLoading,
    handleBreedingClick: breeding.handleBreedingClick,
    handleBreeding,
    
    // Group management logic
    selectedPigeonIds: groupManagement.selectedPigeonIds,
    setSelectedPigeonIds: groupManagement.setSelectedPigeonIds,
    showSaveGroupModal: groupManagement.showSaveGroupModal,
    setShowSaveGroupModal: groupManagement.setShowSaveGroupModal,
    groupName: groupManagement.groupName,
    setGroupName: groupManagement.setGroupName,
    groupDescription: groupManagement.groupDescription,
    setGroupDescription: groupManagement.setGroupDescription,
    savingGroup: groupManagement.savingGroup,
    userGroups: groupManagement.userGroups,
    selectedGroup: groupManagement.selectedGroup,
    setSelectedGroup: groupManagement.setSelectedGroup,
    groupPigeons: groupManagement.groupPigeons,
    handleSelectPigeon: groupManagement.handleSelectPigeon,
    handleSaveGroup: groupManagement.handleSaveGroup,
    
    // Utility functions
    handleDeletePigeon,
    getPigeonPicture,
  };
} 