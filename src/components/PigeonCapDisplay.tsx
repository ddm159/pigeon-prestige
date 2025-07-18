import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { gameSettingsService } from '../services/gameSettings';
import type { PigeonCapInfo } from '../types/pigeon';
import { AlertTriangle, Users, Info } from 'lucide-react';

const PigeonCapDisplay: React.FC = () => {
  const { user } = useAuth();
  const [capInfo, setCapInfo] = useState<PigeonCapInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapInfo = async () => {
      if (!user) return;
      
      try {
        const info = await gameSettingsService.getUserPigeonCapInfo(user.id);
        setCapInfo(info);
      } catch (error) {
        console.error('Error fetching pigeon cap info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapInfo();
  }, [user]);

  if (loading || !capInfo) {
    return null;
  }

  const percentage = (capInfo.current_pigeons / capInfo.pigeon_cap) * 100;
  const isNearCap = percentage >= 80;
  const isOverCap = capInfo.is_over_cap;

  return (
    <div className="mb-6">
      {/* Pigeon Cap Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pigeon Collection</h3>
          </div>
          <div className="text-sm text-gray-500">
            {capInfo.current_pigeons} / {capInfo.pigeon_cap}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Capacity</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverCap 
                  ? 'bg-danger-500' 
                  : isNearCap 
                    ? 'bg-warning-500' 
                    : 'bg-success-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Messages */}
        {isOverCap && (
          <div className="flex items-center space-x-2 p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-danger-600" />
            <div>
              <p className="text-sm font-medium text-danger-800">
                Pigeon Cap Exceeded!
              </p>
              <p className="text-xs text-danger-600">
                All your pigeons are losing 5 health points daily. Sell or release pigeons to avoid penalties.
              </p>
            </div>
          </div>
        )}

        {isNearCap && !isOverCap && (
          <div className="flex items-center space-x-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            <div>
              <p className="text-sm font-medium text-warning-800">
                Approaching Pigeon Cap
              </p>
              <p className="text-xs text-warning-600">
                You're close to your limit. Consider selling pigeons to avoid penalties.
              </p>
            </div>
          </div>
        )}

        {!isNearCap && !isOverCap && (
          <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-lg">
            <Info className="h-5 w-5 text-success-600" />
            <div>
              <p className="text-sm font-medium text-success-800">
                Pigeon Collection Healthy
              </p>
              <p className="text-xs text-success-600">
                You have {capInfo.pigeon_cap - capInfo.current_pigeons} slots remaining.
              </p>
            </div>
          </div>
        )}

        {/* Penalty Information */}
        {capInfo.penalty_applied && capInfo.last_penalty_date && (
          <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
            <p>Last penalty applied: {new Date(capInfo.last_penalty_date).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PigeonCapDisplay; 