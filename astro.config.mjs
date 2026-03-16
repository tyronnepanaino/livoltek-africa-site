/**
 * ASTRO CONFIGURATION — Livoltek Africa
 * =======================================
 *
 * Static output mode: all pages are pre-rendered at build time.
 * React integration: React components are used as "islands" for
 * interactive UI (admin portal, forms, cookie consent, etc.)
 *
 * Key differences from the old Vite SPA:
 *   - No more prerender.mjs — Astro natively generates static HTML
 *   - No more inject-og-tags.mjs — OG tags are in each .astro page's <head>
 *   - No more vite-plugin-og-tags.ts — build-time HTML injection is native
 *   - No more imperative DOM SEOHead — <head> is declarative in layouts
 *   - GTM + Consent Mode v2 are in BaseLayout.astro <head> directly
 */

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Static site generation — every page becomes an HTML file
  output: 'static',

  // Your production domain (used for canonical URLs, sitemap, etc.)
  site: 'https://www.livoltek.africa',

  // Firebase Hosting serves from dist/
  outDir: 'dist',

  // React integration for interactive "islands"
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // Build-time options
  build: {
    // Generate clean URLs: /about → /about/index.html
    // Matches firebase.json cleanUrls: true
    format: 'directory',
  },

  // Redirect configuration (replaces firebase.json redirects for dev)
  redirects: {
    '/home': '/',
  },
});