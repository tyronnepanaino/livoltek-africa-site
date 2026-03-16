# Livoltek Africa — React SPA to Astro Migration Guide

## Overview

This guide maps every part of your existing React + Vite SPA to the new Astro architecture. The goal: **perfect SEO stability** via static HTML generation, while keeping the admin portal as a fully interactive React island.

---

## What Astro Replaces

| Old (React SPA)                        | New (Astro)                                  | Why It's Better for SEO                     |
|----------------------------------------|----------------------------------------------|---------------------------------------------|
| `vite-plugin-og-tags.ts`              | `BaseLayout.astro` `<head>` section          | OG tags are per-page at build time          |
| `scripts/inject-og-tags.mjs`          | **Deleted** — each `.astro` page has its own | No post-build script needed                 |
| `scripts/prerender.mjs`               | **Deleted** — Astro SSG is native            | Every page is static HTML by default        |
| `SEOHead` (imperative DOM upserts)    | Declarative `<head>` in `.astro` templates   | Crawlers see tags without executing JS      |
| `JsonLd` React component              | `<script type="application/ld+json">` inline | Zero JS overhead for structured data        |
| `react-router` (`createBrowserRouter`) | Astro file-based routing                     | No JS router needed for public pages        |
| `Layout.tsx` (React component)        | `BaseLayout.astro` (Astro layout)            | Static HTML shell, no hydration             |
| `GoogleAnalytics.tsx` (SPA tracker)   | Inline `<script>` in `BaseLayout.astro`      | GTM + page tracking in static HTML          |
| `StoreProvider` (global React context) | Only used in admin island                    | Public pages have zero React overhead       |

---

## Architecture

```
PUBLIC PAGES (100% static HTML, zero JS)
├── / (index.astro)
├── /products (products/index.astro)
├── /products/[slug] (products/[slug].astro) ← getStaticPaths from Firestore
├── /solutions (solutions/index.astro)
├── /solutions/[slug] (solutions/[slug].astro) ← getStaticPaths from mockData
├── /insights (insights/index.astro)
├── /insights/[slug] (insights/[slug].astro) ← getStaticPaths from Firestore
├── /resources (resources/index.astro)
├── /resources/[slug] (resources/[slug].astro) ← getStaticPaths from Firestore
├── /about (about.astro)
├── /contact (contact/index.astro) + ContactForm React island
├── /contact/quote-request (contact/quote-request.astro) + QuoteForm React island
└── /404 (404.astro)

REACT ISLANDS (hydrated on client, minimal JS)
├── HeaderMobileMenu.tsx (client:idle — mobile hamburger)
├── FloatingWhatsApp.tsx (client:idle — scroll-based visibility)
├── CookieConsent.tsx (client:idle — localStorage + gtag consent)
├── ContactForm.tsx (client:visible — form interactivity)
└── QuoteForm.tsx (client:visible — multi-step form + Firestore)

ADMIN PORTAL (client:only="react" — full React SPA)
└── /admin/[...path].astro → AdminApp.tsx (handles all admin routing internally)
```

---

## Step-by-Step Migration

### 1. Create the Astro Project

```bash
# On your local machine
mkdir livoltek-africa-astro
cd livoltek-africa-astro

# Copy the scaffold files from /astro-migration/
# (the files created in this Figma Make session)
cp -r /path/to/astro-migration/* .

# Install dependencies
pnpm install
```

### 2. Copy Shared Files (No Changes Needed)

These files transfer directly — no modifications required:

```
src/lib/types.ts          → src/lib/types.ts
src/lib/firebase.ts       → src/lib/firebase.ts
src/lib/firebaseService.ts → src/lib/firebaseService.ts
src/lib/analytics.ts      → src/lib/analytics.ts
src/lib/mockData.ts       → src/lib/mockData.ts
src/lib/store.tsx         → src/lib/store.tsx  (used by admin island only)
firebase.json             → firebase.json
public/robots.txt         → public/robots.txt
public/images/*           → public/images/*
```

### 3. Copy React Components (Minor Changes)

These components need `react-router` imports removed since they're now used as Astro islands:

| Component                | Change Required                                    |
|--------------------------|---------------------------------------------------|
| `FloatingWhatsApp.tsx`   | None — already standalone                         |
| `CookieConsent.tsx`      | None — already standalone                         |
| `RichTextEditor.tsx`     | None — admin only                                 |
| All `ui/*.tsx` (shadcn)  | None — copy as-is                                 |
| All admin pages          | Remove `react-router` Link/useParams imports*     |

*Admin pages use `react-router` for navigation. In the Astro version, the AdminApp.tsx wrapper provides its own navigation context. See the admin section below.

### 4. Convert Public Pages to .astro

For each public page (`HomePage.tsx`, `ProductsPage.tsx`, etc.):

1. **Create the `.astro` file** using the scaffold as a template
2. **Copy the JSX** from the React component into the Astro template
3. **Replace React patterns** with Astro equivalents:

```diff
  // BEFORE (React)
- import { Link } from 'react-router';
- import { useStore } from '../lib/store';
- import { SEOHead } from '../lib/seo';
  
  // AFTER (Astro frontmatter)
+ import BaseLayout from '../layouts/BaseLayout.astro';
+ import { fetchProductsStatic } from '../lib/firestore-static';
+ const products = await fetchProductsStatic();

  // BEFORE (React JSX)
- <Link to="/products/solar-inverter">View Product</Link>
  
  // AFTER (Astro template)
+ <a href="/products/solar-inverter">View Product</a>

  // BEFORE (React)
- <SEOHead title="Products" description="..." />
  
  // AFTER (Astro — passed as layout props)
+ <BaseLayout title="Products" description="...">
```

