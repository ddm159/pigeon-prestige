import React from 'react';
import { Heart, Clock, Users } from 'lucide-react';

const BreedingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Breeding Center</h1>
        <p className="text-pink-100">
          Breed your pigeons to create the next generation of champions!
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Breeding System Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The breeding system is currently under development. You'll be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Pair Selection</h3>
              <p className="text-sm text-gray-600">Choose compatible male and female pairs</p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Breeding Process</h3>
              <p className="text-sm text-gray-600">Manage breeding cycles and egg production</p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Offspring Management</h3>
              <p className="text-sm text-gray-600">Raise and train new pigeon generations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedingPage; 