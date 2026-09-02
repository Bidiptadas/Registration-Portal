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
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';


// --------------------------------------------------
// CREATE CONTEXT
// --------------------------------------------------

const AuthContext = createContext(null);


// --------------------------------------------------
// AUTH PROVIDER
// --------------------------------------------------

export function AuthProvider({ children }) {

  // Firebase Authentication user
  const [user, setUser] = useState(null);

  // Firestore profile
  const [userProfile, setUserProfile] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Admin status
  const [isAdmin, setIsAdmin] = useState(false);


  // ------------------------------------------------
  // AUTH + FIRESTORE LISTENER
  // ------------------------------------------------

  useEffect(() => {

    let unsubscribeFirestore = null;


    // ------------------------------------------------
    // FIREBASE AUTH STATE
    // ------------------------------------------------

    const unsubscribeAuth = onAuthChange((firebaseUser) => {

      console.log('=================================');
      console.log('AUTH STATE CHANGED');
      console.log('=================================');

      console.log('Firebase user:', firebaseUser);


      // ----------------------------------------------
      // REMOVE PREVIOUS FIRESTORE LISTENER
      // ----------------------------------------------

      if (unsubscribeFirestore) {

        unsubscribeFirestore();

        unsubscribeFirestore = null;
      }


      // ----------------------------------------------
      // USER LOGGED OUT
      // ----------------------------------------------

      if (!firebaseUser) {

        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);

        return;
      }


      // ----------------------------------------------
      // USER LOGGED IN
      // ----------------------------------------------

      setUser(firebaseUser);
      setLoading(true);


      console.log('Authenticated user UID:', firebaseUser.uid);
      console.log('Authenticated email:', firebaseUser.email);
      console.log(
        'Email verified:',
        firebaseUser.emailVerified
      );


      // =================================================
      // STEP 1: CHECK ADMINS COLLECTION
      // =================================================
      //
      // admins
      //   └── document
      //        ├── authUid
      //        ├── email
      //        ├── name
      //        └── role: "admin"
      //
      // =================================================

      const adminQuery = query(
        collection(db, 'admins'),
        where('authUid', '==', firebaseUser.uid)
      );


      let adminFound = false;

      let unsubscribeAdmin = null;

      let unsubscribeStudent = null;


      // ------------------------------------------------
      // ADMIN LISTENER
      // ------------------------------------------------

      unsubscribeAdmin = onSnapshot(
        adminQuery,

        (adminSnapshot) => {

          // --------------------------------------------
          // ADMIN FOUND
          // --------------------------------------------

          if (!adminSnapshot.empty) {

            const adminDoc =
              adminSnapshot.docs[0];

            const adminData =
              adminDoc.data();


            console.log('=================================');
            console.log('ADMIN PROFILE FOUND');
            console.log('=================================');

            console.log(
              'Admin document ID:',
              adminDoc.id
            );

            console.log(
              'Admin data:',
              adminData
            );

            console.log(
              'Admin role:',
              adminData.role
            );


            // ------------------------------------------
            // VERIFY ROLE
            // ------------------------------------------

            if (adminData.role === 'admin') {

              adminFound = true;


              const adminProfile = {

                ...adminData,

                // Firebase UID
                uid: firebaseUser.uid,

                // Admin name
                displayName:
                  adminData.name ||
                  firebaseUser.displayName ||
                  '',

                // Firebase email
                email:
                  firebaseUser.email,

                // Email verification status
                emailVerified:
                  firebaseUser.emailVerified,

                // Firestore document ID
                adminDocumentId:
                  adminDoc.id,

                // Explicit role
                role: 'admin',
              };


              setUserProfile(adminProfile);

              setIsAdmin(true);

              setLoading(false);


              console.log(
                'ADMIN VERIFIED'
              );

              console.log(
                'isAdmin:',
                true
              );


              // ----------------------------------------
              // ADMIN FOUND
              // ----------------------------------------
              //
              // No need to listen to students.
              //
              // ----------------------------------------

              if (unsubscribeStudent) {

                unsubscribeStudent();

                unsubscribeStudent = null;
              }

              return;
            }
          }


          // =================================================
          // STEP 2: IF NOT ADMIN, CHECK STUDENTS
          // =================================================

          if (!adminFound) {

            console.log(
              'No admin profile found.'
            );

            console.log(
              'Checking students collection...'
            );


            // --------------------------------------------
            // STUDENT DOCUMENT
            // --------------------------------------------
            //
            // students/{firebaseUser.uid}
            //
            // --------------------------------------------

            const studentRef =
              query(
                collection(db, 'students'),
                where(
                  'uid',
                  '==',
                  firebaseUser.uid
                )
              );


            // --------------------------------------------
            // STUDENT LISTENER
            // --------------------------------------------

            unsubscribeStudent =
              onSnapshot(

                studentRef,

                (studentSnapshot) => {

                  if (
                    studentSnapshot.empty
                  ) {

                    console.warn(
                      'No student profile found for UID:',
                      firebaseUser.uid
                    );

                    setUserProfile(null);
                    setIsAdmin(false);
                    setLoading(false);

                    return;
                  }


                  const studentDoc =
                    studentSnapshot.docs[0];

                  const profileData =
                    studentDoc.data();


                  // --------------------------------------
                  // STUDENT PROFILE
                  // --------------------------------------

                  const role =
                    profileData.role ||
                    'student';


                  const profile = {

                    ...profileData,

                    uid:
                      firebaseUser.uid,

                    email:
                      firebaseUser.email,

                    displayName:
                      profileData.display_name ||
                      firebaseUser.displayName ||
                      '',

                    emailVerified:
                      firebaseUser.emailVerified,

                    role,
                  };


                  setUserProfile(profile);

                  setIsAdmin(false);

                  setLoading(false);


                  console.log('=================================');
                  console.log('STUDENT PROFILE FOUND');
                  console.log('=================================');

                  console.log(
                    'Student data:',
                    profileData
                  );

                  console.log(
                    'Role:',
                    role
                  );

                  console.log(
                    'Is admin:',
                    false
                  );
                }
              );
          }
        },


        // ----------------------------------------------
        // ADMIN FIRESTORE ERROR
        // ----------------------------------------------

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


      // ----------------------------------------------
      // STORE CLEANUP FUNCTION
      // ----------------------------------------------

      unsubscribeFirestore = () => {

        if (unsubscribeAdmin) {
          unsubscribeAdmin();
        }

        if (unsubscribeStudent) {
          unsubscribeStudent();
        }
      };
    });


    // ------------------------------------------------
    // COMPONENT CLEANUP
    // ------------------------------------------------

    return () => {

      unsubscribeAuth();

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };

  }, []);


  // ------------------------------------------------
  // LOGOUT
  // ------------------------------------------------

  const logout = async () => {

    try {

      await signOut();

      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);

    } catch (error) {

      console.error(
        'Logout error:',
        error
      );

      throw error;
    }
  };


  // ------------------------------------------------
  // REFRESH PROFILE
  // ------------------------------------------------

  const refreshProfile = async () => {

    console.log(
      'Profile is synchronized automatically using onSnapshot().'
    );
  };


  // ------------------------------------------------
  // CONTEXT VALUE
  // ------------------------------------------------

  const value = {

    user,

    userProfile,

    isAdmin,

    loading,

    logout,

    refreshProfile,

    isAuthenticated: !!user,
  };


  // ------------------------------------------------
  // PROVIDER
  // ------------------------------------------------

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuthContext = () => {
  const context =
    useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider'
    );
  }
  return context;
};
export default AuthContext;
