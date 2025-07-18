import React, { useState, useEffect } from 'react';
import type { Pigeon } from '../types/pigeon';
import { processAlias } from '../utils/aliasUtils';

interface AliasEditModalProps {
  open: boolean;
  pigeon: Pigeon | null;
  onClose: () => void;
  onSave: (pigeonId: string, alias: string | null) => Promise<void>;
}

const AliasEditModal: React.FC<AliasEditModalProps> = ({
  open,
  pigeon,
  onClose,
  onSave,
}) => {
  const [alias, setAlias] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open && pigeon) {
      setAlias(pigeon.alias || '');
      setError(null);
    }
  }, [open, pigeon]);

  const handleInputChange = (value: string) => {
    setAlias(value);
    setError(null);
  };

  const handleSave = async () => {
    if (!pigeon) return;

    setIsSaving(true);
    setError(null);

    try {
      const processedAlias = processAlias(alias);
      await onSave(pigeon.id, processedAlias);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save alias');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!pigeon) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(pigeon.id, null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear alias');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open || !pigeon) return null;

  const processedAlias = processAlias(alias);
  const hasChanges = processedAlias !== (pigeon.alias || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Edit Pigeon Alias</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Original name: <span className="font-medium">{pigeon.name}</span>
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Alias:
          </label>
          <input
            type="text"
            value={alias}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter custom name (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSaving}
          />
        </div>





        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          
          {pigeon.alias && (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
              disabled={isSaving}
            >
              Clear Alias
            </button>
          )}
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AliasEditModal; 