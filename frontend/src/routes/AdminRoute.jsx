import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import React from 'react';
export default function AdminRoute({ children }) {
  const {
    isAuthenticated,
    isAdmin,
    loading,
    user,
  } = useAuth();
  if (loading) {

    return (
      <Loader fullScreen />
    );
  }
  if (!isAuthenticated) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }
  if (!user?.emailVerified) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!isAdmin) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }
  return children;
}
