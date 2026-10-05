/**
 * Protected Route — redirects unauthenticated users to login.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated || !user?.emailVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // When an admin accesses participant routes, redirect to the admin panel
  // (allow announcements/notice board if accessed directly)
  if (isAdmin && !location.pathname.startsWith('/announcements')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
