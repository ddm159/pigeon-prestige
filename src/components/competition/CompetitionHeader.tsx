import React from 'react';

/**
 * Competition Header Component
 * Displays the main header for competition pages
 */
export const CompetitionHeader: React.FC = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">🏆 Competition Center</h1>
          <p className="mt-2 text-gray-600">
            Manage divisions, track seasons, and monitor upcoming races
          </p>
        </div>
      </div>
    </div>
  );
}; 