import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Product, Insight, QuoteRequest, Resource } from './types';
import { initialProducts, initialInsights, initialResources } from './mockData';
import { isFirebaseConfigured, isFirestoreDisabled } from './firebase';
import * as fb from './firebaseService';

interface StoreContextType {
  products: Product[];
  insights: Insight[];
  quoteRequests: QuoteRequest[];
  resources: Resource[];
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  currentUser: { email: string; uid: string } | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  dataLoading: boolean;
  firebaseActive: boolean;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  addInsight: (i: Insight) => Promise<void>;
  updateInsight: (id: string, i: Partial<Insight>) => Promise<void>;
  deleteInsight: (id: string) => Promise<void>;
  getInsightBySlug: (slug: string) => Insight | undefined;
  addResource: (r: Resource) => Promise<void>;
  updateResource: (id: string, r: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  getResourceBySlug: (slug: string) => Resource | undefined;
  submitQuoteRequest: (q: QuoteRequest) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteRequest['status']) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const firebaseActive = isFirebaseConfigured();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [dataLoading, setDataLoading] = useState(firebaseActive);

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; uid: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(firebaseActive);

  const firestoreInitRef = useRef(false);

  // --- Firebase Auth Listener ---
  useEffect(() => {
    if (!firebaseActive) {
      setAuthLoading(false);
      return;
    }
    const unsub = fb.subscribeToAuth((user) => {
      if (user) {
        setCurrentUser({ email: user.email || '', uid: user.uid });
        setIsAdmin(true);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => { unsub?.(); };
  }, [firebaseActive]);

  // --- Firestore Real-Time Listeners ---
  useEffect(() => {
    if (!firebaseActive) {
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    let unsubProducts: (() => void) | null = null;
    let unsubInsights: (() => void) | null = null;
    let unsubResources: (() => void) | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    async function initFirestore() {
      const available = await fb.probeFirestoreAccess();

      if (cancelled) return;

      if (!available) {
        console.info(
          '[Livoltek] Firestore security rules are not deployed yet — the app will use demo data.\n' +
          'To enable live data, deploy the rules documented in /src/lib/firebase.ts to your Firebase Console:\n' +
          'https://console.firebase.google.com/project/livoltek-africa/firestore/rules'
        );
        setProducts(initialProducts);
        setInsights(initialInsights);
        firestoreInitRef.current = true;
        setDataLoading(false);
        return;
      }

      let productsLoaded = false;
      let insightsLoaded = false;

      const checkLoaded = () => {
        if (productsLoaded && insightsLoaded && !firestoreInitRef.current) {
          firestoreInitRef.current = true;
          setDataLoading(false);
        }
      };

      const handleProductsError = () => {
        if (!productsLoaded) {
          productsLoaded = true;
          checkLoaded();
        }
      };

      const handleInsightsError = () => {
        if (!insightsLoaded) {
          insightsLoaded = true;
          checkLoaded();
        }
      };

      unsubProducts = fb.subscribeToProducts((p) => {
        setProducts(p);
        productsLoaded = true;
        checkLoaded();
      }, handleProductsError);

      unsubInsights = fb.subscribeToInsights((i) => {
        setInsights(i);
        insightsLoaded = true;
        checkLoaded();
      }, handleInsightsError);

      unsubResources = fb.subscribeToResources(
        (r) => { setResources(r); },
        () => { /* Resources are non-critical */ }
      );

      timeout = setTimeout(() => {
        if (!firestoreInitRef.current) {
          console.warn('[Firestore] Init timeout — falling back to mock data');
          firestoreInitRef.current = true;
          setDataLoading(false);
        }
      }, 8000);
    }

    initFirestore();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      unsubProducts?.();
      unsubInsights?.();
      unsubResources?.();
    };
  }, [firebaseActive]);

  // --- Quote Requests Listener (auth-gated) ---
  useEffect(() => {
    if (!firebaseActive || !isAdmin) return;

    const unsubQuotes = fb.subscribeToQuoteRequests(
      (q) => { setQuoteRequests(q); },
      () => {}
    );

    if (!unsubQuotes) return;

    return () => { unsubQuotes(); };
  }, [firebaseActive, isAdmin]);

  // --- Auth Methods ---
  const signIn = useCallback(async (email: string, password: string) => {
    if (!firebaseActive) {
      setCurrentUser({ email, uid: 'demo-user' });
      setIsAdmin(true);
      return;
    }
    await fb.signIn(email, password);
  }, [firebaseActive]);

  const signOutFn = useCallback(async () => {
    if (!firebaseActive) {
      setCurrentUser(null);
      setIsAdmin(false);
      return;
    }
    await fb.signOut();
  }, [firebaseActive]);

  const isFirestoreUsable = useCallback(
    () => firebaseActive && !isFirestoreDisabled(),
    [firebaseActive]
  );

  // --- Products CRUD ---
  const addProduct = useCallback(async (p: Product) => {
    if (isFirestoreUsable()) {
      await fb.createProduct(p);
    } else {
      setProducts(prev => [p, ...prev]);
    }
  }, [isFirestoreUsable]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    if (isFirestoreUsable()) {
      await fb.updateFirestoreProduct(id, updates);
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    }
  }, [isFirestoreUsable]);

  const deleteProduct = useCallback(async (id: string) => {
    if (isFirestoreUsable()) {
      await fb.deleteFirestoreProduct(id);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  }, [isFirestoreUsable]);

  const getProductBySlug = useCallback((slug: string) => {
    return products.find(p => p.slug === slug);
  }, [products]);

  // --- Insights CRUD ---
  const addInsight = useCallback(async (i: Insight) => {
    if (isFirestoreUsable()) {
      await fb.createInsight(i);
    } else {
      setInsights(prev => [i, ...prev]);
    }
  }, [isFirestoreUsable]);

  const updateInsight = useCallback(async (id: string, updates: Partial<Insight>) => {
    if (isFirestoreUsable()) {
      await fb.updateFirestoreInsight(id, updates);
    } else {
      setInsights(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
    }
  }, [isFirestoreUsable]);

  const deleteInsight = useCallback(async (id: string) => {
    if (isFirestoreUsable()) {
      await fb.deleteFirestoreInsight(id);
    } else {
      setInsights(prev => prev.filter(i => i.id !== id));
    }
  }, [isFirestoreUsable]);

  const getInsightBySlug = useCallback((slug: string) => {
    return insights.find(i => i.slug === slug);
  }, [insights]);

  // --- Resources CRUD ---
  const addResource = useCallback(async (r: Resource) => {
    if (isFirestoreUsable()) {
      await fb.createResource(r);
    } else {
      setResources(prev => [r, ...prev]);
    }
  }, [isFirestoreUsable]);

  const updateResource = useCallback(async (id: string, updates: Partial<Resource>) => {
    if (isFirestoreUsable()) {
      await fb.updateFirestoreResource(id, updates);
    } else {
      setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    }
  }, [isFirestoreUsable]);

  const deleteResource = useCallback(async (id: string) => {
    if (isFirestoreUsable()) {
      await fb.deleteFirestoreResource(id);
    } else {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  }, [isFirestoreUsable]);

  const getResourceBySlug = useCallback((slug: string) => {
    return resources.find(r => r.slug === slug);
  }, [resources]);

  // --- Quote Requests ---
  const submitQuoteRequest = useCallback(async (q: QuoteRequest) => {
    if (isFirestoreUsable()) {
      await fb.submitQuoteRequest(q);
    } else {
      setQuoteRequests(prev => [q, ...prev]);
    }
  }, [isFirestoreUsable]);

  const updateQuoteStatus = useCallback(async (id: string, status: QuoteRequest['status']) => {
    if (isFirestoreUsable()) {
      await fb.updateQuoteRequestStatus(id, status);
    } else {
      setQuoteRequests(prev => prev.map(q => q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q));
    }
  }, [isFirestoreUsable]);

  return (
    <StoreContext.Provider value={{
      products, insights, quoteRequests, resources,
      isAdmin, setIsAdmin, currentUser, authLoading, signIn, signOut: signOutFn,
      dataLoading, firebaseActive,
      addProduct, updateProduct, deleteProduct, getProductBySlug,
      addInsight, updateInsight, deleteInsight, getInsightBySlug,
      addResource, updateResource, deleteResource, getResourceBySlug,
      submitQuoteRequest, updateQuoteStatus,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
