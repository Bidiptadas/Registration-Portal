import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseAuth = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  isMock: false,
  currentUser: null,
  _onAuthChangeCallback: null,
}));

const mockStore = vi.hoisted(() => new Map());

vi.mock('firebase/auth', () => firebaseAuth);
vi.mock('../src/firebase/firebaseConfig', () => ({ auth }));
vi.mock('../src/services/mockDb', () => ({
  getFromStore: (key) => mockStore.get(key) ?? [],
  saveToStore: (key, value) => mockStore.set(key, value),
}));

import {
  getIdToken,
  onAuthChange,
  signIn,
  signOut,
  signUp,
} from '../src/firebase/authService';
import { normalizeEmail, validatePassword } from '../src/utils/authValidation';

const installLocalStorage = () => {
  const values = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  });
};

describe('authentication validation', () => {
  it('trims and normalizes valid emails before submission', () => {
    expect(normalizeEmail('  Student@Example.COM ')).toBe('student@example.com');
  });

  it.each(['missing-at.example.com', 'student@', 'student example.com'])(
    'rejects malformed email %s',
    (email) => {
      expect(() => normalizeEmail(email)).toThrowError(/valid email/i);
    }
  );

  it.each(['shortA1', 'lowercase1!', 'Uppercase!', 'Uppercase1'])('rejects password %s', (password) => {
    expect(() => validatePassword(password)).toThrowError(/8 characters/i);
  });

  it('accepts a password with the required policy components', () => {
    expect(validatePassword('ValidPass1!')).toBe('ValidPass1!');
  });
});

describe('Firebase authentication service', () => {
  beforeEach(() => {
    installLocalStorage();
    mockStore.clear();
    auth.isMock = false;
    auth.currentUser = null;
    auth._onAuthChangeCallback = null;
    vi.clearAllMocks();
  });

  it('validates signup input before calling Firebase', async () => {
    await expect(signUp('bad email', 'ValidPass1!', 'Student')).rejects.toMatchObject({
      code: 'auth/invalid-email',
    });
    await expect(signUp('student@example.com', 'weak', 'Student')).rejects.toMatchObject({
      code: 'auth/weak-password',
    });
    expect(firebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('sends an email verification immediately after real Firebase signup', async () => {
    const user = { uid: 'uid-1', email: 'student@example.com', emailVerified: false };
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({ user });

    await expect(signUp(' Student@Example.com ', 'ValidPass1!', 'Student')).resolves.toBe(user);

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'student@example.com',
      'ValidPass1!'
    );
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(user);
  });

  it('reports duplicate, wrong-password, missing-user, and rate-limit errors unchanged', async () => {
    auth.isMock = true;
    mockStore.set('tp_auth_users', [
      { uid: 'uid-1', email: 'student@example.com', password: 'ValidPass1!', displayName: 'Student' },
    ]);

    await expect(signUp('student@example.com', 'ValidPass1!', 'Student')).rejects.toMatchObject({
      code: 'auth/email-already-in-use',
    });
    await expect(signIn('student@example.com', 'WrongPass1!')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    });
    await expect(signIn('missing@example.com', 'ValidPass1!')).rejects.toMatchObject({
      code: 'auth/user-not-found',
    });

    auth.isMock = false;
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/too-many-requests' });
    const rapidAttempts = Array.from({ length: 5 }, () => signIn('student@example.com', 'WrongPass1!'));
    const rapidResults = await Promise.allSettled(rapidAttempts);

    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(5);
    expect(rapidResults.every((result) => (
      result.status === 'rejected' && result.reason.code === 'auth/too-many-requests'
    ))).toBe(true);
  });

  it('observes authentication transitions and clears state on forced logout', async () => {
    const user = { uid: 'uid-1', email: 'student@example.com', emailVerified: true };
    const states = [];
    firebaseAuth.onAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(user);
      callback(null);
      return vi.fn();
    });

    onAuthChange((nextUser) => states.push(nextUser));
    expect(states).toEqual([user, null]);

    auth.isMock = true;
    auth.currentUser = user;
    await signOut();
    expect(auth.currentUser).toBeNull();
  });

  it('rehydrates the same user for repeated listeners after refresh or tab restoration', async () => {
    const user = { uid: 'uid-1', email: 'student@example.com', emailVerified: true };
    const states = [];
    auth.isMock = true;
    auth.currentUser = user;

    onAuthChange((nextUser) => states.push(nextUser));
    onAuthChange((nextUser) => states.push(nextUser));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(states).toEqual([user, user]);
    await expect(getIdToken()).resolves.toBe('mock-id-token-xyz');
  });
});