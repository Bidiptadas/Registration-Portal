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
import { getFromStore, saveToStore } from './mockDb';

const EVENTS_COLLECTION = 'events';

export const eventApi = {

  // --------------------------------------------------
  // GET ALL EVENTS
  // --------------------------------------------------
  getAll: async (params = {}) => {

    if (auth.isMock) {
      const events = (getFromStore('tp_events') || []).filter((event) => !params.active_only || event.isActive);
      return { data: { success: true, data: { events, total: events.length, page: 1, limit: params.limit || 100 } } };
    }

    const eventsRef = collection(db, EVENTS_COLLECTION);

    let snapshot;

    if (params.active_only) {

      const q = query(
        eventsRef,
        where('isActive', '==', true)
      );

      snapshot = await getDocs(q);

    } else {

      snapshot = await getDocs(eventsRef);
    }

    const events = snapshot.docs.map((document) => ({
      ...document.data(),
      eventId: document.id,
    }));

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
  },


  // --------------------------------------------------
  // GET ONE EVENT
  // --------------------------------------------------
  getById: async (id) => {

    if (auth.isMock) {
      const event = (getFromStore('tp_events') || []).find((item) => item.eventId === id);
      if (!event) throw new Error('Event not found');
      return { data: { success: true, data: event } };
    }

    const eventRef = doc(
      db,
      EVENTS_COLLECTION,
      id
    );

    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) {

      throw new Error('Event not found');
    }

    const event = {
      ...snapshot.data(),
      eventId: snapshot.id,
    };

    return {
      data: {
        success: true,
        data: event,
      },
    };
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

    if (auth.isMock) {
      const events = getFromStore('tp_events') || [];
      const newEvent = { ...data, eventId: `evt-${Date.now()}`, currentRegistrations: 0, availableSpots: Number(data.maxParticipants || data.max_participants || 50), isActive: true };
      saveToStore('tp_events', [...events, newEvent]);
      return { data: { success: true, data: newEvent } };
    }

    const eventData = {

      ...data,

      currentRegistrations: 0,

      availableSpots:
        Number(data.maxParticipants || data.max_participants || 50),

      isActive: true,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };

    const eventsRef = collection(
      db,
      EVENTS_COLLECTION
    );

    const document = await addDoc(
      eventsRef,
      eventData
    );

    return {
      data: {
        success: true,

        data: {
          ...eventData,
          eventId: document.id,
        },
      },
    };
  },


  // --------------------------------------------------
  // UPDATE EVENT
  // --------------------------------------------------
  update: async (id, data) => {

    if (auth.isMock) {
      const events = getFromStore('tp_events') || [];
      const index = events.findIndex((item) => item.eventId === id);
      if (index === -1) throw new Error('Event not found');
      const event = { ...events[index], ...data };
      const maxParticipants = Number(event.maxParticipants ?? event.max_participants ?? 50);
      event.maxParticipants = maxParticipants;
      event.availableSpots = Math.max(0, maxParticipants - Number(event.currentRegistrations || 0));
      events[index] = event;
      saveToStore('tp_events', events);
      return { data: { success: true, data: event } };
    }

    const eventRef = doc(
      db,
      EVENTS_COLLECTION,
      id
    );

    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) {

      throw new Error('Event not found');
    }

    const existingEvent = snapshot.data();

    const maxParticipants =
      Number(
        data.maxParticipants ??
        data.max_participants ??
        existingEvent.maxParticipants ??
        existingEvent.max_participants ??
        50
      );

    const currentRegistrations =
      Number(
        existingEvent.currentRegistrations || 0
      );

    const updatedData = {

      ...data,

      maxParticipants,

      availableSpots:
        Math.max(
          0,
          maxParticipants - currentRegistrations
        ),

      updatedAt: serverTimestamp(),
    };

    await updateDoc(
      eventRef,
      updatedData
    );

    const updatedSnapshot =
      await getDoc(eventRef);

    return {
      data: {
        success: true,

        data: {
          ...updatedSnapshot.data(),
          eventId: updatedSnapshot.id,
        },
      },
    };
  },


  // --------------------------------------------------
  // DELETE EVENT
  // --------------------------------------------------
  delete: async (id) => {

    if (auth.isMock) {
      saveToStore('tp_events', (getFromStore('tp_events') || []).filter((event) => event.eventId !== id));
      return { data: { success: true } };
    }

    const eventRef = doc(
      db,
      EVENTS_COLLECTION,
      id
    );

    await deleteDoc(eventRef);

    return {
      data: {
        success: true,
      },
    };
  },


  // --------------------------------------------------
  // REAL-TIME EVENT LISTENER
  // --------------------------------------------------
  subscribe: (callback, params = {}) => {

    const eventsRef = collection(
      db,
      EVENTS_COLLECTION
    );

    let q = eventsRef;

    if (params.active_only) {

      q = query(
        eventsRef,
        where('isActive', '==', true)
      );
    }

    return onSnapshot(
      q,

      (snapshot) => {

        const events =
          snapshot.docs.map((document) => ({
            ...document.data(),
            eventId: document.id,
          }));

        callback(events);
      },

      (error) => {

        console.error(
          'Real-time event listener error:',
          error
        );
      }
    );
  },


  // --------------------------------------------------
  // REAL-TIME SINGLE EVENT LISTENER
  // --------------------------------------------------
  subscribeToEvent: (eventId, callback) => {

    const eventRef = doc(
      db,
      EVENTS_COLLECTION,
      eventId
    );

    return onSnapshot(
      eventRef,

      (snapshot) => {

        if (snapshot.exists()) {

          callback({
            ...snapshot.data(),
            eventId: snapshot.id,
          });

        } else {

          callback(null);
        }
      },

      (error) => {

        console.error(
          'Real-time event error:',
          error
        );
      }
    );
  },
};

export default eventApi;