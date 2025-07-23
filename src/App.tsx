import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PigeonOverviewPage from './pages/PigeonOverviewPage';
import BreedingPage from './pages/BreedingPage';
import RacingPage from './pages/RacingPage';
import MaintenancePage from './pages/MaintenancePage';
import MarketPage from './pages/MarketPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ComponentLibrary from './components/ComponentLibrary';
import FoodShop from './components/FoodShop';
import FeedingCenterPage from './pages/FeedingCenterPage';
import CompetitionPage from './pages/CompetitionPage';
import HomeBaseOnboardingPage from './pages/HomeBaseOnboardingPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Main App Component
const AppContent = () => {
  const { loading, user } = useAuth();

  console.log('AppContent - user:', !!user, 'loading:', loading, 'current URL:', window.location.pathname);

  if (loading) {
    console.log('AppContent - showing loading spinner');
    return <LoadingSpinner />;
  }

  console.log('AppContent - rendering routes');
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/home-base" element={<HomeBaseOnboardingPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pigeons"
        element={
          <ProtectedRoute>
            <Layout>
              <PigeonOverviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/breeding"
        element={
          <ProtectedRoute>
            <Layout>
              <BreedingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/racing"
        element={
          <ProtectedRoute>
            <Layout>
              <RacingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Layout>
              <MaintenancePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <Layout>
              <MarketPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/food-shop"
        element={
          <ProtectedRoute>
            <Layout>
              <FoodShop />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feeding-center"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedingCenterPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/competition"
        element={
          <ProtectedRoute>
            <Layout>
              <CompetitionPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/component-library"
        element={
          <ProtectedRoute>
            <Layout>
              <ComponentLibrary />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Root App Component
function App() {
  console.log('App component rendering');
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
