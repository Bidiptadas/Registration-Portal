/** Student profile service backed directly by Firestore. */
import { auth, db } from '../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';

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
    const user = getAuthenticatedUser();
    const snapshot = await getDoc(doc(db, 'users', user.uid));
    return { data: { success: true, data: snapshot.exists() ? snapshot.data() : null } };
  },

  updateMyProfile: async (data) => {
    const user = getAuthenticatedUser();
    const profileData = {
      display_name: (data.display_name || data.displayName || '').trim(),
      phone: data.phone || '',
      college: (data.college || data.collegeName || '').trim(),
      ...(data.profileImageUrl !== undefined ? { profileImageUrl: data.profileImageUrl } : {}),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, 'users', user.uid), profileData);
    const newName = (data.display_name || data.displayName || '').trim();
    if (newName && newName !== user.displayName) {
      await updateProfile(user, { displayName: newName });
    }

    return { data: { success: true, data: { ...data, ...profileData, uid: user.uid } } };
  },

  getById: async (id) => {
    const snap = await getDoc(doc(db, 'users', id));
    if (!snap.exists()) {
      throw new Error('Student not found');
    }
    return { data: { success: true, data: { ...snap.data(), uid: snap.id } } };
  },

  getAll: async (params) => {
    const snap = await getDocs(collection(db, 'users'));
    let students = snap.docs.map((d) => ({ ...d.data(), uid: d.id }));

    if (params?.search) {
      const q = params.search.toLowerCase();
      students = students.filter((s) =>
        (s.displayName || s.display_name || s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      );
    }

    return {
      data: {
        success: true,
        data: {
          students,
          total: students.length,
          page: 1,
          limit: 100,
        },
      },
    };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'users', id));
    return { data: { success: true } };
  },
};

export default studentApi;
