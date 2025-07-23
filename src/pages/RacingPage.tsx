import React from 'react';
import { Trophy, Award, Target, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHasHomeBase } from '../hooks/useHasHomeBase';
import LoadingSpinner from '../components/LoadingSpinner';

const RacingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasHomeBase = useHasHomeBase(user);

  if (hasHomeBase === null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Racing Arena</h1>
        <p className="text-yellow-100">
          Compete against other players and prove your pigeons are the fastest!
        </p>
      </div>

      {!hasHomeBase && (
        <div className="card bg-warning-50 border border-warning-200 p-6 mb-6 flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 text-warning-600 mb-2" />
          <h3 className="text-lg font-semibold text-warning-800 mb-2">Home Base Required</h3>
          <p className="text-warning-700 mb-4 text-center">
            You must set your home base before you can subscribe to a race. Your home base determines your race results and is required for participation.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/onboarding/home-base')}
          >
            Set Home Base
          </button>
        </div>
      )}

      <div className="card">
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Racing System Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The racing system is currently under development. You'll be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Race Entry</h3>
              <p className="text-sm text-gray-600">Enter your pigeons in various race types</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Multiplayer Racing</h3>
              <p className="text-sm text-gray-600">Compete against friends and other players</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Rewards & Rankings</h3>
              <p className="text-sm text-gray-600">Earn prizes and climb the leaderboards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RacingPage; 