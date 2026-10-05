import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { auth, isFirebaseConfigured } from './firebase';

const LOCAL_SESSION_KEY = 'private_notes_mock_user_session_v1';
const LOCAL_ACCOUNTS_KEY = 'private_notes_mock_accounts_v1';

type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

function notifyListeners(user: User | null) {
  listeners.forEach((callback) => {
    try {
      callback(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

function getStoredMockUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setStoredMockUser(user: { uid: string; email: string } | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to update local user session:', e);
  }
}

function getStoredAccounts(): Record<string, { uid: string; email: string; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccount(email: string, passwordHash: string, uid: string) {
  try {
    const accounts = getStoredAccounts();
    accounts[email.toLowerCase()] = { uid, email, passwordHash };
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save local account:', e);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }

  // Local mock auth mode
  listeners.add(callback);
  const current = getStoredMockUser();
  // Fire initial state asynchronously to match onAuthStateChanged behavior
  setTimeout(() => {
    callback(current);
  }, 0);

  return () => {
    listeners.delete(callback);
  };
}

export async function registerUser(email: string, password: string) {
  if (isFirebaseConfigured && auth) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Local fallback registration
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();

  if (accounts[normalizedEmail]) {
    const error: any = new Error('Email already registered');
    error.code = 'auth/email-already-in-use';
    throw error;
  }

  if (password.length < 6) {
    const error: any = new Error('Password must be at least 6 characters');
    error.code = 'auth/weak-password';
    throw error;
  }

  const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  saveAccount(normalizedEmail, password, uid);

  const mockUser = {
    uid,
    email: normalizedEmail,
  } as unknown as User;

  setStoredMockUser({ uid, email: normalizedEmail });
  notifyListeners(mockUser);

  return { user: mockUser };
}

export async function loginUser(email: string, password: string) {
  if (isFirebaseConfigured && auth) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Local fallback login
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const account = accounts[normalizedEmail];

  if (!account || account.passwordHash !== password) {
    const error: any = new Error('Invalid email or password');
    error.code = 'auth/invalid-credential';
    throw error;
  }

  const mockUser = {
    uid: account.uid,
    email: account.email,
  } as unknown as User;

  setStoredMockUser({ uid: account.uid, email: account.email });
  notifyListeners(mockUser);

  return { user: mockUser };
}

export async function loginAsGuest() {
  if (isFirebaseConfigured && auth) {
    // If Firebase configured, could use anonymous sign-in or let them sign up
  }

  const guestUser = {
    uid: 'usr_guest_local',
    email: 'guest@privatenotes.local',
  } as unknown as User;

  setStoredMockUser({ uid: 'usr_guest_local', email: 'guest@privatenotes.local' });
  notifyListeners(guestUser);
  return { user: guestUser };
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    return signOut(auth);
  }

  setStoredMockUser(null);
  notifyListeners(null);
}