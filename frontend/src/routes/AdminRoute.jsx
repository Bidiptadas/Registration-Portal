/**
 * Admin Route
 *
 * Restricts access to admin-only pages.
 *
 * Access is granted only when:
 * 1. Firebase authentication has finished loading
 * 2. A user is authenticated
 * 3. The authenticated user's Firestore profile
 *    exists in the admins collection
 * 4. The admin profile has role === "admin"
 */

import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

import Loader from '../components/common/Loader';


export default function AdminRoute({ children }) {

  const {
    isAuthenticated,
    isAdmin,
    loading,
  } = useAuth();


  // ------------------------------------------------
  // AUTHENTICATION / FIRESTORE STILL LOADING
  // ------------------------------------------------

  if (loading) {

    return (
      <Loader fullScreen />
    );
  }


  // ------------------------------------------------
  // USER NOT LOGGED IN
  // ------------------------------------------------

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }


  // ------------------------------------------------
  // USER LOGGED IN BUT NOT ADMIN
  // ------------------------------------------------

  if (!isAdmin) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }


  // ------------------------------------------------
  // ADMIN VERIFIED
  // ------------------------------------------------

  return children;
}
