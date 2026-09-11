/**
 * Protected Route — redirects unauthenticated users to login.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated || !user?.emailVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
