
import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import LoginForm from '../../components/forms/LoginForm';

import {
  signIn,
  signOut,
} from '../../firebase/authService';

import { db } from '../../firebase/firebaseConfig';

import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';


export default function AdminLoginPage() {

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const navigate =
    useNavigate();


  // ------------------------------------------------
  // ADMIN LOGIN
  // ------------------------------------------------

  const handleLogin =
    async (email, password) => {

      setLoading(true);
      setError('');


      try {

        // ============================================
        // STEP 1
        // FIREBASE AUTHENTICATION
        // ============================================

        console.log(
          '================================='
        );

        console.log(
          'ADMIN LOGIN STARTED'
        );

        console.log(
          '================================='
        );


        const firebaseUser =
          await signIn(
            email.trim(),
            password
          );


        console.log(
          'Firebase Authentication successful.'
        );

        console.log(
          'UID:',
          firebaseUser.uid
        );

        console.log(
          'Email:',
          firebaseUser.email
        );

        console.log(
          'Email verified:',
          firebaseUser.emailVerified
        );


        // ============================================
        // STEP 2
        // EMAIL VERIFICATION
        // ============================================

        if (!firebaseUser.emailVerified) {

          console.warn(
            'Admin email is not verified.'
          );


          await signOut();


          setError(
            'Please verify your email address before accessing the admin panel.'
          );

          return;
        }


        // ============================================
        // STEP 3
        // SEARCH ADMINS COLLECTION
        // ============================================
        //
        // admins
        //   └── document
        //        ├── authUid
        //        ├── email
        //        ├── name
        //        └── role: "admin"
        //
        // ============================================

        const adminQuery =
          query(
            collection(db, 'admins'),
            where(
              'authUid',
              '==',
              firebaseUser.uid
            )
          );


        const adminSnapshot =
          await getDocs(
            adminQuery
          );


        console.log(
          'Admin documents found:',
          adminSnapshot.size
        );


        // ============================================
        // STEP 4
        // ADMIN DOCUMENT EXISTS?
        // ============================================

        if (adminSnapshot.empty) {

          console.warn(
            'No admin record found for this UID.'
          );


          await signOut();


          setError(
            'Access denied. This account is not registered as an administrator.'
          );

          return;
        }


        // ============================================
        // STEP 5
        // GET ADMIN DATA
        // ============================================

        const adminDoc =
          adminSnapshot.docs[0];


        const adminData =
          adminDoc.data();


        console.log(
          '================================='
        );

        console.log(
          'ADMIN FIRESTORE DOCUMENT'
        );

        console.log(
          '================================='
        );

        console.log(
          'Document ID:',
          adminDoc.id
        );

        console.log(
          'Admin data:',
          adminData
        );

        console.log(
          'Role:',
          adminData.role
        );


        // ============================================
        // STEP 6
        // VERIFY ROLE
        // ============================================

        if (adminData.role !== 'admin') {

          console.warn(
            'Admin document exists but role is not admin.'
          );


          await signOut();


          setError(
            'Access denied. This account does not have administrator privileges.'
          );

          return;
        }


        // ============================================
        // STEP 7
        // VERIFY AUTH UID
        // ============================================

        if (
          adminData.authUid !==
          firebaseUser.uid
        ) {

          console.warn(
            'Firebase UID does not match admin authUid.'
          );


          await signOut();


          setError(
            'Admin account verification failed.'
          );

          return;
        }


        // ============================================
        // STEP 8
        // ADMIN VERIFIED
        // ============================================

        console.log(
          '================================='
        );

        console.log(
          'ADMIN LOGIN SUCCESSFUL'
        );

        console.log(
          '================================='
        );

        console.log(
          'UID:',
          firebaseUser.uid
        );

        console.log(
          'Email:',
          firebaseUser.email
        );

        console.log(
          'Name:',
          adminData.name
        );

        console.log(
          'Role:',
          adminData.role
        );


        // ============================================
        // STEP 9
        // NAVIGATE
        // ============================================

        navigate(
          '/admin/dashboard'
        );

      }


      // ============================================
      // ERROR
      // ============================================

      catch (err) {

        console.error(
          'Admin login error:',
          err
        );


        setError(
          err.message ||
          'Admin login failed.'
        );
      }


      // ============================================
      // FINISH
      // ============================================

      finally {

        setLoading(false);
      }
    };


  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (

    <div>

      <h2
        className="text-3xl font-extrabold mb-2"
        style={{
          color:
            'var(--color-text-primary)',
        }}
      >
        Admin Login
      </h2>


      <p
        className="text-base mb-8"
        style={{
          color:
            'var(--color-text-secondary)',
        }}
      >
        Access the admin panel
      </p>


      <LoginForm
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />

    </div>
  );
}
