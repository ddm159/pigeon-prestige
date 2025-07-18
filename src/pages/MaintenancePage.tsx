import React from 'react';
import { Wrench, Heart, Shield, Activity } from 'lucide-react';
import FoodShop from '../components/FoodShop';
import FoodMixer from '../components/FoodMixer';
import GroupFeeding from '../components/GroupFeeding';
import FeedingHistory from '../components/FeedingHistory';

const MaintenancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Maintenance Center</h1>
        <p className="text-gray-100">
          Keep your pigeons healthy and in top condition!
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <Wrench className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Maintenance System Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The maintenance system is currently under development. You'll be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Health Management</h3>
              <p className="text-sm text-gray-600">Monitor and improve pigeon health</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Disease Prevention</h3>
              <p className="text-sm text-gray-600">Protect against illnesses and injuries</p>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Training & Recovery</h3>
              <p className="text-sm text-gray-600">Train pigeons and manage fatigue</p>
            </div>
          </div>
        </div>
      </div>
      {/* TODO: Add Food Mixer, Group Feeding, Feeding History sections */}
      {/* Food Shop Section */}
      <FoodShop />
      {/* Food Mixer Section */}
      <FoodMixer />
      {/* Group Feeding Section */}
      <GroupFeeding />
      {/* Feeding History Section */}
      <FeedingHistory />
      {/* TODO: Add Feeding History section */}
    </div>
  );
};

export default MaintenancePage; 