// Firebase configuration
// This file will be initialized when user sets up Firebase project

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase config - Replace with your actual config from Firebase Console
// Firebase Console → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Auto-connect to emulators only when explicitly enabled
// Set VITE_USE_FIREBASE_EMULATOR=true to use local emulators
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (useEmulator && isLocalhost) {
  // Auth emulator
  try {
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
  } catch (error) {
    // Already connected or emulator not running
    console.log('Auth emulator connection skipped:', error.message);
  }
  
  // Firestore emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Already connected or emulator not running
    console.log('Firestore emulator connection skipped:', error.message);
  }
  
  // Functions emulator - Must be connected BEFORE any function calls
  try {
    // Always try to connect - Firebase SDK will handle if already connected
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('🔧 Firebase Emulators connected (Functions, Firestore, Auth)');
  } catch (error) {
    // Already connected or emulator not running - this is OK
    if (error.message && error.message.includes('already been initialized')) {
      console.log('🔧 Firebase Emulators already connected');
    } else {
    console.warn('Functions emulator connection issue:', error.message);
    }
  }
  
  // Storage emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔧 Storage emulator connected');
  } catch (error) {
    // Already connected or emulator not running
    console.log('Storage emulator connection skipped:', error.message);
  }
}

export default app;

