/**
 * Mirrors the backend's Zod contract. These names are the wire format and are
 * not negotiable: `name` rather than `businessName`, and `serviceAreas` and
 * `projects` are required because the service-area and portfolio detail routes
 * are derived from them.
 */

export const JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const PAGE_TYPES = [
  'home',
  'about',
  'services_index',
  'service_detail',
  'service_areas_index',
  'service_area_detail',
  'portfolio_index',
  'portfolio_detail',
] as const;

export type PageType = (typeof PAGE_TYPES)[number];

export const COMPONENTS = [
  'Header',
  'Hero',
  'About',
  'PortfolioGalleries',
  'ServicesCard',
  'CoreValues',
  'USPs',
  'CTA',
  'Footer',
] as const;

export type ComponentName = (typeof COMPONENTS)[number];

export interface LabelledLink {
  label: string;
  link: string;
}

export interface TitledEntry {
  title: string;
  description: string;
}

export interface LinkedEntry extends TitledEntry {
  link: string;
}

/**
 * A discriminated union so rendering a section is exhaustive rather than a cast.
 * The shapes match the backend's section schemas exactly.
 */
export type Section =
  | { component: 'Header'; content: { logoText: string; navLinks: LabelledLink[] } }
  | {
      component: 'Hero';
      content: { h1: string; subheadline: string; primaryButton: LabelledLink };
    }
  | { component: 'About'; content: { h2: string; body: string } }
  | { component: 'PortfolioGalleries'; content: { h2: string; items: LinkedEntry[] } }
  | { component: 'ServicesCard'; content: { h2: string; cards: LinkedEntry[] } }
  | { component: 'CoreValues'; content: { h2: string; values: TitledEntry[] } }
  | { component: 'USPs'; content: { h2: string; items: TitledEntry[] } }
  | {
      component: 'CTA';
      content: { h2: string; body: string; primaryButton: LabelledLink };
    }
  | {
      component: 'Footer';
      content: {
        columns: { heading: string; links: LabelledLink[] }[];
        legal: string;
      };
    };

export interface Page {
  route: string;
  type: PageType;
  titleTag: string;
  metaDescription: string;
  sections: Section[];
}

export interface WebsiteDocument {
  pages: Page[];
}

/** Response body of `GET /jobs/:id`. */
export interface JobResult {
  businessId: string;
  status: JobStatus;
  /** Present only when `status` is `completed`. */
  website?: WebsiteDocument;
  /** SEO issues that did not fail the job. */
  warnings?: string[];
  /** Present only when `status` is `failed`. */
  errorMessage?: string;
}

/** Request body of `POST /jobs`. */
export interface CreateJobRequest {
  name: string;
  location: string;
  services: string[];
  serviceAreas: string[];
  projects: string[];
  usps?: string[];
  /** Free-form context retained by the backend; used here for notes and tone. */
  rawAnswers?: Record<string, string>;
}

export interface CreateJobResponse {
  jobId: string;
}

export function isSettled(status: JobStatus): boolean {
  return status === 'completed' || status === 'failed';
}
