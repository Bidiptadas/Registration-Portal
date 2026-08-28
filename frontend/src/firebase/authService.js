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
    const accounts = getFromStore('tp_auth_users') || [];
    if (accounts.some((account) => account.email === email.toLowerCase())) {
      const error = new Error('An account with this email address already exists.');
      error.code = 'auth/email-already-in-use';
      throw error;
    }

    const uid = `mock-student-uid-${Date.now()}`;
    localStorage.setItem(
      'tp_auth_users',
      JSON.stringify([
        ...accounts,
        { uid, email: email.toLowerCase(), password, displayName },
      ])
    );

    const fakeUser = {
      uid,
      email: email.toLowerCase(),
      displayName,
      emailVerified: true,
      getIdToken: async () => `mock-student-token:${email.toLowerCase()}`,
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
    const normalizedEmail = email.trim().toLowerCase();
    const role = normalizedEmail.includes('admin') ? 'admin' : 'student';
    let displayName = 'Mock Student';
    let uid = 'mock-student-uid';
    if (role === 'student') {
      const accounts = getFromStore('tp_auth_users') || [];
      const account = accounts.find((item) => item.email === normalizedEmail);
      if (!account) {
        const error = new Error('No account exists with this email.');
        error.code = 'auth/user-not-found';
        throw error;
      }
      if (account.password !== password) {
        const error = new Error('Incorrect password.');
        error.code = 'auth/wrong-password';
        throw error;
      }
      displayName = account.displayName;
      uid = account.uid;
    } else {
      displayName = 'Mock Admin';
      uid = 'mock-admin-uid';
    }

    const fakeUser = {
      uid,
      email: normalizedEmail,
      displayName,
      emailVerified: true,
      getIdToken: async () => role === 'admin' ? 'mock-admin-token' : `mock-student-token:${normalizedEmail}`,
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
