import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  onAuthChange,
  signOut,
} from '../firebase/authService';

import { db } from '../firebase/firebaseConfig';

import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('AuthProvider mounted');

    let unsubscribeAuth = null;
    let unsubscribeAdmin = null;
    let unsubscribeStudent = null;

    const cleanupFirestoreListeners = () => {
      if (unsubscribeAdmin) {
        unsubscribeAdmin();
        unsubscribeAdmin = null;
      }

      if (unsubscribeStudent) {
        unsubscribeStudent();
        unsubscribeStudent = null;
      }
    };

    unsubscribeAuth = onAuthChange((firebaseUser) => {
      console.log('=================================');
      console.log('AUTH STATE CHANGED');
      console.log('=================================');

      cleanupFirestoreListeners();

      if (!firebaseUser) {
        console.log('No authenticated Firebase user');

        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);

        return;
      }

      console.log('Firebase user:', firebaseUser);
      console.log('UID:', firebaseUser.uid);
      console.log('Email:', firebaseUser.email);
      console.log('Email verified:', firebaseUser.emailVerified);

      setUser(firebaseUser);
      setUserProfile(null);
      setIsAdmin(false);
      setLoading(true);

      const adminQuery = query(
        collection(db, 'admins'),
        where('authUid', '==', firebaseUser.uid)
      );

      unsubscribeAdmin = onSnapshot(
        adminQuery,

        (adminSnapshot) => {
          console.log('=================================');
          console.log('ADMIN QUERY COMPLETED');
          console.log('=================================');

          if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            const adminData = adminDoc.data();

            console.log('ADMIN PROFILE FOUND');
            console.log('Admin document ID:', adminDoc.id);
            console.log('Admin data:', adminData);

            if (adminData.role === 'admin') {
              const adminProfile = {
                ...adminData,

                uid: firebaseUser.uid,

                email:
                  firebaseUser.email ||
                  adminData.email ||
                  '',

                displayName:
                  adminData.name ||
                  firebaseUser.displayName ||
                  '',

                emailVerified:
                  firebaseUser.emailVerified,

                adminDocumentId:
                  adminDoc.id,

                role: 'admin',
              };

              setUserProfile(adminProfile);
              setIsAdmin(true);
              setLoading(false);

              console.log('=================================');
              console.log('ADMIN VERIFIED');
              console.log('=================================');
              console.log('Role:', 'admin');
              console.log('Is admin:', true);

              /*
               * We found the admin.
               * Student listener is not required.
               */
              if (unsubscribeStudent) {
                unsubscribeStudent();
                unsubscribeStudent = null;
              }

              return;
            }
          }
          console.log('No admin profile found.');
          console.log('Checking students collection...');

          unsubscribeStudent = onSnapshot(
            doc(db, 'users', firebaseUser.uid),

            (studentSnapshot) => {
              console.log('=================================');
              console.log('STUDENT QUERY COMPLETED');
              console.log('=================================');

              if (!studentSnapshot.exists()) {
                console.warn(
                  'No student profile found for UID:',
                  firebaseUser.uid
                );

                setUserProfile(null);
                setIsAdmin(false);
                setLoading(false);

                return;
              }

              const studentData = studentSnapshot.data();

              const role =
                studentData.role || 'student';

              const studentProfile = {
                ...studentData,

                uid: firebaseUser.uid,

                email:
                  firebaseUser.email ||
                  studentData.email ||
                  '',

                displayName:
                  studentData.display_name ||
                  firebaseUser.displayName ||
                  '',

                emailVerified:
                  firebaseUser.emailVerified,

                studentDocumentId:
                  studentSnapshot.id,

                role,
              };

              setUserProfile(studentProfile);
              setIsAdmin(false);
              setLoading(false);

              console.log('=================================');
              console.log('STUDENT PROFILE FOUND');
              console.log('=================================');
              console.log('Student document ID:', studentDoc.id);
              console.log('Student data:', studentData);
              console.log('Role:', role);
              console.log('Is admin:', false);
            },

            (error) => {
              console.error(
                'Error listening to students collection:',
                error
              );

              setUserProfile(null);
              setIsAdmin(false);
              setLoading(false);
            }
          );
        },

        (error) => {
         
          console.error(
            'Error listening to admins collection:',
            error
          );

          setUserProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      );
    });

    return () => {
      console.log('AuthProvider cleanup');

      cleanupFirestoreListeners();

      if (unsubscribeAuth) {
        unsubscribeAuth();
        unsubscribeAuth = null;
      }
    };
  }, []);

  const logout = async () => {
    try {
      await signOut();

      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    
    console.log(
      'Profile is synchronized automatically using onSnapshot().'
    );
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider'
    );
  }
  return context;
};
export default AuthContext;
