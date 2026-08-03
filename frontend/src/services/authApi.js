/**
 * Authentication API Service (Mock Mode).
 */
import { getFromStore, saveToStore } from './mockDb';

export const authApi = {
  register: async (data) => {
    const students = getFromStore('tp_students') || [];
    const newStudent = {
      uid: data.uid || `mock-student-uid-${Date.now()}`,
      email: data.email,
      displayName: data.display_name,
      phone: data.phone,
      college: data.college,
      department: data.department,
      year: data.year,
      rollNumber: data.roll_number,
      profileImageUrl: '',
    };
    students.push(newStudent);
    saveToStore('tp_students', students);
    return { data: { success: true, data: newStudent } };
  },

  login: async (idToken) => {
    const role = idToken.includes('admin') ? 'admin' : 'student';
    const students = getFromStore('tp_students') || [];
    
    let student = null;
    if (role === 'student') {
      if (idToken.startsWith('mock-student-token:')) {
        const email = idToken.split('mock-student-token:')[1];
        student = students.find((s) => s.email.toLowerCase() === email.toLowerCase());
      }
      if (!student) {
        student = students.find((s) => s.uid === 'mock-student-uid') || students[students.length - 1];
      }
    }
    
    return {
      data: {
        success: true,
        data: {
          uid: role === 'admin' ? 'mock-admin-uid' : (student?.uid || 'mock-student-uid'),
          email: role === 'admin' ? 'admin@tecnophite.edu' : (student?.email || 'student@tecnophite.edu'),
          displayName: role === 'admin' ? 'Mock Admin' : (student?.displayName || 'Mock Student'),
          role: role === 'admin' ? 'super_admin' : 'student',
          isAdmin: role === 'admin',
        },
      },
    };
  },

  adminLogin: async (idToken) => {
    return authApi.login('mock-admin-token');
  },

  verifyToken: async (idToken) => {
    return authApi.login(idToken);
  },

  forgotPassword: async (email) => {
    return { data: { success: true, message: 'Reset email sent' } };
  },

  getMe: async () => {
    return {
      data: {
        success: true,
        data: {
          uid: 'mock-student-uid',
          email: 'student@tecnophite.edu',
          displayName: 'Mock Student',
          role: 'student',
          isAdmin: false,
        },
      },
    };
  },
};

export default authApi;