### 5. Convert Header & Footer

**Header:**
- The desktop nav is fully static (Astro component)
- Active link highlighting uses `Astro.url.pathname` instead of `useLocation()`
- Mobile menu toggle is a React island (`HeaderMobileMenu.tsx`)

**Footer:**
- 100% static — just replace `<Link>` with `<a>` tags

### 6. Set Up the Admin Portal

The admin portal stays as a full React application, mounted via `client:only="react"`:

```
src/pages/admin/[...path].astro  → catch-all route
src/components/admin/AdminApp.tsx → React entry point
```

**AdminApp.tsx** wraps everything in `<StoreProvider>` and handles routing internally:

Option A: **Simple window.location routing** (scaffold provides this)
Option B: **React Router MemoryRouter** (if you want full react-router compat)

For Option B:
```tsx
import { MemoryRouter, Routes, Route } from 'react-router';
// All admin routes go here
```

### 7. Handle Firestore Data at Build Time

The `firestore-static.ts` module replaces all three build scripts:

```
scripts/prerender.mjs        → DELETED (Astro SSG handles this)
scripts/inject-og-tags.mjs   → DELETED (OG tags are in .astro templates)
scripts/generate-sitemap.mjs → OPTIONAL (Astro can auto-generate sitemap)
```

**For automatic sitemap generation, install `@astrojs/sitemap`:**

```bash
pnpm add @astrojs/sitemap
```

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [react(), sitemap()],
  // ...
});
```

### 8. Update firebase.json

The existing `firebase.json` works almost unchanged. One tweak:

```json
{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "/admin/**",
        "destination": "/admin/index.html"
      }
    ]
  }
}
```

The `**` catch-all rewrite is **only needed for admin** (client-side routing). All public pages are pre-rendered static HTML, so no rewrite is needed.

### 9. Deploy

```bash
# Build
pnpm build

# Preview locally
pnpm preview

# Deploy to Firebase Hosting
pnpm deploy
```

---

## Files Eliminated by Migration

These files are **no longer needed** in the Astro project:

| File                                | Reason                                           |
|-------------------------------------|--------------------------------------------------|
| `plugins/vite-plugin-og-tags.ts`    | OG tags are in each `.astro` page                |
| `scripts/inject-og-tags.mjs`        | Per-route tags are native in Astro               |
| `scripts/prerender.mjs`             | Astro SSG generates static HTML natively         |
| `src/app/lib/seo.tsx`               | Replaced by `schema.ts` (pure functions) + layout props |
| `src/app/components/analytics/GoogleAnalytics.tsx` | Replaced by inline `<script>` in layout |
| `src/app/components/ChunkErrorBoundary.tsx` | No lazy chunks for public pages          |
| `src/app/lib/prerender.config.ts`   | Astro determines routes from file system         |
| `src/app/routes.tsx`                | File-based routing replaces this entirely         |
| `src/app/App.tsx`                   | Astro is the entry point                         |

---

## React Islands Quick Reference

| Component             | Directive          | Why                                        |
|----------------------|--------------------|--------------------------------------------|
| `HeaderMobileMenu`   | `client:idle`      | Hamburger toggle needs JS                  |
| `FloatingWhatsApp`   | `client:idle`      | Scroll listener + analytics tracking       |
| `CookieConsent`      | `client:idle`      | localStorage + gtag consent update         |
| `ContactForm`        | `client:visible`   | Form validation + Firestore submit         |
| `QuoteForm`          | `client:visible`   | Multi-step form + cart + Firestore         |
| `AdminApp`           | `client:only="react"` | Full React app, no SSR needed          |

**Directive meanings:**
- `client:idle` — Hydrate when browser is idle (good for above-fold interactive elements)
- `client:visible` — Hydrate when element scrolls into view (good for below-fold forms)
- `client:only="react"` — Client-side only, no SSR at all (good for auth-gated admin)

---

## SEO Improvements Over the Old SPA

1. **Zero JS for crawlers** — Googlebot, Bingbot, LinkedIn, Facebook all see complete HTML
2. **No more 3-layer OG pipeline** — Tags are directly in each page's `<head>` at build time
3. **Faster Time to First Byte** — Static HTML served directly, no JS bundle parsing
4. **Correct canonical URLs** — Set per-page in Astro, not via DOM manipulation
5. **JSON-LD in `<head>`** — Not injected via useEffect, visible in initial HTML
6. **No soft 404 risk** — Astro generates real 404 pages and real static pages for every route
7. **Sitemap auto-generation** — `@astrojs/sitemap` reads your routes automatically

---

## Checklist Before Deploy

- [ ] All public pages converted to `.astro` files
- [ ] `mockData.ts` and `types.ts` copied unchanged
- [ ] `firebase.ts`, `firebaseService.ts`, `analytics.ts` copied unchanged
- [ ] `store.tsx` copied (used by admin island)
- [ ] All shadcn/ui components copied to `src/components/ui/`
- [ ] `RichTextEditor.tsx` copied (admin only)
- [ ] Admin pages copied to `src/pages-react/admin/`
- [ ] `public/images/` contains logo, og-default.jpg, etc.
- [ ] `firebase.json` updated with admin-only rewrite
- [ ] `robots.txt` copied
- [ ] GTM container ID correct in `BaseLayout.astro`
- [ ] GA4 ID correct in `analytics.ts`
- [ ] Firebase config correct in `firebase.ts` and `firestore-static.ts`
- [ ] Run `pnpm build` and verify all pages generated
- [ ] Run `pnpm preview` and test all routes
- [ ] Test LinkedIn Post Inspector with a product/resource URL
- [ ] Test Google Rich Results with a product URL
- [ ] Deploy with `pnpm deploy`
