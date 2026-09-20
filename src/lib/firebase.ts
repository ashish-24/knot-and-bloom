import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'knot-and-bloom.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'knot-and-bloom',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'knot-and-bloom.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:demo123456',
};

export const isFirebaseConfigured = () => {
  if (typeof window === 'undefined') return false;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes('DemoKey'));
};

// Safe Lazy Getter for Firebase Auth Instance
export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

// Google 1-Click Sign In
export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Google Sign-In requires your Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) in .env file.');
  }
  const googleProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Email + Password Registration
export async function registerWithEmailPassword(email: string, pass: string) {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await sendEmailVerification(userCredential.user);
    } catch (e) {
      console.log('Email verification notice:', e);
    }
    return userCredential.user;
  } catch (e: any) {
    if (e.code === 'auth/api-key-not-valid' || e.code === 'auth/invalid-api-key') {
      return null;
    }
    throw e;
  }
}

// Email + Password Login
export async function loginWithEmailPassword(email: string, pass: string) {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (e: any) {
    if (e.code === 'auth/api-key-not-valid' || e.code === 'auth/invalid-api-key') {
      return null;
    }
    throw e;
  }
}

// Forgot Password Email Trigger
export async function resetCustomerPassword(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Password reset emails require your Firebase API key in .env file.');
  }
  await sendPasswordResetEmail(auth, email);
}
