/**
 * usePermission hook — role-based permission checks.
 */

import { useAuth } from './useAuth';

export function usePermission() {
  const { userProfile, isAdmin, isAuthenticated } = useAuth();

  const isStudent = () => isAuthenticated && !isAdmin;
  const isSuperAdmin = () => isAdmin && userProfile?.role === 'super_admin';
  const isEventAdmin = () => isAdmin && userProfile?.role === 'event_admin';

  const canManageEvents = () => isAdmin;
  const canManageMembers = () => isAdmin;
  const canManageRegistrations = () => isAdmin;
  const canManageSettings = () => isSuperAdmin();
  const canDeleteUsers = () => isSuperAdmin();

  return {
    isStudent,
    isAdmin: () => isAdmin,
    isSuperAdmin,
    isEventAdmin,
    canManageEvents,
    canManageMembers,
    canManageRegistrations,
    canManageSettings,
    canDeleteUsers,
  };
}

export default usePermission;
