import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { gameSettingsService } from '../services/gameSettings';
import { 
  Settings, 
  Users, 
  AlertTriangle, 
  Save, 
  RefreshCw,
  Shield,
  Database
} from 'lucide-react';
import type { GameSetting } from '../types/pigeon';

const AdminPage: React.FC = () => {
  const { gameUser } = useAuth();
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [penaltyCount, setPenaltyCount] = useState<number | null>(null);

  useEffect(() => {
    loadGameSettings();
  }, []);

  const loadGameSettings = async () => {
    try {
      const settings = await gameSettingsService.getGameSettings();
      setGameSettings(settings);
    } catch (error) {
      console.error('Error loading game settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    setUpdating(true);
    try {
      await gameSettingsService.updateGameSetting(key, value);
      await loadGameSettings(); // Reload settings
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setUpdating(false);
    }
  };

  const applyPigeonCapPenalties = async () => {
    setUpdating(true);
    try {
      const count = await gameSettingsService.applyPigeonCapPenaltiesForAllUsers();
      setPenaltyCount(count);
      setTimeout(() => setPenaltyCount(null), 5000); // Clear after 5 seconds
    } catch (error) {
      console.error('Error applying penalties:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    const updatedSettings = gameSettings.map(setting =>
      setting.setting_key === key ? { ...setting, setting_value: value } : setting
    );
    setGameSettings(updatedSettings);
  };

  const handleSaveSetting = async (key: string) => {
    const setting = gameSettings.find(s => s.setting_key === key);
    if (setting) {
      await updateSetting(key, setting.setting_value);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Admin Panel 🛠️
        </h1>
        <p className="text-purple-100">
          Manage game settings and monitor system health
        </p>
      </div>

      {/* Success Message */}
      {penaltyCount !== null && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-success-600 mr-2" />
            <span className="text-success-800">
              Successfully applied pigeon cap penalties to {penaltyCount} users
            </span>
          </div>
        </div>
      )}

      {/* Game Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Game Settings</h2>
          </div>
          <button
            onClick={loadGameSettings}
            disabled={updating}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {gameSettings.map((setting) => (
            <div key={setting.setting_key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  {setting.description && (
                    <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                  )}
                  <input
                    type="text"
                    value={setting.setting_value}
                    onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                    className="form-input w-full"
                    placeholder="Enter value"
                  />
                </div>
                <button
                  onClick={() => handleSaveSetting(setting.setting_key)}
                  disabled={updating}
                  className="btn-primary ml-4 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pigeon Cap Management */}
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
              onClick={applyPigeonCapPenalties}
              disabled={updating}
              className="btn-danger w-full flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{updating ? 'Applying...' : 'Apply Penalties'}</span>
            </button>
          </div>

          {/* System Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Default Pigeon Cap:</span>
                <span className="font-medium">
                  {gameSettings.find(s => s.setting_key === 'default_pigeon_cap')?.setting_value || '50'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Pigeon Cap:</span>
                <span className="font-medium">
                  {gameSettings.find(s => s.setting_key === 'ai_pigeon_cap')?.setting_value || '50'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health Penalty:</span>
                <span className="font-medium">
                  {gameSettings.find(s => s.setting_key === 'health_penalty_amount')?.setting_value || '5'} points
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Database className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Backup Database</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Optimize Database</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Settings</p>
              <p className="text-2xl font-semibold text-gray-900">{gameSettings.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Penalties Applied</p>
              <p className="text-2xl font-semibold text-gray-900">{penaltyCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admin Status</p>
              <p className="text-2xl font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 