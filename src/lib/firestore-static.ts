/**
 * BUILD-TIME FIRESTORE FETCHER — Livoltek Africa
 * =================================================
 *
 * Used by Astro's getStaticPaths() and page frontmatter to fetch data
 * from Firestore during `astro build`. This replaces:
 *   - The Firestore fetch logic in scripts/prerender.mjs
 *   - The Firestore fetch logic in scripts/generate-sitemap.mjs
 *   - The Firestore fetch logic in scripts/inject-og-tags.mjs
 *
 * All three build scripts are now unnecessary — Astro handles everything.
 *
 * IMPORTANT: This module uses the Firebase JS SDK (client-side SDK),
 * NOT firebase-admin. It reads Firestore using the same public read
 * rules as the website. No service account or special credentials needed.
 *
 * If Firestore is unreachable (offline, CORS, rules not deployed),
 * callers should catch the error and fall back to mockData.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Product, Insight, Resource } from './types';

// ─── Firebase Config (same as your existing firebase.ts) ──
const firebaseConfig = {
  apiKey: 'AIzaSyDM_5el5NiySp2B03eBNYzTs-Uw9OOXzso',
  authDomain: 'livoltek-africa.firebaseapp.com',
  databaseURL: 'https://livoltek-africa-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'livoltek-africa',
  storageBucket: 'livoltek-africa.firebasestorage.app',
  messagingSenderId: '942890586427',
  appId: '1:942890586427:web:6280d0fc2fe2cdb6dc271e',
  measurementId: 'G-WKSHEPKHLB',
};

/** Get or create the Firebase app (safe for repeated imports during build) */
function getOrCreateApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/** Convert Firestore Timestamps to ISO strings */
function toPlainObject<T>(data: Record<string, any>): T {
  const cleaned = { ...data };
  for (const key of Object.keys(cleaned)) {
    const val = cleaned[key];
    if (val && typeof val === 'object' && typeof val.toDate === 'function') {
      cleaned[key] = val.toDate().toISOString();
    }
  }
  return cleaned as T;
}

// ─── Fetch Functions ──────────────────────────────────────

export async function fetchProductsStatic(): Promise<Product[]> {
  const app = getOrCreateApp();
  const db = getFirestore(app);
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toPlainObject<Product>({ id: d.id, ...d.data() }));
}

export async function fetchInsightsStatic(): Promise<Insight[]> {
  const app = getOrCreateApp();
  const db = getFirestore(app);
  const snap = await getDocs(query(collection(db, 'insights'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toPlainObject<Insight>({ id: d.id, ...d.data() }));
}

export async function fetchResourcesStatic(): Promise<Resource[]> {
  const app = getOrCreateApp();
  const db = getFirestore(app);
  const snap = await getDocs(query(collection(db, 'resources'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toPlainObject<Resource>({ id: d.id, ...d.data() }));
}
