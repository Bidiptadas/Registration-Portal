/**
 * Local storage database fallback.
 * Contains no mock data.
 */

const SEED_EVENTS = [];
const SEED_MEMBERS = [];
const SEED_HEADS = [];
const SEED_SETTINGS = {
  appName: 'Technophite Registration Portal',
  maxEventsPerStudent: 5,
  registrationOpen: true,
  maintenanceMode: false,
  contactEmail: '',
};
const SEED_ANNOUNCEMENTS = [];
const SEED_ACHIEVEMENTS = [];
const SEED_STUDENTS = [];

const initializeDB = () => {
  const storeKeys = [
    'tp_events',
    'tp_members',
    'tp_heads',
    'tp_announcements',
    'tp_achievements',
    'tp_students',
    'tp_registrations',
  ];

  storeKeys.forEach((key) => {
    const existing = localStorage.getItem(key);
    // Reset if missing or containing previous mock seed identifiers
    if (
      !existing ||
      existing.includes('evt-1') ||
      existing.includes('mem-1') ||
      existing.includes('head-1') ||
      existing.includes('announcement-1') ||
      existing.includes('achievement-1') ||
      existing.includes('mock-student-uid')
    ) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });

  if (!localStorage.getItem('tp_settings')) {
    localStorage.setItem('tp_settings', JSON.stringify(SEED_SETTINGS));
  }
};

initializeDB();

export const getFromStore = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

export const saveToStore = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
