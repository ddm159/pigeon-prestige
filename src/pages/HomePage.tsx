import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { pigeonService } from '../services/pigeonService';
import type { Pigeon } from '../types/pigeon';

const HomePage: React.FC = () => {
  console.log('🏠 HomePage - component rendering');
  
  const { gameUser, user } = useAuth();
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);

  console.log('🏠 HomePage - auth state:', { user: !!user, gameUser: !!gameUser });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">TEST - HomePage Working!</h1>
      <p className="text-gray-600 mb-4">If you can see this, the HomePage is rendering correctly.</p>
      
      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <h2 className="text-lg font-semibold mb-2 text-green-800">✅ Success!</h2>
        <p className="text-green-700">The HomePage component is working. The issue was elsewhere.</p>
        <p className="text-green-700">User: {user ? 'Logged in' : 'Not logged in'}</p>
        <p className="text-green-700">Game User: {gameUser ? 'Loaded' : 'Not loaded'}</p>
        <p className="text-green-700">Pigeons: {pigeons.length}</p>
      </div>

      {pigeons.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h3 className="font-semibold text-yellow-800">No Pigeons Found</h3>
          <p className="text-yellow-700 mb-2">You don't have any pigeons yet.</p>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={async () => {
              if (!user) return;
              try {
                console.log('Creating starting pigeons...');
                const startingPigeons = await pigeonService.createStartingPigeons(user.id);
                console.log('Created pigeons:', startingPigeons.length);
                setPigeons(startingPigeons);
              } catch (error) {
                console.error('Error creating pigeons:', error);
              }
            }}
          >
            Create Starting Pigeons
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage; 