import { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import { groupService } from '../services/gameServices';
import type { FoodMix, PigeonGroup } from '../types/pigeon';
import type { GroupFilters } from '../components/GroupFilterPanel';

export function useGroupFeedingLogic(userId: string) {
  const [groups, setGroups] = useState<PigeonGroup[]>([]);
  const [mixes, setMixes] = useState<FoodMix[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PigeonGroup | null>(null);
  const [selectedMix, setSelectedMix] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<GroupFilters>({});
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignGroup, setAssignGroup] = useState<PigeonGroup | null>(null);
  const [assignMixId, setAssignMixId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      groupService.getGroupsForUser(userId),
      foodService.listFoodMixes(userId),
    ])
      .then(([groups, mixes]) => {
        const groupsWithMeta = groups.map(g => ({
          ...g,
          size: g.pigeons ? g.pigeons.length : 0,
          tags: g.tags || [],
        }));
        setGroups(groupsWithMeta);
        setMixes(mixes);
        setSelectedGroup(groups[0] || null);
        setSelectedMix(mixes[0]?.id || '');
        setError(null);
      })
      .catch((e: Error) => setError(e.message || 'Failed to load group feeding'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      if (selectedGroup) {
        await foodService.applyFoodMixToGroup(selectedGroup.id, selectedMix);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to apply mix');
    } finally {
      setApplying(false);
    }
  };

  const handleOpenAssignModal = (group: PigeonGroup) => {
    setAssignGroup(group);
    setAssignMixId('');
    setAssignModalOpen(true);
    setAssignError(null);
    setAssignSuccess(null);
  };
  const handleConfirmAssign = async () => {
    if (!assignGroup || !assignMixId) return;
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(null);
    try {
      await foodService.assignMixToGroup(assignGroup.id, assignMixId);
      setAssignSuccess('Mix assigned!');
      setTimeout(() => setAssignModalOpen(false), 1000);
    } catch (e) {
      setAssignError((e as Error).message || 'Failed to assign mix');
    } finally {
      setAssigning(false);
    }
  };

  const filteredGroups = groups.filter(g => {
    if (filters.name && !g.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.minSize && (g.size ?? 0) < filters.minSize) return false;
    if (filters.maxSize && (g.size ?? 0) > filters.maxSize) return false;
    if (filters.tag && (!g.tags || !g.tags.includes(filters.tag))) return false;
    return true;
  });

  return {
    groups,
    mixes,
    selectedGroup,
    setSelectedGroup,
    selectedMix,
    setSelectedMix,
    applying,
    loading,
    error,
    showAdvancedFilters,
    setShowAdvancedFilters,
    filters,
    setFilters,
    assignModalOpen,
    setAssignModalOpen,
    assignGroup,
    setAssignGroup,
    assignMixId,
    setAssignMixId,
    assigning,
    assignError,
    assignSuccess,
    handleApply,
    handleOpenAssignModal,
    handleConfirmAssign,
    filteredGroups,
  };
} 