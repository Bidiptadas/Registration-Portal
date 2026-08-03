/**
 * Event API Service (Mock Mode).
 */
import { getFromStore, saveToStore } from './mockDb';

export const eventApi = {
  getAll: async (params) => {
    let events = getFromStore('tp_events') || [];
    if (params?.active_only) {
      events = events.filter((e) => e.isActive);
    }
    return {
      data: {
        success: true,
        data: {
          events: events,
          total: events.length,
          page: 1,
          limit: 100,
        },
      },
    };
  },

  getById: async (id) => {
    const events = getFromStore('tp_events') || [];
    const event = events.find((e) => e.eventId === id);
    const heads = getFromStore('tp_heads') || [];
    const head = heads.find((h) => h.headId === event?.eventHeadId);

    return {
      data: {
        success: true,
        data: {
          ...event,
          eventHeadName: head ? head.name : 'Unassigned',
          eventHeadPhone: head ? head.phone : 'N/A',
        },
      },
    };
  },

  getCategories: async () => {
    return { data: { success: true, data: ['technical', 'cultural', 'sports', 'workshop'] } };
  },

  create: async (data) => {
    const events = getFromStore('tp_events') || [];
    const newEvent = {
      ...data,
      eventId: `evt-${Date.now()}`,
      currentRegistrations: 0,
      availableSpots: data.max_participants || 50,
      isActive: true,
    };
    events.push(newEvent);
    saveToStore('tp_events', events);
    return { data: { success: true, data: newEvent } };
  },

  update: async (id, data) => {
    const events = getFromStore('tp_events') || [];
    const index = events.findIndex((e) => e.eventId === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...data };
      if (events[index].max_participants) {
        events[index].availableSpots = events[index].max_participants - events[index].currentRegistrations;
      }
      saveToStore('tp_events', events);
    }
    return { data: { success: true, data: events[index] } };
  },

  delete: async (id) => {
    const events = getFromStore('tp_events') || [];
    const updated = events.filter((e) => e.eventId !== id);
    saveToStore('tp_events', updated);
    return { data: { success: true } };
  },
};

export default eventApi;
