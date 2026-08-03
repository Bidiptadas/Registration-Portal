/**
 * Admin API Service (Mock Mode).
 */
import { getFromStore, saveToStore } from './mockDb';

export const adminApi = {
  getDashboardStats: async () => {
    const students = getFromStore('tp_students') || [];
    const events = getFromStore('tp_events') || [];
    const registrations = getFromStore('tp_registrations') || [];
    const members = getFromStore('tp_members') || [];

    return {
      data: {
        success: true,
        data: {
          totalStudents: students.length,
          totalEvents: events.length,
          activeEvents: events.filter((e) => e.isActive).length,
          totalRegistrations: registrations.filter((r) => r.status === 'registered').length,
          totalAssociationMembers: members.length,
        },
      },
    };
  },

  getSettings: async () => {
    const settings = getFromStore('tp_settings');
    return { data: { success: true, data: settings } };
  },

  updateSettings: async (data) => {
    const settings = getFromStore('tp_settings') || {};
    const updated = {
      appName: data.app_name !== undefined ? data.app_name : settings.appName,
      maxEventsPerStudent: data.max_events_per_student !== undefined ? data.max_events_per_student : settings.maxEventsPerStudent,
      registrationOpen: data.registration_open !== undefined ? data.registration_open : settings.registrationOpen,
      maintenanceMode: data.maintenance_mode !== undefined ? data.maintenance_mode : settings.maintenanceMode,
      contactEmail: data.contact_email !== undefined ? data.contact_email : settings.contactEmail,
    };
    saveToStore('tp_settings', updated);
    return { data: { success: true, data: updated } };
  },

  exportRegistrations: async () => {
    const registrations = getFromStore('tp_registrations') || [];
    return {
      data: {
        success: true,
        data: {
          registrations: registrations,
        },
      },
    };
  },

  exportStudents: async () => {
    const students = getFromStore('tp_students') || [];
    return {
      data: {
        success: true,
        data: {
          students: students,
        },
      },
    };
  },
};

export default adminApi;
