/**
 * Event Service
 *
 * Firebase Firestore implementation.
 * Handles event CRUD operations and real-time listeners.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';
import { auth } from '../firebase/firebaseConfig';

const EVENTS_COLLECTION = 'events';

export const formatFirestoreEvent = (docSnap) => {
  const raw = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
  const id = docSnap.id || raw.eventId || raw.id;
  const title = raw.title || raw.eventName || raw.name || 'Untitled Event';
  const date = raw.date || raw.eventDate || raw.startDate || null;
  const status = raw.status ? raw.status.toLowerCase() : (raw.isActive === false ? 'closed' : 'open');
  const isActive = raw.isActive !== undefined
    ? Boolean(raw.isActive)
    : (status === 'open' || status === 'active');

  const maxParticipants = Number(raw.maxParticipants ?? raw.max_participants ?? raw.capacity ?? 50);
  const currentRegistrations = Number(raw.currentRegistrations ?? raw.registeredCount ?? 0);
  const availableSpots = raw.availableSpots !== undefined
    ? Number(raw.availableSpots)
    : Math.max(0, maxParticipants - currentRegistrations);

  // Normalize Team Heads (max 4, with name and contact)
  let teamHeads = [];
  if (Array.isArray(raw.teamHeads)) {
    teamHeads = raw.teamHeads
      .map((h) => {
        if (typeof h === 'string') return { name: h, contact: '' };
        return { name: h?.name || '', contact: h?.contact || h?.phone || h?.email || '' };
      })
      .filter((h) => h.name.trim() || h.contact.trim())
      .slice(0, 4);
  } else if (raw.teamHeadName || raw.eventHeadName || raw.coordinator || raw.organizer) {
    const name = raw.teamHeadName || raw.eventHeadName || raw.coordinator || raw.organizer || '';
    const contact = raw.teamHeadContact || raw.eventHeadPhone || raw.eventHeadEmail || '';
    if (name) teamHeads.push({ name, contact });
  }

  const eligibility = raw.eligibility || raw.eligibilityCriteria || 'All Students';
  const registrationFee = Number(raw.registrationFee ?? raw.fee ?? 0);

  return {
    ...raw,
    eventId: id,
    id,
    title,
    description: raw.description || '',
    category: raw.category || 'technical',
    date,
    startTime: raw.startTime || '',
    endTime: raw.endTime || '',
    time: raw.time || [raw.startTime, raw.endTime].filter(Boolean).join(' - ') || '',
    venue: raw.venue || 'Venue TBA',
    teamHeads,
    eligibility,
    registrationFee,
    maxParticipants,
    currentRegistrations,
    availableSpots,
    brochureUrl: raw.brochureUrl || '',
    registrationDeadline: raw.registrationDeadline || null,
    rules: Array.isArray(raw.rules) ? raw.rules : (raw.rules ? [raw.rules] : []),
    status,
    isActive,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    createdBy: raw.createdBy || '',
    updatedBy: raw.updatedBy || '',
  };
};

export const eventApi = {

  // --------------------------------------------------
  // GET ALL EVENTS (ONE-TIME PROMISE READ)
  // --------------------------------------------------
  getAll: async (params = {}) => {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const snapshot = await getDocs(eventsRef);

      const allEvents = snapshot.docs.map(formatFirestoreEvent);
      const events = params.active_only
        ? allEvents.filter((e) => e.isActive !== false)
        : allEvents;

      return {
        data: {
          success: true,
          data: {
            events,
            total: events.length,
            page: 1,
            limit: params.limit || 100,
          },
        },
      };
    } catch (err) {
      console.error('Failed to fetch events from Firestore:', err);
      throw err;
    }
  },


  // --------------------------------------------------
  // GET ONE EVENT
  // --------------------------------------------------
  getById: async (id) => {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, id);
      const snapshot = await getDoc(eventRef);
      if (snapshot.exists()) {
        return {
          data: {
            success: true,
            data: formatFirestoreEvent(snapshot),
          },
        };
      }
    } catch (err) {
      console.error('Failed to fetch event from Firestore:', err);
      throw err;
    }

    throw new Error('Event not found');
  },


  // --------------------------------------------------
  // GET EVENT CATEGORIES
  // --------------------------------------------------
  getCategories: async () => {
    return {
      data: {
        success: true,
        data: [
          'technical',
          'cultural',
          'sports',
          'workshop',
        ],
      },
    };
  },


  // --------------------------------------------------
  // CREATE EVENT
  // --------------------------------------------------
  create: async (data) => {
    const currentUid = auth.currentUser?.uid || 'admin';
    const status = data.status || (data.isActive === false ? 'closed' : 'open');
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : (status === 'open' || status === 'active');
    const maxParticipants = Number(data.maxParticipants ?? data.max_participants ?? 50);

    const teamHeads = Array.isArray(data.teamHeads)
      ? data.teamHeads
          .slice(0, 4)
          .map((h) => ({
            name: typeof h === 'string' ? h.trim() : (h?.name || '').trim(),
            contact: typeof h === 'string' ? '' : (h?.contact || h?.phone || h?.email || '').trim(),
          }))
          .filter((h) => h.name || h.contact)
      : [];

    const eligibility = data.eligibility || data.eligibilityCriteria || 'All Students';

    const registrationFee = Number(data.registrationFee ?? 0);

    const eventData = {
      title: data.title || data.eventName || '',
      category: data.category || 'technical',
      description: data.description || '',
      date: data.date || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      time: data.time || [data.startTime, data.endTime].filter(Boolean).join(' - ') || '',
      venue: data.venue || '',
      teamHeads,
      eligibility,
      registrationFee,
      maxParticipants,
      registrationDeadline: data.registrationDeadline || null,
      rules: Array.isArray(data.rules) ? data.rules : (data.rules ? [data.rules] : []),
      status,
      isActive,
      brochureUrl: data.brochureUrl || '',
      currentRegistrations: 0,
      availableSpots: maxParticipants,
      createdBy: currentUid,
      updatedBy: currentUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const eventsRef = collection(db, EVENTS_COLLECTION);
    const document = await addDoc(eventsRef, eventData);
    return {
      data: {
        success: true,
        data: {
          ...eventData,
          eventId: document.id,
          id: document.id,
        },
      },
    };
  },


  // --------------------------------------------------
  // UPDATE EVENT
  // --------------------------------------------------
  update: async (id, data) => {
    const currentUid = auth.currentUser?.uid || 'admin';
    const eventRef = doc(db, EVENTS_COLLECTION, id);
    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) {
      throw new Error('Event not found');
    }

    const existingEvent = snapshot.data();
    const maxParticipants = Number(
      data.maxParticipants ??
      data.max_participants ??
      existingEvent.maxParticipants ??
      existingEvent.max_participants ??
      50
    );
    const currentRegistrations = Number(existingEvent.currentRegistrations || 0);
    const status = data.status || existingEvent.status || (data.isActive === false ? 'closed' : 'open');
    const isActive = data.isActive !== undefined
      ? Boolean(data.isActive)
      : (status === 'open' || status === 'active');

    const teamHeads = Array.isArray(data.teamHeads)
      ? data.teamHeads
          .slice(0, 4)
          .map((h) => ({
            name: typeof h === 'string' ? h.trim() : (h?.name || '').trim(),
            contact: typeof h === 'string' ? '' : (h?.contact || h?.phone || h?.email || '').trim(),
          }))
          .filter((h) => h.name || h.contact)
      : (existingEvent.teamHeads || []);

    const eligibility = data.eligibility || data.eligibilityCriteria || existingEvent.eligibility || 'All Students';
    const registrationFee = Number(data.registrationFee ?? existingEvent.registrationFee ?? 0);

    const updatedData = {
      ...data,
      teamHeads,
      eligibility,
      registrationFee,
      maxParticipants,
      availableSpots: Math.max(0, maxParticipants - currentRegistrations),
      status,
      isActive,
      updatedBy: currentUid,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(eventRef, updatedData);
    const updatedSnapshot = await getDoc(eventRef);

    return {
      data: {
        success: true,
        data: formatFirestoreEvent(updatedSnapshot),
      },
    };
  },


  // --------------------------------------------------
  // DELETE EVENT
  // --------------------------------------------------
  delete: async (id) => {
    const eventRef = doc(db, EVENTS_COLLECTION, id);
    await deleteDoc(eventRef);

    return {
      data: {
        success: true,
      },
    };
  },


  // --------------------------------------------------
  // REAL-TIME MULTIPLE EVENTS LISTENER
  // --------------------------------------------------
  subscribeToEvents: (callback, errorCallback, params = {}) => {
    const eventsRef = collection(db, EVENTS_COLLECTION);

    return onSnapshot(
      eventsRef,
      (snapshot) => {
        const allEvents = snapshot.docs.map(formatFirestoreEvent);
        const events = params.active_only ? allEvents.filter((e) => e.isActive !== false) : allEvents;
        callback(events);
      },
      (error) => {
        console.error('Real-time event listener error:', error);
        if (typeof errorCallback === 'function') {
          errorCallback(error);
        }
      }
    );
  },

  subscribe: (callback, params = {}) => {
    return eventApi.subscribeToEvents(callback, null, params);
  },


  // --------------------------------------------------
  // REAL-TIME SINGLE EVENT LISTENER
  // --------------------------------------------------
  subscribeToEvent: (eventId, callback, errorCallback) => {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);

    return onSnapshot(
      eventRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(formatFirestoreEvent(snapshot));
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Real-time event error:', error);
        if (typeof errorCallback === 'function') {
          errorCallback(error);
        }
      }
    );
  },

  // --------------------------------------------------
  // SEED TECHNOPHITE EVENTS TO FIRESTORE
  // --------------------------------------------------
  seedTechnophiteEvents: async () => {
    let existingEvents = [];
    try {
      const res = await eventApi.getAll({ active_only: false });
      existingEvents = res?.data?.data?.events || [];
    } catch {
      existingEvents = [];
    }

    const existingTitles = new Set(
      existingEvents.map((e) => (e.title || '').trim().toLowerCase())
    );

    const added = [];
    for (const eventData of TECHNOPHITE_EVENTS) {
      if (!existingTitles.has(eventData.title.trim().toLowerCase())) {
        const createRes = await eventApi.create(eventData);
        added.push(createRes.data.data);
      }
    }

    return {
      success: true,
      count: added.length,
      events: added,
    };
  },
};

export const TECHNOPHITE_EVENTS = [
  {
    title: 'Brandify',
    category: 'cultural',
    description: 'Showcase your creativity and marketing brilliance by rebranding a product or designing an innovative brand identity from scratch. Pitch your brand concept, tagline, and logo to our judges!',
    venue: '',
    date: '',
    time: '',
    registrationFee: 100,
    max_participants: 40,
    maxParticipants: 40,
    availableSpots: 40,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Prompt-athon',
    category: 'technical',
    description: 'The ultimate AI prompt engineering hackathon! Craft precise, creative, and optimized prompts to solve complex tasks, generate code, and produce stunning digital artifacts using state-of-the-art LLMs.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 100,
    max_participants: 60,
    maxParticipants: 60,
    availableSpots: 60,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Tech-pictionary',
    category: 'technical',
    description: 'A fast-paced blend of tech knowledge and classic Pictionary! One teammate draws tech concepts, architectures, or gadgets while others guess before the countdown timer runs out.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 50,
    max_participants: 50,
    maxParticipants: 50,
    availableSpots: 50,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Code Quest',
    category: 'technical',
    description: 'An adventurous algorithmic treasure hunt! Solve progressive coding puzzles and decode cryptograms to unlock the next clue and race your way to the top of the leaderboard.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 100,
    max_participants: 60,
    maxParticipants: 60,
    availableSpots: 60,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Web Weavers',
    category: 'technical',
    description: 'Frontend and UI/UX design battle. Given a surprise theme and wireframe constraints, craft the most responsive, accessible, and visually stunning web experience within 3 hours.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 200,
    max_participants: 50,
    maxParticipants: 50,
    availableSpots: 50,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Code Wars',
    category: 'technical',
    description: 'Head-to-head competitive programming showdown! Battle through high-octane rounds of algorithmic problem solving, time complexity optimization, and speed debugging.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 100,
    max_participants: 80,
    maxParticipants: 80,
    availableSpots: 80,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Pixel Play',
    category: 'cultural',
    description: 'A graphic design and visual storytelling competition. Transform ideas into breathtaking digital posters, UI concept arts, or vector illustrations under creative prompts.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 50,
    max_participants: 40,
    maxParticipants: 40,
    availableSpots: 40,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Techwiz',
    category: 'technical',
    description: 'The flagship Technophite IT quiz! Test your intellect across CS history, cutting-edge hardware, cybersecurity, AI revolutions, and tech pop culture.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 50,
    max_participants: 100,
    maxParticipants: 100,
    availableSpots: 100,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'Reel Rush',
    category: 'cultural',
    description: 'Capture the spirit of Technophite in high gear! Shoot, edit, and produce a viral tech-themed Instagram Reel or short video highlighting innovation and campus buzz.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 50,
    max_participants: 30,
    maxParticipants: 30,
    availableSpots: 30,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'FIFA',
    category: 'sports',
    description: 'Virtual pitch, real glory! Battle it out 1v1 on PlayStation consoles in a knockout tournament format. Pick your club, strategize your lineup, and claim the championship trophy.',
    venue: '',
    date: '',
    time: '',
    registrationFee: 150,
    max_participants: 64,
    maxParticipants: 64,
    availableSpots: 64,
    currentRegistrations: 0,
    isActive: true,
  },
  {
    title: 'BGMI',
    category: 'sports',
    description: 'Drop onto the battleground! Squad up with your 4-player team in classic Erangel and Miramar maps. Strategy, gunplay, and team coordination will decide who wins the Winner Winner Chicken Dinner!',
    venue: '',
    date: '',
    time: '',
    registrationFee: 100,
    max_participants: 80,
    maxParticipants: 80,
    availableSpots: 80,
    currentRegistrations: 0,
    isActive: true,
  },
];

export default eventApi;