/**
 * Firebase Authentication service helpers.
 * Wraps Firebase Auth SDK methods for use throughout the app.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { getFromStore } from '../services/mockDb';

/**
 * Register a new user with email and password.
 */
export const signUp = async (email, password, displayName) => {
  if (auth.isMock) {
    const fakeUser = {
      uid: `mock-student-uid-${Date.now()}`,
      email,
      displayName,
      getIdToken: async () => `mock-student-token:${email}`,
    };
    auth.currentUser = fakeUser;
    if (auth._onAuthChangeCallback) {
      auth._onAuthChangeCallback(fakeUser);
    }
    return fakeUser;
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

/**
 * Sign in with email and password.
 */
export const signIn = async (email, password) => {
  if (auth.isMock) {
    const role = email.includes('admin') ? 'admin' : 'student';
    let displayName = 'Mock Student';
    let uid = 'mock-student-uid';
    if (role === 'student') {
      const students = getFromStore('tp_students') || [];
      const student = students.find((s) => s.email.toLowerCase() === email.toLowerCase());
      if (student) {
        displayName = student.displayName;
        uid = student.uid;
      }
    } else {
      displayName = 'Mock Admin';
      uid = 'mock-admin-uid';
    }

    const fakeUser = {
      uid,
      email,
      displayName,
      getIdToken: async () => role === 'admin' ? 'mock-admin-token' : `mock-student-token:${email}`,
    };
    auth.currentUser = fakeUser;
    if (auth._onAuthChangeCallback) {
      auth._onAuthChangeCallback(fakeUser);
    }
    return fakeUser;
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  if (auth.isMock) {
    auth.currentUser = null;
    if (auth._onAuthChangeCallback) {
      auth._onAuthChangeCallback(null);
    }
    return;
  }
  await firebaseSignOut(auth);
};

/**
 * Get the current user's Firebase ID token.
 * Used to authenticate API requests.
 */
export const getIdToken = async () => {
  if (auth.isMock) {
    return auth.currentUser ? 'mock-id-token-xyz' : null;
  }
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

/**
 * Subscribe to auth state changes.
 * @param {Function} callback - Called with (user) on auth state change
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  if (auth.isMock) {
    auth._onAuthChangeCallback = callback;
    // Trigger immediately with current mock value
    setTimeout(() => callback(auth.currentUser), 0);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Send a password reset email.
 */
export const resetPassword = async (email) => {
  if (auth.isMock) return;
  await sendPasswordResetEmail(auth, email);
};

/**
 * Send email verification to the current user.
 */
export const verifyEmail = async () => {
  if (auth.isMock) return;
  const user = auth.currentUser;
  if (user) {
    await sendEmailVerification(user);
  }
};
