/**
 * SCHEMA.ORG STRUCTURED DATA GENERATORS — Livoltek Africa
 * =========================================================
 *
 * Pure functions that return JSON-LD objects. These replace the React
 * components in seo.tsx (OrganizationSchema, ProductSchema, etc.)
 *
 * In Astro, these are called in page frontmatter and passed to
 * BaseLayout via the jsonLd prop. The layout serializes them into
 * <script type="application/ld+json"> tags in the static HTML <head>.
 *
 * No React, no useEffect, no DOM manipulation — just data.
 */

import { companyInfo } from './mockData';
import type { Product, Insight, Resource, Solution } from './types';

// ─── Organization ─────────────────────────────────────────

export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyInfo.name,
    legalName: companyInfo.legalName,
    url: companyInfo.url,
    logo: `${companyInfo.url}/logo.png`,
    description: companyInfo.description,
    foundingDate: companyInfo.founded,
    email: companyInfo.email,
    telephone: companyInfo.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: companyInfo.address.street,
      addressLocality: companyInfo.address.city,
      addressRegion: companyInfo.address.region,
      postalCode: companyInfo.address.postalCode,
      addressCountry: companyInfo.address.country,
    },
    sameAs: [
      companyInfo.social.linkedin,
      companyInfo.social.twitter,
      companyInfo.social.facebook,
      companyInfo.social.youtube,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: companyInfo.phone,
      contactType: 'sales',
      email: companyInfo.email,
      areaServed: 'Africa',
      availableLanguage: ['English'],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: companyInfo.googleReviews.ratingValue,
      reviewCount: companyInfo.googleReviews.reviewCount,
      bestRating: companyInfo.googleReviews.bestRating,
      worstRating: companyInfo.googleReviews.worstRating,
    },
    knowsAbout: [
      'Commercial Solar Energy',
      'Industrial Solar Inverters',
      'Battery Energy Storage Systems',
      'EV Charging Stations',
      'Solar PV Systems Africa',
      'Load Shedding Solutions South Africa',
      'C&I Solar Solutions',
    ],
  };
}

// ─── WebSite ──────────────────────────────────────────────

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: companyInfo.name,
    url: companyInfo.url,
    description: companyInfo.description,
    publisher: {
      '@type': 'Organization',
      name: companyInfo.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${companyInfo.url}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ─── LocalBusiness ────────────────────────────────────────

export function buildLocalBusinessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyInfo.name,
    image: `${companyInfo.url}/logo.png`,
    url: companyInfo.url,
    telephone: companyInfo.phone,
    email: companyInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: companyInfo.address.street,
      addressLocality: companyInfo.address.city,
      addressRegion: companyInfo.address.region,
      postalCode: companyInfo.address.postalCode,
      addressCountry: companyInfo.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -25.9862,
      longitude: 28.1274,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:30',
      closes: '17:00',
    },
    priceRange: '$$$$',
    areaServed: {
      '@type': 'Continent',
      name: 'Africa',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: companyInfo.googleReviews.ratingValue,
      reviewCount: companyInfo.googleReviews.reviewCount,
      bestRating: companyInfo.googleReviews.bestRating,
      worstRating: companyInfo.googleReviews.worstRating,
    },
  };
}

// ─── Product ──────────────────────────────────────────────

export function buildProductSchema(product: Product): Record<string, unknown> {
  const cleanDescription = product.description.replace(/<[^>]*>/g, '').substring(0, 500);
  const productUrl = `${companyInfo.url}/products/${product.slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: cleanDescription,
    image: product.image,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: 'Livoltek',
    },
    manufacturer: {
      '@type': 'Organization',
      name: companyInfo.name,
      url: companyInfo.url,
    },
    category: product.category,
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: companyInfo.name,
      },
    },
    potentialAction: {
      '@type': 'QuoteAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${companyInfo.url}/contact/quote-request`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      name: 'Request a Quote',
    },
  };

  if (product.specifications && Object.keys(product.specifications).length > 0) {
    schema.additionalProperty = Object.entries(product.specifications).map(
      ([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value,
      }),
    );
  }

  return schema;
}

// ─── Article (for Insights & Resources) ───────────────────

export function buildArticleSchema(article: {
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  author: string;
  publishedAt?: string;
  updatedAt: string;
  tags?: string[];
  category?: string;
  content?: string;
}, basePath = 'insights'): Record<string, unknown> {
  const articleUrl = `${companyInfo.url}/${basePath}/${article.slug}`;
  const wordCount = article.content
    ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    url: articleUrl,
    datePublished: article.publishedAt || article.updatedAt,
    dateModified: article.updatedAt,
    inLanguage: 'en-ZA',
    ...(article.category && { articleSection: article.category }),
    ...(article.tags?.length && { keywords: article.tags.join(', ') }),
    ...(wordCount && { wordCount }),
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: companyInfo.name,
      logo: {
        '@type': 'ImageObject',
        url: `${companyInfo.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.prose', 'h1', 'meta[name="description"]'],
    },
  };
}

// ─── Service (for Solutions) ──────────────────────────────

export function buildServiceSchema(service: {
  title: string;
  description: string;
  image: string;
  slug: string;
  features?: string[];
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    image: service.image,
    url: `${companyInfo.url}/solutions/${service.slug}`,
    provider: {
      '@type': 'Organization',
      name: companyInfo.name,
      url: companyInfo.url,
    },
    areaServed: {
      '@type': 'Continent',
      name: 'Africa',
    },
    serviceType: 'Solar Energy Solutions',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} Products`,
      itemListElement: (service.features || []).map((feature) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: feature,
        },
      })),
    },
  };
}

// ─── SiteNavigationElement ────────────────────────────────

export function buildSiteNavigationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: companyInfo.url,
    hasPart: [
      { '@type': 'WebPage', name: 'Products', url: `${companyInfo.url}/products` },
      { '@type': 'WebPage', name: 'Solutions', url: `${companyInfo.url}/solutions` },
      { '@type': 'WebPage', name: 'Insights', url: `${companyInfo.url}/insights` },
      { '@type': 'WebPage', name: 'About', url: `${companyInfo.url}/about` },
      { '@type': 'WebPage', name: 'Contact', url: `${companyInfo.url}/contact` },
    ],
  };
}

// ─── FAQ ──────────────────────────────────────────────────

export function buildFAQSchema(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ─── Breadcrumb ───────────────────────────────────────────

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── ItemList ─────────────────────────────────────────────

export function buildItemListSchema(
  items: { name: string; url: string; image?: string; position?: number }[],
  listName?: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(listName && { name: listName }),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: item.position ?? index + 1,
      name: item.name,
      url: item.url,
      ...(item.image && { image: item.image }),
    })),
  };
}

// ─── CollectionPage ───────────────────────────────────────

export function buildCollectionPageSchema(name: string, description: string, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: companyInfo.name,
      url: companyInfo.url,
    },
    publisher: {
      '@type': 'Organization',
      name: companyInfo.name,
      url: companyInfo.url,
    },
  };
}
