/**
 * Admin API Service.
 * Interacts directly with Firebase Firestore.
 */
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const adminApi = {
  getDashboardStats: async () => {
    try {
      const [eventsSnap, registrationsSnap] = await Promise.all([
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'registrations')),
      ]);

      const events = eventsSnap.docs.map((d) => d.data());
      const registrations = registrationsSnap.docs.map((d) => d.data());

      return {
        data: {
          success: true,
          data: {
            totalEvents: eventsSnap.size,
            activeEvents: events.filter((e) => e.isActive !== false && e.status !== 'closed').length,
            totalRegistrations: registrations.filter((r) => r.status === 'registered' || r.registrationStatus === 'CONFIRMED').length,
            totalAssociationMembers: 0,
          },
        },
      };
    } catch (err) {
      console.error('Failed to get dashboard stats from Firestore:', err);
      return {
        data: {
          success: true,
          data: {
            totalEvents: 0,
            activeEvents: 0,
            totalRegistrations: 0,
            totalAssociationMembers: 0,
          },
        },
      };
    }
  },

  getSettings: async () => {
    let settings = {};
    let carouselImages = [];

    try {
      const generalSnap = await getDoc(doc(db, 'settings', 'general'));
      if (generalSnap.exists()) {
        settings = generalSnap.data();
      }
      const carouselSnap = await getDoc(doc(db, 'settings', 'carousel'));
      if (carouselSnap.exists() && Array.isArray(carouselSnap.data().images)) {
        carouselImages = carouselSnap.data().images;
      }
    } catch (err) {
      console.warn('Could not fetch settings from Firestore:', err);
    }

    return {
      data: {
        success: true,
        data: {
          ...settings,
          carouselImages,
        },
      },
    };
  },

  updateSettings: async (data) => {
    const updated = {
      appName: data.app_name !== undefined ? data.app_name : 'Technophite Registration Portal',
      maxEventsPerStudent: data.max_events_per_student !== undefined ? data.max_events_per_student : 5,
      registrationOpen: data.registration_open !== undefined ? data.registration_open : true,
      maintenanceMode: data.maintenance_mode !== undefined ? data.maintenance_mode : false,
      contactEmail: data.contact_email !== undefined ? data.contact_email : '',
    };

    let carouselImages = [];
    if (data.carousel_images !== undefined) {
      carouselImages = Array.isArray(data.carousel_images)
        ? data.carousel_images
        : String(data.carousel_images)
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    try {
      await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
      if (data.carousel_images !== undefined) {
        await setDoc(doc(db, 'settings', 'carousel'), { images: carouselImages, updatedAt: new Date() }, { merge: true });
      }
    } catch (err) {
      console.warn('Could not save settings to Firestore:', err);
    }

    return {
      data: {
        success: true,
        data: {
          ...updated,
          carouselImages,
        },
      },
    };
  },

  exportRegistrations: async () => {
    try {
      const snap = await getDocs(collection(db, 'registrations'));
      const registrations = snap.docs.map((d) => ({
        ...d.data(),
        registrationId: d.id,
      }));
      return {
        data: {
          success: true,
          data: {
            registrations,
          },
        },
      };
    } catch {
      return {
        data: {
          success: true,
          data: {
            registrations: [],
          },
        },
      };
    }
  },

  exportStudents: async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const students = snap.docs.map((d) => ({
        ...d.data(),
        uid: d.id,
      }));
      return {
        data: {
          success: true,
          data: {
            students,
          },
        },
      };
    } catch {
      return {
        data: {
          success: true,
          data: {
            students: [],
          },
        },
      };
    }
  },
};

export default adminApi;
