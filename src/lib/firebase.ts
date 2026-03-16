import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDM_5el5NiySp2B03eBNYzTs-Uw9OOXzso",
  authDomain: "livoltek-africa.firebaseapp.com",
  databaseURL: "https://livoltek-africa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "livoltek-africa",
  storageBucket: "livoltek-africa.firebasestorage.app",
  messagingSenderId: "942890586427",
  appId: "1:942890586427:web:6280d0fc2fe2cdb6dc271e",
  measurementId: "G-WKSHEPKHLB"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let firestoreDisabled = false;

export const isFirebaseConfigured = () => firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";

export function disableFirestore() {
  firestoreDisabled = true;
  db = null;
}

export function isFirestoreDisabled() {
  return firestoreDisabled;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured() || firestoreDisabled) return null;
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (!isFirebaseConfigured()) return null;
  if (!storage) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      storage = getStorage(firebaseApp);
    }
  }
  return storage;
}
