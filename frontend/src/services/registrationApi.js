/**
 * Registration API Service (Mock Mode).
 */
import { getFromStore, saveToStore } from './mockDb';
import { auth } from '../firebase/firebaseConfig';

export const registrationApi = {
  register: async (eventId) => {
    const registrations = getFromStore('tp_registrations') || [];
    const events = getFromStore('tp_events') || [];
    const students = getFromStore('tp_students') || [];

    const eventIndex = events.findIndex((e) => e.eventId === eventId);
    const uid = auth.currentUser?.uid || 'mock-student-uid';
    const student = students.find((s) => s.uid === uid) || students[0];

    if (eventIndex !== -1) {
      const event = events[eventIndex];

      // Check duplicate
      const duplicate = registrations.some(
        (r) => r.eventId === eventId && r.userId === student.uid && r.status === 'registered'
      );
      if (duplicate) {
        throw new Error('You are already registered for this event');
      }

      // Check full
      if (event.availableSpots === 0) {
        throw new Error('This event is full');
      }

      // Register
      const newReg = {
        registrationId: `reg-${Date.now()}`,
        userId: student.uid,
        eventId: eventId,
        userName: student.displayName,
        eventTitle: event.title,
        status: 'registered',
        registeredAt: new Date().toISOString(),
      };

      registrations.push(newReg);
      saveToStore('tp_registrations', registrations);

      // Decrement spot
      event.currentRegistrations += 1;
      event.availableSpots = Math.max(0, event.maxParticipants - event.currentRegistrations);
      saveToStore('tp_events', events);

      return { data: { success: true, data: newReg } };
    }
    throw new Error('Event not found');
  },

  getMyRegistrations: async () => {
    const registrations = getFromStore('tp_registrations') || [];
    const uid = auth.currentUser?.uid || 'mock-student-uid';
    const filtered = registrations.filter((r) => r.userId === uid);
    return { data: { success: true, data: filtered } };
  },

  getByEvent: async (eventId) => {
    const registrations = getFromStore('tp_registrations') || [];
    const filtered = registrations.filter((r) => r.eventId === eventId);
    return { data: { success: true, data: filtered } };
  },

  getAll: async (params) => {
    const registrations = getFromStore('tp_registrations') || [];
    return {
      data: {
        success: true,
        data: {
          registrations: registrations,
          total: registrations.length,
          page: 1,
          limit: 100,
        },
      },
    };
  },

  updateStatus: async (id, status) => {
    const registrations = getFromStore('tp_registrations') || [];
    const events = getFromStore('tp_events') || [];
    const index = registrations.findIndex((r) => r.registrationId === id);

    if (index !== -1) {
      const oldStatus = registrations[index].status;
      registrations[index].status = status;
      saveToStore('tp_registrations', registrations);

      // Adjust event counters if status changes to/from cancelled
      if (status === 'cancelled' && oldStatus === 'registered') {
        const eventIndex = events.findIndex((e) => e.eventId === registrations[index].eventId);
        if (eventIndex !== -1) {
          const event = events[eventIndex];
          event.currentRegistrations = Math.max(0, event.currentRegistrations - 1);
          event.availableSpots = event.maxParticipants - event.currentRegistrations;
          saveToStore('tp_events', events);
        }
      }
    }
    return { data: { success: true, data: registrations[index] } };
  },

  cancel: async (id) => {
    return registrationApi.updateStatus(id, 'cancelled');
  },
};

export default registrationApi;
