import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { 
  Home, 
  Users, 
  Heart, 
  Trophy, 
  Wrench, 
  ShoppingCart, 
  LogOut,
  User,
  Palette
} from 'lucide-react';
import GameTimeDisplay from './GameTimeDisplay';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('Layout render');
  const { gameUser, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Pigeons', href: '/pigeons', icon: Users },
    { name: 'Breeding', href: '/breeding', icon: Heart },
    { name: 'Racing', href: '/racing', icon: Trophy },
    { name: 'Competition', href: '/competition', icon: Trophy },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Market', href: '/market', icon: ShoppingCart },
    { name: 'Feeding Center', href: '/feeding-center', icon: Users },
    { name: '🎨 Components', href: '/component-library', icon: Palette },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                🐦 Pigeon Prestige
              </h1>
            </div>

            {/* Game Time Display - Center */}
            <div className="flex-1 flex justify-center">
              <GameTimeDisplay />
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{gameUser?.username}</span>
              </div>
              <div className="text-sm text-gray-500">
                ${gameUser?.balance?.toLocaleString()}
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen sticky top-16 z-20 h-[calc(100vh-4rem)]">
          <div className="p-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 