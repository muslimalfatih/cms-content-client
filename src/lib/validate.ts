import type { CreateJobRequest } from '@/types/job';

/** Lists are entered as comma-separated text and parsed on submit. */
export type FormValues = {
  name: string;
  location: string;
  services: string;
  serviceAreas: string;
  projects: string;
  usps: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof FormValues, string>>;

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
  services: '',
  serviceAreas: '',
  projects: '',
  usps: '',
  notes: '',
};

/**
 * Splits on commas and drops duplicates case-insensitively: two entries that
 * differ only in case slugify to the same route, which the backend rejects as
 * a duplicate.
 */
export function parseList(value: string): string[] {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const raw of value.split(',')) {
    const item = raw.trim();
    if (!item) continue;

    const key = item.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    items.push(item);
  }

  return items;
}

/**
 * Mirrors the backend DTO. The server stays the authority, but a round trip to
 * be told a required list is empty is worse than saying so immediately.
 *
 * services, serviceAreas and projects each require an entry because the three
 * detail route shapes are derived from them.
 */
export function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = 'Required.';
  else if (values.name.length > LIMITS.name)
    errors.name = `Must be ${LIMITS.name} characters or fewer.`;

  if (!values.location.trim()) errors.location = 'Required.';
  else if (values.location.length > LIMITS.location)
    errors.location = `Must be ${LIMITS.location} characters or fewer.`;

  for (const field of ['services', 'serviceAreas', 'projects'] as const) {
    const list = parseList(values[field]);

    if (list.length === 0)
      errors[field] = 'Add at least one, separated by commas.';
    else if (list.length > MAX_ITEMS) errors[field] = `At most ${MAX_ITEMS}.`;
    else if (list.some((item) => item.length > LIMITS[field]))
      errors[field] =
        `Each entry must be ${LIMITS[field]} characters or fewer.`;
  }

  const usps = parseList(values.usps);
  if (usps.length > MAX_ITEMS) errors.usps = `At most ${MAX_ITEMS}.`;
  else if (usps.some((item) => item.length > LIMITS.usps))
    errors.usps = `Each entry must be ${LIMITS.usps} characters or fewer.`;

  return errors;
}

export function toRequest(values: FormValues): CreateJobRequest {
  const usps = parseList(values.usps);

  return {
    name: values.name.trim(),
    location: values.location.trim(),
    services: parseList(values.services),
    serviceAreas: parseList(values.serviceAreas),
    projects: parseList(values.projects),
    ...(usps.length ? { usps } : {}),
    // The backend keeps rawAnswers verbatim, so free-text notes ride along
    // without needing a field of their own.
    ...(values.notes.trim()
      ? { rawAnswers: { notes: values.notes.trim() } }
      : {}),
  };
}

/** Pages the backend will produce: five index pages plus one per listed item. */
export function pageCount(values: FormValues): number {
  return (
    5 +
    parseList(values.services).length +
    parseList(values.serviceAreas).length +
    parseList(values.projects).length
  );
}

export { MAX_ITEMS };
