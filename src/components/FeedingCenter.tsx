import React from 'react';

const FeedingCenter: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Feeding Center</h1>
        <p className="text-blue-100">
          Create food mixes and apply them to your pigeon groups!
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Food Mixer Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            This section will let you create, save, and preview custom food mixes for your pigeons.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Group Feeding Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            Here you’ll be able to select a group and apply a saved mix to all pigeons in that group.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedingCenter; 