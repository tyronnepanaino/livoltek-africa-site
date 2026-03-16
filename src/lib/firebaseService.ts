import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, type Unsubscribe, serverTimestamp, limit,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getDb, getFirebaseAuth, isFirebaseConfigured, disableFirestore, getFirebaseStorage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product, Insight, QuoteRequest, Resource } from './types';

function isPermissionDenied(error: any): boolean {
  return error?.code === 'permission-denied' || error?.message?.includes('permission-denied');
}

function logFirestoreWarning(collectionName: string, error: any) {
  if (isPermissionDenied(error)) {
    console.warn(
      `[Firestore] Permission denied on "${collectionName}" — deploy security rules in Firebase Console. Falling back to local data.`
    );
  } else {
    console.warn(`[Firestore] Subscription error on "${collectionName}":`, error.message || error);
  }
}

export async function probeFirestoreAccess(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await getDocs(query(collection(db, 'products'), limit(1)));
    return true;
  } catch (error: any) {
    if (isPermissionDenied(error)) {
      disableFirestore();
      return false;
    }
    disableFirestore();
    return false;
  }
}

function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

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

// --- Products ---

export async function fetchProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toPlainObject<Product>({ id: d.id, ...d.data() }));
}

export function subscribeToProducts(callback: (products: Product[]) => void, onError?: (error: Error) => void): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  return onSnapshot(
    query(collection(db, 'products'), orderBy('createdAt', 'desc')),
    (snap) => {
      const products = snap.docs.map(d => toPlainObject<Product>({ id: d.id, ...d.data() }));
      callback(products);
    },
    (error) => {
      if (onError) { onError(error); } else { logFirestoreWarning('products', error); }
    }
  );
}

export async function createProduct(product: Product): Promise<string> {
  const db = getDb();
  if (!db) return product.id;
  const { id, ...data } = product;
  const docRef = doc(db, 'products', id);
  await setDoc(docRef, stripUndefined({ ...data, createdAt: product.createdAt, updatedAt: product.updatedAt }));
  return id;
}

export async function updateFirestoreProduct(id: string, updates: Partial<Product>): Promise<void> {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, stripUndefined({ ...updates, updatedAt: new Date().toISOString() }));
}

export async function deleteFirestoreProduct(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'products', id));
}

// --- Insights ---

export async function fetchInsights(): Promise<Insight[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'insights'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toPlainObject<Insight>({ id: d.id, ...d.data() }));
}

export function subscribeToInsights(callback: (insights: Insight[]) => void, onError?: (error: Error) => void): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  return onSnapshot(
    query(collection(db, 'insights'), orderBy('createdAt', 'desc')),
    (snap) => {
      const insights = snap.docs.map(d => toPlainObject<Insight>({ id: d.id, ...d.data() }));
      callback(insights);
    },
    (error) => {
      if (onError) { onError(error); } else { logFirestoreWarning('insights', error); }
    }
  );
}

export async function createInsight(insight: Insight): Promise<string> {
  const db = getDb();
  if (!db) return insight.id;
  const { id, ...data } = insight;
  const docRef = doc(db, 'insights', id);
  await setDoc(docRef, stripUndefined({ ...data, createdAt: insight.createdAt, updatedAt: insight.updatedAt }));
  return id;
}

export async function updateFirestoreInsight(id: string, updates: Partial<Insight>): Promise<void> {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, 'insights', id);
  await updateDoc(docRef, stripUndefined({ ...updates, updatedAt: new Date().toISOString() }));
}

export async function deleteFirestoreInsight(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'insights', id));
}

// --- Quote Requests ---

export async function submitQuoteRequest(quoteReq: QuoteRequest): Promise<string> {
  const db = getDb();
  if (!db) return quoteReq.id;
  const { id, ...data } = quoteReq;
  const docRef = doc(db, 'quoteRequests', id);
  await setDoc(docRef, data);
  return id;
}

export async function fetchQuoteRequests(): Promise<QuoteRequest[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'quoteRequests'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toPlainObject<QuoteRequest>({ id: d.id, ...d.data() }));
}

export function subscribeToQuoteRequests(callback: (quotes: QuoteRequest[]) => void, onError?: (error: Error) => void): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  return onSnapshot(
    query(collection(db, 'quoteRequests'), orderBy('createdAt', 'desc')),
    (snap) => {
      const quotes = snap.docs.map(d => toPlainObject<QuoteRequest>({ id: d.id, ...d.data() }));
      callback(quotes);
    },
    (error) => {
      if (onError) { onError(error); } else { logFirestoreWarning('quoteRequests', error); }
    }
  );
}

export async function updateQuoteRequestStatus(id: string, status: QuoteRequest['status']): Promise<void> {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, 'quoteRequests', id);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}

// --- Resources ---

export function subscribeToResources(callback: (resources: Resource[]) => void, onError?: (error: Error) => void): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  return onSnapshot(
    query(collection(db, 'resources'), orderBy('createdAt', 'desc')),
    (snap) => {
      const resources = snap.docs.map(d => toPlainObject<Resource>({ id: d.id, ...d.data() }));
      callback(resources);
    },
    (error) => {
      if (onError) { onError(error); } else { logFirestoreWarning('resources', error); }
    }
  );
}

export async function createResource(resource: Resource): Promise<string> {
  const db = getDb();
  if (!db) return resource.id;
  const { id, ...data } = resource;
  const docRef = doc(db, 'resources', id);
  await setDoc(docRef, stripUndefined({ ...data, createdAt: resource.createdAt, updatedAt: resource.updatedAt }));
  return id;
}

export async function updateFirestoreResource(id: string, updates: Partial<Resource>): Promise<void> {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, 'resources', id);
  await updateDoc(docRef, stripUndefined({ ...updates, updatedAt: new Date().toISOString() }));
}

export async function deleteFirestoreResource(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, 'resources', id));
}

// --- Firestore Seed ---

export async function seedFirestoreData(
  products: Product[],
  insights: Insight[]
): Promise<{ products: number; insights: number }> {
  const db = getDb();
  if (!db) throw new Error('Firestore is not available');

  let pCount = 0;
  let iCount = 0;

  for (const product of products) {
    const { id, ...data } = product;
    await setDoc(doc(db, 'products', id), stripUndefined({
      ...data,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
    pCount++;
  }

  for (const insight of insights) {
    const { id, ...data } = insight;
    await setDoc(doc(db, 'insights', id), stripUndefined({
      ...data,
      createdAt: insight.createdAt,
      updatedAt: insight.updatedAt,
    }));
    iCount++;
  }

  return { products: pCount, insights: iCount };
}

// --- Authentication ---

export async function signIn(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase is not configured');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await fbSignOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe | null {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  return onAuthStateChanged(auth, callback);
}

// --- Firebase Storage ---

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

export function uploadResourceFile(
  file: File,
  slug: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getFirebaseStorage();
    if (!storage) {
      reject(new Error('Firebase Storage is not configured'));
      return;
    }

    const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const storagePath = `resources/${slug}/${safeName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: { originalName: file.name },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percent: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          });
        }
      },
      (error) => {
        console.error('[Storage] Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

export async function deleteStorageFile(downloadUrl: string): Promise<void> {
  const storage = getFirebaseStorage();
  if (!storage) return;

  try {
    const storageRef = ref(storage, downloadUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error?.code !== 'storage/object-not-found') {
      console.warn('[Storage] Failed to delete file:', error.message || error);
    }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
