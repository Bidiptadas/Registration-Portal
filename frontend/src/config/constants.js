/**
 * Application-wide constants.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Tecnophite Registration Portal';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const EVENT_CATEGORIES = [
  { value: 'technical', label: 'Technical', color: '#6366f1' },
  { value: 'cultural', label: 'Cultural', color: '#ec4899' },
  { value: 'sports', label: 'Sports', color: '#22c55e' },
  { value: 'workshop', label: 'Workshop', color: '#f59e0b' },
];

export const REGISTRATION_STATUS = {
  REGISTERED: 'registered',
  ATTENDED: 'attended',
  CANCELLED: 'cancelled',
};

export const MEMBER_ROLES = [
  'president',
  'vice_president',
  'secretary',
  'treasurer',
  'joint_secretary',
  'event_coordinator',
  'member',
];

export const ACADEMIC_YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];
