import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as supabaseModule from '../services/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(supabaseModule.supabase as any).rpc = vi.fn((fnName: string) => {
  if (fnName === 'get_current_game_date') {
    return Promise.resolve({ data: '1900-01-02', error: null });
  }
  return Promise.resolve({ data: null, error: null });
});

// Mock environment variables
vi.mock('import.meta.env', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    // Add rpc mock for all tests
    rpc: vi.fn((fnName) => {
      if (fnName === 'get_current_game_date') {
        return Promise.resolve({ data: '1900-01-02', error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
  })),
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Home: () => 'Home',
  Users: () => 'Users',
  Heart: () => 'Heart',
  Trophy: () => 'Trophy',
  Wrench: () => 'Wrench',
  ShoppingCart: () => 'ShoppingCart',
  LogOut: () => 'LogOut',
  User: () => 'User',
  Grid: () => 'Grid',
  List: () => 'List',
  Filter: () => 'Filter',
  Search: () => 'Search',
  Trash2: () => 'Trash2',
  Eye: () => 'Eye',
  Edit: () => 'Edit',
  Award: () => 'Award',
  Clock: () => 'Clock',
  Calendar: () => 'Calendar',
  Mail: () => 'Mail',
  Lock: () => 'Lock',
  EyeOff: () => 'EyeOff',
  DollarSign: () => 'DollarSign',
  TrendingUp: () => 'TrendingUp',
  Target: () => 'Target',
  Shield: () => 'Shield',
  Activity: () => 'Activity',
  Palette: () => 'Palette',
  X: () => 'X',
  Settings: () => 'Settings',
  Save: () => 'Save',
  AlertTriangle: () => 'AlertTriangle',
  Database: () => 'Database',
  Play: () => 'Play',
  Pause: () => 'Pause',
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})); 