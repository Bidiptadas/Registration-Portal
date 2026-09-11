/** Student profile service backed by Firestore with a local fallback for mock mode. */
import { getFromStore, saveToStore } from './mockDb';
import { auth } from '../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const getAuthenticatedUser = () => {
  if (!auth.currentUser) {
    const error = new Error('You must be signed in to access your profile.');
    error.code = 'auth unauthenticated';
    throw error;
  }

  return auth.currentUser;
};

export const studentApi = {
  getMyProfile: async () => {
    if (!auth.isMock) {
      const user = getAuthenticatedUser();
      const snapshot = await getDoc(doc(db, 'users', user.uid));
      return { data: { success: true, data: snapshot.exists() ? snapshot.data() : null } };
    }

    const students = getFromStore('tp_students') || [];
    const uid = auth.currentUser?.uid || 'mock-student-uid';
    const student = students.find((s) => s.uid === uid) || students[0];
    return { data: { success: true, data: student } };
  },

  updateMyProfile: async (data) => {
    if (!auth.isMock) {
      const user = getAuthenticatedUser();
      const profileData = {
        display_name: data.display_name.trim(),
        phone: data.phone,
        year: Number(data.year),
        ...(data.profileImageUrl !== undefined ? { profileImageUrl: data.profileImageUrl } : {}),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'users', user.uid), profileData);
      if (data.display_name.trim() !== user.displayName) {
        await updateProfile(user, { displayName: data.display_name.trim() });
      }

      return { data: { success: true, data: { ...data, ...profileData, uid: user.uid } } };
    }

    const students = getFromStore('tp_students') || [];
    const uid = auth.currentUser?.uid || 'mock-student-uid';
    const index = students.findIndex((s) => s.uid === uid);
    if (index !== -1) {
      students[index] = { ...students[index], ...data };
      saveToStore('tp_students', students);
    }
    return { data: { success: true, data: students[index] } };
  },

  getById: async (id) => {
    const students = getFromStore('tp_students') || [];
    const student = students.find((s) => s.uid === id);
    return { data: { success: true, data: student } };
  },

  getAll: async (params) => {
    const students = getFromStore('tp_students') || [];
    if (params?.search) {
      const filtered = students.filter((s) =>
        s.displayName.toLowerCase().includes(params.search.toLowerCase())
      );
      return { data: { success: true, data: filtered } };
    }
    return {
      data: {
        success: true,
        data: {
          students: students,
          total: students.length,
          page: 1,
          limit: 100,
        },
      },
    };
  },

  delete: async (id) => {
    const students = getFromStore('tp_students') || [];
    const updated = students.filter((s) => s.uid !== id);
    saveToStore('tp_students', updated);
    return { data: { success: true } };
  },
};

export default studentApi;
