/**
 * Firebase SDK configuration and initialization.
 * Reads config values from Vite environment variables (VITE_ prefix).
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = apiKey && !apiKey.startsWith('your_');

let app = null;
let authInstance = null;
let dbInstance = null;
let storageInstance = null;

if (isConfigured) {
  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn(
    'WARNING: Firebase is running in mock mode. Please update your .env file with real Firebase credentials.'
  );
  // Create mock objects to prevent reference crashes on boot
  app = {};
  authInstance = {
    isMock: true,
    currentUser: null,
    _onAuthChangeCallback: null,
    onAuthStateChanged: (callback) => {
      authInstance._onAuthChangeCallback = callback;
      setTimeout(() => callback(authInstance.currentUser), 50);
      return () => {};
    },
  };
  dbInstance = {};
  storageInstance = {};
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

export default app;
