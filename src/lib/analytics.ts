/**
 * GOOGLE TAG MANAGER (GTM-ONLY) — Livoltek Africa
 * =================================================
 */

export const GA_MEASUREMENT_ID = 'G-Y23QXNBCDT';
export const GTM_CONTAINER_ID = 'GTM-M68GMNKH';

export const isAnalyticsConfigured = (): boolean =>
  GTM_CONTAINER_ID !== '' && !GTM_CONTAINER_ID.includes('XXXXXXX');

export const isGTMConfigured = isAnalyticsConfigured;

// --- Consent Management (Consent Mode v2) ---

const CONSENT_KEY = 'livoltek_analytics_consent';

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

export function grantAnalyticsConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, 'granted');
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }
}

export function revokeAnalyticsConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, 'denied');
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

// --- DataLayer Push ---

export function pushToDataLayer(
  event: string,
  data?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

// --- GA4 Event Helpers ---

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  pushToDataLayer(eventName, params);
}

export function trackPageView(path: string, title?: string): void {
  pushToDataLayer('virtual_pageview', {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
  });
}

// --- Pre-built Conversion Events ---

export function trackProductView(product: {
  id: string;
  title: string;
  category: string;
}): void {
  trackEvent('view_item', {
    item_id: product.id,
    item_name: product.title,
    item_category: product.category,
    content_type: 'product',
  });
}

export function trackQuoteRequest(data: {
  productCount: number;
  projectType?: string;
}): void {
  trackEvent('generate_lead', {
    event_category: 'Quote Request',
    event_label: data.projectType || 'general',
    value: data.productCount,
  });
}

export function trackContactSubmission(subject: string): void {
  trackEvent('contact_form_submission', {
    event_category: 'Contact',
    event_label: subject,
  });
}

export function trackPhoneClick(): void {
  trackEvent('click_to_call', {
    event_category: 'Engagement',
    event_label: 'Phone CTA',
  });
}

export function trackWhatsAppClick(): void {
  trackEvent('click_to_whatsapp', {
    event_category: 'Engagement',
    event_label: 'WhatsApp CTA',
  });
}

export function trackInsightView(insight: {
  id: string;
  title: string;
  category: string;
}): void {
  trackEvent('view_item', {
    item_id: insight.id,
    item_name: insight.title,
    item_category: insight.category,
    content_type: 'insight',
  });
}

// --- TypeScript global augmentation ---

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: Record<string, unknown>[];
  }
}
