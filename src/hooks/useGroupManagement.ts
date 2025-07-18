import { useState, useEffect } from 'react';
import { groupService } from '../services/gameServices';
import type { PigeonGroup, User } from '../types/pigeon';

export function useGroupManagement(user: User | null) {
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

  const handleSelectPigeon = (id: string, checked: boolean) => {
    setSelectedPigeonIds(prev => 
      checked ? [...prev, id] : prev.filter(pId => pId !== id)
    );
  };

  const handleSaveGroup = async () => {
    if (!user || !groupName.trim() || selectedPigeonIds.length === 0) return;
    
    setSavingGroup(true);
    try {
      await groupService.createGroup(user.id, groupName.trim(), groupDescription.trim());
      // Add pigeons to group one by one
      for (const pigeonId of selectedPigeonIds) {
        await groupService.addPigeonToGroup(pigeonId, groupName.trim());
      }
      
      // Refresh groups
      const updatedGroups = await groupService.getGroupsForUser(user.id);
      setUserGroups(updatedGroups);
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedPigeonIds([]);
      setShowSaveGroupModal(false);
      
      alert('Group saved successfully!');
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error saving group. Please try again.');
    } finally {
      setSavingGroup(false);
    }
  };

  return {
    selectedPigeonIds,
    setSelectedPigeonIds,
    showSaveGroupModal,
    setShowSaveGroupModal,
    groupName,
    setGroupName,
    groupDescription,
    setGroupDescription,
    savingGroup,
    userGroups,
    selectedGroup,
    setSelectedGroup,
    groupPigeons,
    handleSelectPigeon,
    handleSaveGroup,
  };
} 