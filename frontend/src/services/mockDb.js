/**
 * Mock Database backed by localStorage.
 * Provides initial seed data and full CRUD capability.
 */

const SEED_EVENTS = [
  {
    eventId: 'evt-1',
    title: 'Speed Coding Challenge',
    description: 'Race against time to solve complex algorithmic puzzles. Speed, accuracy, and efficiency are key.',
    category: 'technical',
    date: '2026-09-15T10:00:00',
    time: '10:00 AM - 1:00 PM',
    venue: 'Computing Lab 3',
    maxParticipants: 50,
    currentRegistrations: 12,
    availableSpots: 38,
    registrationDeadline: '2026-09-12T23:59:59',
    eventHeadId: 'head-1',
    imageUrl: '',
    isActive: true,
  },
  {
    eventId: 'evt-2',
    title: 'WebCraft: UI/UX Design Hackathon',
    description: 'Design and prototype a high-fidelity interface for a modern web application based on a surprise prompt.',
    category: 'technical',
    date: '2026-09-15T14:00:00',
    time: '2:00 PM - 5:00 PM',
    venue: 'Design Studio Lab',
    maxParticipants: 40,
    currentRegistrations: 8,
    availableSpots: 32,
    registrationDeadline: '2026-09-12T23:59:59',
    eventHeadId: 'head-2',
    imageUrl: '',
    isActive: true,
  },
  {
    eventId: 'evt-3',
    title: 'Tecno-Quiz 2026',
    description: 'The ultimate tech trivia event. Test your knowledge in programming languages, tech history, and modern gadgets.',
    category: 'technical',
    date: '2026-09-16T10:00:00',
    time: '10:00 AM - 12:00 PM',
    venue: 'Seminar Hall 1',
    maxParticipants: 100,
    currentRegistrations: 45,
    availableSpots: 55,
    registrationDeadline: '2026-09-14T23:59:59',
    eventHeadId: 'head-1',
    imageUrl: '',
    isActive: true,
  },
  {
    eventId: 'evt-4',
    title: 'Cultural Dance Showdown',
    description: 'Solo and group dance competition showing classical and modern choreographies.',
    category: 'cultural',
    date: '2026-09-16T14:00:00',
    time: '2:00 PM - 6:00 PM',
    venue: 'Open Air Theater',
    maxParticipants: 30,
    currentRegistrations: 15,
    availableSpots: 15,
    registrationDeadline: '2026-09-14T23:59:59',
    eventHeadId: 'head-3',
    imageUrl: '',
    isActive: true,
  },
];

const SEED_MEMBERS = [
  {
    memberId: 'mem-1',
    name: 'Aishwarya Patil',
    role: 'president',
    department: 'Computer Science',
    year: 4,
    profileImageUrl: '',
    socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    order: 1,
  },
  {
    memberId: 'mem-2',
    name: 'Rahul Sharma',
    role: 'vice_president',
    department: 'Information Technology',
    year: 4,
    profileImageUrl: '',
    socialLinks: { linkedin: 'https://linkedin.com' },
    order: 2,
  },
  {
    memberId: 'mem-3',
    name: 'Sneha Hegde',
    role: 'secretary',
    department: 'Electronics & Communication',
    year: 3,
    profileImageUrl: '',
    socialLinks: { github: 'https://github.com' },
    order: 3,
  },
];

const SEED_HEADS = [
  {
    headId: 'head-1',
    name: 'Prof. Satish Kumar',
    email: 'satish.kumar@college.edu',
    phone: '9845012345',
    department: 'CSE',
    assignedEventIds: ['evt-1', 'evt-3'],
  },
  {
    headId: 'head-2',
    name: 'Dr. Priya Rao',
    email: 'priya.rao@college.edu',
    phone: '9845054321',
    department: 'ISE',
    assignedEventIds: ['evt-2'],
  },
  {
    headId: 'head-3',
    name: 'Amit Varma',
    email: 'amit.varma@college.edu',
    phone: '9731234567',
    department: 'ECE',
    assignedEventIds: ['evt-4'],
  },
];

const SEED_SETTINGS = {
  appName: 'Tecnophite Registration Portal',
  maxEventsPerStudent: 5,
  registrationOpen: true,
  maintenanceMode: false,
  contactEmail: 'tecnophite.support@college.edu',
};

const SEED_STUDENTS = [
  {
    uid: 'mock-student-uid',
    email: 'student@tecnophite.edu',
    displayName: 'Mock Student',
    phone: '9876543210',
    college: 'TP Engineering',
    department: 'CSE',
    year: 3,
    rollNumber: 'TP101',
    profileImageUrl: '',
  }
];

const initializeDB = () => {
  if (!localStorage.getItem('tp_events')) {
    localStorage.setItem('tp_events', JSON.stringify(SEED_EVENTS));
  }
  if (!localStorage.getItem('tp_members')) {
    localStorage.setItem('tp_members', JSON.stringify(SEED_MEMBERS));
  }
  if (!localStorage.getItem('tp_heads')) {
    localStorage.setItem('tp_heads', JSON.stringify(SEED_HEADS));
  }
  if (!localStorage.getItem('tp_settings')) {
    localStorage.setItem('tp_settings', JSON.stringify(SEED_SETTINGS));
  }
  if (!localStorage.getItem('tp_students')) {
    localStorage.setItem('tp_students', JSON.stringify(SEED_STUDENTS));
  }
  if (!localStorage.getItem('tp_registrations')) {
    localStorage.setItem('tp_registrations', JSON.stringify([]));
  }
};

initializeDB();

export const getFromStore = (key) => JSON.parse(localStorage.getItem(key));
export const saveToStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));
