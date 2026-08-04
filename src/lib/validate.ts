import type { CreateJobRequest } from '@/types/job';

export type FormValues = {
  name: string;
  location: string;
  services: string[];
  serviceAreas: string[];
  projects: string[];
  usps: string[];
  notes: string;
};

export type FieldErrors = Partial<Record<keyof FormValues, string>>;

/**
 * Mirrors the backend DTO. Duplicated deliberately: the server is the authority
 * and rejects bad input regardless, but a round trip to be told a required list
 * is empty is a worse experience than saying so immediately.
 *
 * services, serviceAreas and projects each require an entry because the three
 * detail route shapes are derived from them.
 */
const LIMITS = {
  name: 120,
  location: 120,
  services: 120,
  serviceAreas: 120,
  projects: 160,
  usps: 160,
} as const;

const MAX_ITEMS = 12;

export const EMPTY_FORM: FormValues = {
  name: '',
  location: '',
  services: [],
  serviceAreas: [],
  projects: [],
  usps: [],
  notes: '',
};

export function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = 'Required.';
  else if (values.name.length > LIMITS.name)
    errors.name = `Must be ${LIMITS.name} characters or fewer.`;

  if (!values.location.trim()) errors.location = 'Required.';
  else if (values.location.length > LIMITS.location)
    errors.location = `Must be ${LIMITS.location} characters or fewer.`;

  for (const field of ['services', 'serviceAreas', 'projects'] as const) {
    const list = values[field];
    if (list.length === 0) errors[field] = 'Add at least one.';
    else if (list.some((item) => item.length > LIMITS[field]))
      errors[field] =
        `Each entry must be ${LIMITS[field]} characters or fewer.`;
  }

  if (values.usps.some((item) => item.length > LIMITS.usps))
    errors.usps = `Each entry must be ${LIMITS.usps} characters or fewer.`;

  return errors;
}

export function toRequest(values: FormValues): CreateJobRequest {
  return {
    name: values.name.trim(),
    location: values.location.trim(),
    services: values.services,
    serviceAreas: values.serviceAreas,
    projects: values.projects,
    ...(values.usps.length ? { usps: values.usps } : {}),
    // The backend keeps rawAnswers verbatim, so free-text notes ride along
    // without needing a column of their own.
    ...(values.notes.trim()
      ? { rawAnswers: { notes: values.notes.trim() } }
      : {}),
  };
}

export { MAX_ITEMS };
