import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout, ProtectedRoute } from './components';
import { ErrorBoundary, ToastContainer } from './components/ui';
import OfflineIndicator from './components/ui/OfflineIndicator';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CowDetailPage = lazy(() => import('./pages/CowDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TestPage = lazy(() => import('./pages/TestPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <ToastContainer />
            <OfflineIndicator />
            <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Homepage without layout for full-screen design */}
          <Route path="/" element={<HomePage />} />
          
          {/* Test page for debugging CSS */}
          <Route path="/test" element={<TestPage />} />
          
          {/* Public authentication pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Public pages with layout */}
          <Route path="/search" element={
            <AppLayout>
              <SearchPage />
            </AppLayout>
          } />
          <Route path="/cattle/:id" element={
            <AppLayout>
              <CowDetailPage />
            </AppLayout>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Protected routes - require seller authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireSeller={true}>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* 404 Not Found - catch all route */}
          <Route path="*" element={
            <AppLayout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="mb-4">
                    <svg className="w-24 h-24 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <a 
                    href="/" 
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go Back Home
                  </a>
                </div>
              </div>
            </AppLayout>
          } />
        </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export { App };
export default App;