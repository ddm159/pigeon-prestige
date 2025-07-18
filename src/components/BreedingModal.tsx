import React from 'react';
import { Heart, X } from 'lucide-react';
import type { Pigeon } from '../types/pigeon';

export interface BreedingModalProps {
  open: boolean;
  onClose: () => void;
  selectedPigeon: Pigeon;
  breedingPartners: Pigeon[];
  selectedPartner: Pigeon | null;
  onSelectPartner: (partner: Pigeon) => void;
  onBreed: () => void;
  breedingLoading: boolean;
  getPigeonPicture: (pigeon: Pigeon) => string;
}

const BreedingModal: React.FC<BreedingModalProps> = ({
  open,
  onClose,
  selectedPigeon,
  breedingPartners,
  selectedPartner,
  onSelectPartner,
  onBreed,
  breedingLoading,
  getPigeonPicture,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Breeding Center</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPigeon.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                  {selectedPigeon.gender === 'male' ? '♂' : '♀'}
                </span>
                <span>Age: {selectedPigeon.age_years}y {selectedPigeon.age_months}m {selectedPigeon.age_days}d</span>
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
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPartner?.id === partner.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => onSelectPartner(partner)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <img src={getPigeonPicture(partner)} alt="Pigeon" className="w-12 h-12 object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{partner.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
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
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={breedingLoading}
          >
            Cancel
          </button>
          <button
            onClick={onBreed}
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
  );
};

export default BreedingModal; 