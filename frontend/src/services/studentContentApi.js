import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { getFromStore } from './mockDb';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

const getDateValue = (value) => {
  if (value?.toDate) return value.toDate();
  if (!value) return null;
  return new Date(value);
};

export const studentContentApi = {
  getAnnouncements: async () => {
    if (auth.isMock) {
      return {
        data: {
          success: true,
          data: (getFromStore('tp_announcements') || []).filter((item) => item.isActive !== false),
        },
      };
    }

    const announcementsQuery = query(
      collection(db, ANNOUNCEMENTS_COLLECTION),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(announcementsQuery);
    const announcements = snapshot.docs.map((document) => ({
      ...document.data(),
      announcementId: document.id,
    }));

    return { data: { success: true, data: announcements } };
  },

  formatDate: getDateValue,
};

export default studentContentApi;
