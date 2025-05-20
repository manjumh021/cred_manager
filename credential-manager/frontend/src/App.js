// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientDetails from './pages/ClientDetails';
import CredentialDetails from './pages/CredentialDetails';
import Settings from './pages/Settings';
import ExportPage from './pages/ExportPage';

// Components
import Navigation from './components/common/Navigation';
import Footer from './components/common/Footer';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Admin Route Component
 * Redirects to dashboard if user is not an admin
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

/**
 * Main App Component
 */
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <Container fluid className="flex-grow-1 py-3">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/clients/:id" element={
                <ProtectedRoute>
                  <ClientDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/credentials/:id" element={
                <ProtectedRoute>
                  <CredentialDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/export" element={
                <ProtectedRoute>
                  <ExportPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;