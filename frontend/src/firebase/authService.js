/**
 * Firebase Authentication service helpers.
 *
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
import { normalizeEmail, validatePassword } from '../utils/authValidation';

// --------------------------------------------------
// SIGN UP
// --------------------------------------------------
export const signUp = async (email, password, displayName) => {
  const normalizedEmail = normalizeEmail(email);
  validatePassword(password);

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  await updateProfile(userCredential.user, {
    displayName,
  });

  await sendEmailVerification(userCredential.user);

  return userCredential.user;
};

// --------------------------------------------------
// SIGN IN
// --------------------------------------------------
export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
};

// --------------------------------------------------
// SIGN OUT
// --------------------------------------------------
export const signOut = async () => {
  await firebaseSignOut(auth);
};

// --------------------------------------------------
// GET ID TOKEN
// --------------------------------------------------
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  return user.getIdToken();
};

// --------------------------------------------------
// AUTH STATE LISTENER
// --------------------------------------------------
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// --------------------------------------------------
// RESET PASSWORD
// --------------------------------------------------
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// --------------------------------------------------
// SEND EMAIL VERIFICATION
// --------------------------------------------------
export const verifyEmail = async () => {
  const user = auth.currentUser;
  if (user) {
    await sendEmailVerification(user);
  }
};
