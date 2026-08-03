/**
 * Role-based utility functions.
 */

export const isAdmin = (userProfile) => {
  return userProfile?.isAdmin === true;
};

export const isStudent = (userProfile) => {
  return userProfile && !userProfile.isAdmin;
};

export const isSuperAdmin = (userProfile) => {
  return userProfile?.isAdmin && userProfile?.role === 'super_admin';
};

export const getRoleLabel = (role) => {
  const labels = {
    student: 'Student',
    admin: 'Admin',
    super_admin: 'Super Admin',
    event_admin: 'Event Admin',
    president: 'President',
    vice_president: 'Vice President',
    secretary: 'Secretary',
    treasurer: 'Treasurer',
    joint_secretary: 'Joint Secretary',
    event_coordinator: 'Event Coordinator',
    member: 'Member',
  };
  return labels[role] || role;
};
