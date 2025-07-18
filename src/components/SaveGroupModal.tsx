import React from 'react';

export interface SaveGroupModalProps {
  open: boolean;
  groupName: string;
  groupDescription: string;
  onGroupNameChange: (name: string) => void;
  onGroupDescriptionChange: (desc: string) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  canSave: boolean;
}

const SaveGroupModal: React.FC<SaveGroupModalProps> = ({
  open,
  groupName,
  groupDescription,
  onGroupNameChange,
  onGroupDescriptionChange,
  onCancel,
  onSave,
  saving,
  canSave,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Save Group</h2>
        <label className="block mb-2 text-sm font-medium">Group Name</label>
        <input
          type="text"
          value={groupName}
          onChange={e => onGroupNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
          maxLength={32}
        />
        <label className="block mb-2 text-sm font-medium">Description (optional)</label>
        <textarea
          value={groupDescription}
          onChange={e => onGroupDescriptionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
          maxLength={128}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={onSave}
            disabled={saving || !canSave}
          >
            {saving ? 'Saving...' : 'Save Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveGroupModal; 