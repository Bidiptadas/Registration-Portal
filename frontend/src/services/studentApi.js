/**
 * Student API Service (Mock Mode).
 */
import { getFromStore, saveToStore } from './mockDb';
import { auth } from '../firebase/firebaseConfig';

export const studentApi = {
  getMyProfile: async () => {
    const students = getFromStore('tp_students') || [];
    const uid = auth.currentUser?.uid || 'mock-student-uid';
    const student = students.find((s) => s.uid === uid) || students[0];
    return { data: { success: true, data: student } };
  },

  updateMyProfile: async (data) => {
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
