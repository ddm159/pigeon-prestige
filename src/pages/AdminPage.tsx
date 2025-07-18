import React from 'react';
import { useAuth } from '../contexts/useAuth';
import { useAdminPageLogic } from '../hooks/useAdminPageLogic';
import { Settings, Users, AlertTriangle, Save, Shield, Database } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { gameUser } = useAuth();
  const logic = useAdminPageLogic(gameUser);

  // Check if user is admin
  if (gameUser?.username !== 'admin') {
    return (
      <div className="card">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (logic.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Game Settings</h2>
        </div>
        <div className="space-y-4">
          {logic.gameSettings.map((setting) => (
            <div key={setting.setting_key} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{setting.setting_key}</div>
                <div className="text-sm text-gray-500">{setting.description}</div>
              </div>
              <input
                type="text"
                value={setting.setting_value}
                onChange={e => logic.handleSettingChange(setting.setting_key, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg w-32"
              />
              <button
                onClick={() => logic.handleSaveSetting(setting.setting_key)}
                disabled={logic.updating}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Pigeon Cap Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Apply Penalties */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Apply Penalties</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manually apply pigeon cap penalties to all users who exceed their limit.
            </p>
            <button
              onClick={logic.applyPigeonCapPenalties}
              disabled={logic.updating}
              className="btn-danger w-full flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{logic.updating ? 'Applying...' : 'Apply Penalties'}</span>
            </button>
            {logic.penaltyCount !== null && (
              <div className="mt-2 text-green-600 text-sm">
                {logic.penaltyCount} users penalized.
              </div>
            )}
          </div>
          {/* System Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Info</h3>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Game settings and penalties are managed here.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 