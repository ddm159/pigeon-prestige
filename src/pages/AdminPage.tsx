import React from 'react';
import { useAuth } from '../contexts/useAuth';
import { useAdminPageLogic } from '../hooks/useAdminPageLogic';
import { Settings, Users, AlertTriangle, Save, Shield, Database, Clock, Play, Pause, Calendar } from 'lucide-react';

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
      {/* Game Time Management */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Game Time Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Game Time */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current Game Time</h3>
            {logic.gameTimeState ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {new Date(logic.gameTimeState.current_game_date).toLocaleDateString('nl-BE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Europe/Brussels'
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Updates: {logic.gameTimeState.update_count}
                </div>
                <div className="text-sm text-gray-600">
                  Status: {logic.gameTimeState.is_paused ? (
                    <span className="text-orange-600 font-medium">PAUSED</span>
                  ) : (
                    <span className="text-green-600 font-medium">RUNNING</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </div>

          {/* Game Time Controls */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Controls</h3>
            <div className="space-y-3">
              <button
                onClick={logic.advanceGameTime}
                disabled={logic.updating}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>{logic.updating ? 'Advancing...' : 'Advance 1 Day'}</span>
              </button>
              
              <button
                onClick={logic.toggleGameTimePause}
                disabled={logic.updating}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  logic.gameTimeState?.is_paused 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                }`}
              >
                {logic.gameTimeState?.is_paused ? (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Resume Time</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause Time</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Game Time Log */}
        {logic.gameTimeLog.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Updates</h3>
            <div className="space-y-2">
              {logic.gameTimeLog.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="font-medium">
                      {new Date(log.game_date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-600">{log.update_type}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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