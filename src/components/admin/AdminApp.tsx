/**
 * ADMIN APP — Full React Application (Client-Only Island)
 * =========================================================
 *
 * Mounted with client:only="react" in /pages/admin/[...path].astro.
 * Includes: authentication gate, sidebar navigation, and all admin pages.
 * Uses the "trapped scroll container" pattern — the sidebar is fixed
 * and the main content area scrolls independently.
 */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { StoreProvider, useStore } from '../../lib/store';
import { Toaster, toast } from 'sonner';

// Lazy-load admin pages
const AdminDashboard = lazy(() => import('../../pages-react/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('../../pages-react/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import('../../pages-react/admin/AdminProductForm').then(m => ({ default: m.AdminProductForm })));
const AdminInsights = lazy(() => import('../../pages-react/admin/AdminInsights').then(m => ({ default: m.AdminInsights })));
const AdminInsightForm = lazy(() => import('../../pages-react/admin/AdminInsightForm').then(m => ({ default: m.AdminInsightForm })));
const AdminQuotes = lazy(() => import('../../pages-react/admin/AdminQuotes').then(m => ({ default: m.AdminQuotes })));
const AdminResources = lazy(() => import('../../pages-react/admin/AdminResources').then(m => ({ default: m.AdminResources })));
const AdminResourceForm = lazy(() => import('../../pages-react/admin/AdminResourceForm').then(m => ({ default: m.AdminResourceForm })));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#009BFF] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[#5A6A7E]" style={{ fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NAV ITEMS                                                          */
/* ------------------------------------------------------------------ */
const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'Insights',
    href: '/admin/insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    label: 'Resources',
    href: '/admin/resources',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Quote Requests',
    href: '/admin/quotes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  LOGIN SCREEN                                                       */
/* ------------------------------------------------------------------ */
function LoginScreen() {
  const { signIn, authLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-[#009BFF] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#5A6A7E]" style={{ fontSize: '0.9375rem' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-[#0C2340] mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Livoltek Admin
            </h1>
            <p className="text-[#5A6A7E]" style={{ fontSize: '0.875rem' }}>
              Sign in to manage your website content
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3" style={{ fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
                placeholder="admin@livoltek.africa"
              />
            </div>

            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#009BFF] hover:bg-[#0080D9] disabled:opacity-60 text-white py-2.5 rounded-lg transition-colors"
              style={{ fontSize: '0.9375rem', fontWeight: 600 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR                                                            */
/* ------------------------------------------------------------------ */
function AdminSidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (to: string) => void }) {
  const { signOut, currentUser, products, insights, resources, quoteRequests } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const counts: Record<string, number> = {
    '/admin/products': products.length,
    '/admin/insights': insights.length,
    '/admin/resources': resources.length,
    '/admin/quotes': quoteRequests.length,
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <aside
      className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} shrink-0 bg-[#0C2340] text-white flex flex-col transition-all duration-200`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        {!collapsed && (
          <span style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Livoltek Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            {collapsed ? (
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/admin' && currentPath.startsWith(item.href));
          const count = counts[item.href];

          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#009BFF] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                      }`}
                      style={{ fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Sign Out */}
      <div className="border-t border-white/10 px-3 py-3">
        {!collapsed && currentUser && (
          <div className="text-white/50 truncate mb-2 px-3" style={{ fontSize: '0.75rem' }}>
            {currentUser.email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          style={{ fontSize: '0.875rem' }}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Back to site */}
        <a
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1"
          style={{ fontSize: '0.875rem' }}
          title={collapsed ? 'Back to Site' : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {!collapsed && <span>Back to Site</span>}
        </a>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  ADMIN ROUTER (with sidebar layout)                                 */
/* ------------------------------------------------------------------ */
function AdminRouter() {
  const { isAdmin, authLoading } = useStore();
  const [path, setPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/admin'
  );

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, '', to);
    setPath(to);
  };

  // Auth gate
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-[#009BFF] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#5A6A7E]" style={{ fontSize: '0.9375rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <LoginScreen />;
  }

  // Route matching
  const route = path.replace(/\/$/, '') || '/admin';

  const renderPage = () => {
    if (route === '/admin') return <AdminDashboard />;
    if (route === '/admin/products') return <AdminProducts />;
    if (route === '/admin/products/new') return <AdminProductForm />;
    if (route.startsWith('/admin/products/edit/')) return <AdminProductForm />;
    if (route === '/admin/insights') return <AdminInsights />;
    if (route === '/admin/insights/new') return <AdminInsightForm />;
    if (route.startsWith('/admin/insights/edit/')) return <AdminInsightForm />;
    if (route === '/admin/quotes') return <AdminQuotes />;
    if (route === '/admin/resources') return <AdminResources />;
    if (route === '/admin/resources/new') return <AdminResourceForm />;
    if (route.startsWith('/admin/resources/edit/')) return <AdminResourceForm />;

    return (
      <div className="p-6 text-center">
        <h1 className="text-[#0C2340] mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>404</h1>
        <p className="text-[#5A6A7E]">Page not found</p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 text-[#009BFF] hover:underline"
          style={{ fontSize: '0.9375rem' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar currentPath={route} onNavigate={navigate} />

      {/* Trapped scroll container — main content scrolls, sidebar stays fixed */}
      <main className="flex-1 overflow-y-auto" style={{ height: '100vh' }}>
        <Suspense fallback={<PageLoadingFallback />}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ROOT EXPORT                                                        */
/* ------------------------------------------------------------------ */
interface Props {
  initialPath?: string;
}

export default function AdminApp({ initialPath }: Props) {
  return (
    <StoreProvider>
      <AdminRouter />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}
