import { useState } from 'react';
import { breedingService } from '../services/gameServices';
import type { Pigeon, User } from '../types/pigeon';

export function useBreedingLogic(pigeons: Pigeon[], user: User | null) {
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);
  const [breedingPartners, setBreedingPartners] = useState<Pigeon[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Pigeon | null>(null);
  const [breedingLoading, setBreedingLoading] = useState(false);

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
    if (!selectedPigeon || !selectedPartner || !user) return;
    setBreedingLoading(true);
    try {
      const breedingPair = await breedingService.createBreedingPair(
        selectedPigeon.gender === 'male' ? selectedPigeon.id : selectedPartner.id,
        selectedPigeon.gender === 'female' ? selectedPigeon.id : selectedPartner.id,
        user.id
      );
      const result = await breedingService.simulateBreeding(breedingPair.id);
      if (result.success && result.offspring) {
        alert(`Breeding successful! New pigeon "${result.offspring.name}" has been created.`);
        return true; // Indicate success for parent component to refresh
      } else {
        alert('Breeding was not successful this time. Try again later!');
        return false;
      }
    } catch (error) {
      console.error('Error during breeding:', error);
      alert('An error occurred during breeding. Please try again.');
      return false;
    } finally {
      setBreedingLoading(false);
    }
  };

  return {
    showBreedingModal,
    setShowBreedingModal,
    selectedPigeon,
    breedingPartners,
    selectedPartner,
    setSelectedPartner,
    breedingLoading,
    handleBreedingClick,
    handleBreeding,
  };
} 