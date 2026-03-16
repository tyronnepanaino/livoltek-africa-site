export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  image: string;
  gallery?: string[];
  features: string[];
  specifications: Record<string, string>;
  price?: string;
  status: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  authorRole?: string;
  tags: string[];
  status: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  parentSlug?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'published' | 'draft';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Solution {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  features: string[];
  benefits: string[];
  status: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
  heroSubtitle?: string;
  longDescription?: string;
  useCases?: SolutionUseCase[];
  processSteps?: SolutionProcessStep[];
  stats?: SolutionStat[];
  faqs?: SolutionFAQ[];
  idealFor?: string[];
  relatedProductCategories?: string[];
  secondaryImage?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  keywords?: string;
  relatedProducts?: SolutionRelatedProduct[];
  topologyDiagrams?: SolutionTopologyDiagram[];
}

export interface SolutionRelatedProduct {
  name: string;
  slug: string;
  image: string;
  category: string;
  description?: string;
}

export interface SolutionTopologyDiagram {
  title: string;
  image: string;
  description?: string;
}

export interface SolutionUseCase {
  title: string;
  description: string;
  icon: string;
}

export interface SolutionProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface SolutionStat {
  value: string;
  label: string;
  description?: string;
}

export interface SolutionFAQ {
  question: string;
  answer: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schemaMarkup?: object;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle?: string;
  projectLocation: string;
  projectType?: string;
  timeline?: string;
  additionalNotes?: string;
  lineItems: QuoteLineItem[];
  status: 'new' | 'contacted' | 'proposal_sent' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  productId: string;
  productTitle: string;
  productCategory: string;
  productImage: string;
  productSlug: string;
  quantity: number;
}

// --- Resources (datasheets, case studies, whitepapers, guides) ---

export type ResourceType = 'datasheet' | 'case-study' | 'whitepaper' | 'guide';

export const resourceTypeLabels: Record<ResourceType, string> = {
  'datasheet': 'Technical Datasheet',
  'case-study': 'Case Study',
  'whitepaper': 'Whitepaper',
  'guide': 'Guide',
};

export const resourceTypeColors: Record<ResourceType, { bg: string; text: string }> = {
  'datasheet': { bg: '#E6F3FF', text: '#009BFF' },
  'case-study': { bg: '#E8F5E9', text: '#27AE60' },
  'whitepaper': { bg: '#FFF3E0', text: '#E67E22' },
  'guide': { bg: '#F3E5F5', text: '#8E24AA' },
};

export interface Resource {
  id: string;
  title: string;
  slug: string;
  resourceType: ResourceType;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  author: string;
  authorRole?: string;
  tags: string[];
  targetKeywords?: string;
  relatedProductSlugs?: string[];
  relatedSolutionSlugs?: string[];
  status: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
