import React from 'react';
import { ShoppingCart, DollarSign, TrendingUp, Users } from 'lucide-react';

const MarketPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Pigeon Market</h1>
        <p className="text-green-100">
          Buy, sell, and trade pigeons with other players!
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Market System Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The market system is currently under development. You'll be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Buy & Sell</h3>
              <p className="text-sm text-gray-600">Trade pigeons for in-game currency</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Market Analysis</h3>
              <p className="text-sm text-gray-600">Track prices and market trends</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Player Trading</h3>
              <p className="text-sm text-gray-600">Direct trades with other players</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage; 