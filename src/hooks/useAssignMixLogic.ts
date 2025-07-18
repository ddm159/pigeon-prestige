import { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import { pigeonService } from '../services/pigeonService';
import { groupService } from '../services/gameServices';
import type { FoodMix, Pigeon, PigeonGroup } from '../types/pigeon';
import { useAuth } from '../contexts/useAuth';

export function useAssignMixLogic() {
  const { user } = useAuth();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetType, setAssignTargetType] = useState<'pigeon' | 'group'>('pigeon');
  const [selectedMix, setSelectedMix] = useState<FoodMix | null>(null);
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [groups, setGroups] = useState<PigeonGroup[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!assignModalOpen || !user) return;
    Promise.all([
      pigeonService.getUserPigeons(user.id),
      groupService.getGroupsForUser(user.id),
    ]).then(([pigeons, groups]) => {
      setPigeons(pigeons || []);
      setGroups(groups || []);
    });
  }, [assignModalOpen, user]);

  const openAssignModal = (mix: FoodMix) => {
    setSelectedMix(mix);
    setAssignModalOpen(true);
    setAssignTargetType('pigeon');
    setSelectedTargetId('');
    setAssignError(null);
    setAssignSuccess(null);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedMix(null);
    setAssignError(null);
    setAssignSuccess(null);
  };

  const handleConfirmAssign = async () => {
    if (!selectedMix || !selectedTargetId) return;
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(null);
    try {
      if (assignTargetType === 'pigeon') {
        await foodService.assignMixToPigeon(selectedTargetId, selectedMix.id);
      } else {
        await foodService.assignMixToGroup(selectedTargetId, selectedMix.id);
      }
      setAssignSuccess('Mix assigned!');
      setTimeout(() => setAssignModalOpen(false), 1000);
    } catch (e) {
      setAssignError((e as Error).message || 'Failed to assign mix');
    } finally {
      setAssigning(false);
    }
  };

  return {
    assignModalOpen,
    setAssignModalOpen,
    assignTargetType,
    setAssignTargetType,
    selectedMix,
    setSelectedMix,
    pigeons,
    groups,
    selectedTargetId,
    setSelectedTargetId,
    assigning,
    assignError,
    assignSuccess,
    openAssignModal,
    closeAssignModal,
    handleConfirmAssign,
  };
} 