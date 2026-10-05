import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const ANNOUNCEMENTS_COLLECTION = 'announcements';
const ACHIEVEMENTS_COLLECTION = 'achievements';
const CAROUSEL_COLLECTION = 'carousel';

const getDateValue = (value) => {
  if (value?.toDate) return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (!value) return null;
  return new Date(value);
};

export const studentContentApi = {
  getAnnouncements: async () => {
    try {
      let snapshot;
      try {
        const announcementsQuery = query(
          collection(db, ANNOUNCEMENTS_COLLECTION),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
        );
        snapshot = await getDocs(announcementsQuery);
      } catch (queryErr) {
        console.warn('Optimized announcements query failed, falling back to basic query:', queryErr);
        snapshot = await getDocs(collection(db, ANNOUNCEMENTS_COLLECTION));
      }

      const announcements = snapshot.docs
        .map((document) => ({
          ...document.data(),
          announcementId: document.id,
        }))
        .filter((item) => item.isActive !== false)
        .sort((a, b) => {
          const dateA = getDateValue(a.createdAt) || 0;
          const dateB = getDateValue(b.createdAt) || 0;
          return dateB - dateA;
        });

      return { data: { success: true, data: announcements } };
    } catch (err) {
      console.error('Failed to load announcements from Firestore:', err);
      return { data: { success: true, data: [] } };
    }
  },

  getAnnouncementById: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
      if (docSnap.exists()) {
        return { data: { success: true, data: { ...docSnap.data(), announcementId: docSnap.id } } };
      }
    } catch {
      // Fallback to searching in memory
    }
    const response = await studentContentApi.getAnnouncements();
    const announcement = response.data.data.find((item) => (item.announcementId || item.id) === id);
    if (!announcement) throw new Error('Announcement not found');
    return { data: { success: true, data: announcement } };
  },

  createAnnouncement: async (announcementData) => {
    const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
      ...announcementData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      data: {
        success: true,
        data: {
          ...announcementData,
          announcementId: docRef.id,
          createdAt: new Date(),
        },
      },
    };
  },

  updateAnnouncement: async (id, announcementData) => {
    await updateDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id), {
      ...announcementData,
      updatedAt: serverTimestamp(),
    });
    return {
      data: {
        success: true,
        data: {
          ...announcementData,
          announcementId: id,
          updatedAt: new Date(),
        },
      },
    };
  },

  deleteAnnouncement: async (id) => {
    try {
      await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
    } catch {
      await updateDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id), { isActive: false });
    }
    return { data: { success: true } };
  },

  getAchievements: async () => {
    try {
      const achievementsQuery = query(
        collection(db, ACHIEVEMENTS_COLLECTION),
        where('isActive', '==', true),
        orderBy('date', 'desc'),
      );
      const snapshot = await getDocs(achievementsQuery);
      const achievements = snapshot.docs.map((document) => ({
        ...document.data(),
        achievementId: document.id,
      }));

      return { data: { success: true, data: achievements } };
    } catch {
      return { data: { success: true, data: [] } };
    }
  },

  getCarouselImages: async () => {
    // 1. Try settings document ('settings/carousel') first
    try {
      const settingsDocRef = doc(db, 'settings', 'carousel');
      const settingsSnap = await getDoc(settingsDocRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
        if (images.length > 0) {
          return { data: { success: true, data: images } };
        }
      }
    } catch (err) {
      console.warn('Could not fetch settings/carousel from Firestore:', err);
    }

    // 2. Try 'carousel' collection
    try {
      const carouselQuery = query(
        collection(db, CAROUSEL_COLLECTION),
        where('isActive', '==', true),
      );
      const snapshot = await getDocs(carouselQuery);
      if (!snapshot.empty) {
        const images = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (Number(a.order || 0)) - (Number(b.order || 0)))
          .map((item) => item.imageUrl || item.url || item.src)
          .filter(Boolean);

        if (images.length > 0) {
          return { data: { success: true, data: images } };
        }
      }
    } catch (err) {
      console.warn('Could not fetch carousel collection from Firestore:', err);
    }

    return { data: { success: true, data: [] } };
  },

  formatDate: getDateValue,
};

export default studentContentApi;
