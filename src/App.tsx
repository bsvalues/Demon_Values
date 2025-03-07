import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PerformanceOverlay } from './components/PerformanceOverlay';
import { ErrorOverlay } from './components/ErrorOverlay';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
const SignIn = React.lazy(() => import('./pages/auth/SignIn'));
const SignUp = React.lazy(() => import('./pages/auth/SignUp'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <React.Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-demon-dark to-black text-white flex items-center justify-center">
                <div className="animate-spin text-demon-red">
                  <svg className="h-8 w-8" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </React.Suspense>
          </BrowserRouter>

          {/* Development Overlays */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <PerformanceOverlay />
              <ErrorOverlay />
            </>
          )}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;